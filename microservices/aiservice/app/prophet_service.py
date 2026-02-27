import pandas as pd
import numpy as np
from prophet import Prophet
from datetime import datetime, date, timedelta
from typing import Tuple, Optional, Dict
from loguru import logger

from app.config import settings
from app.database import mongodb_service


class ProphetPredictionService:
    """Service for stock price prediction using Prophet (Independent of TA-Lib/pandas-ta)"""

    def __init__(self):
        self.forecast_days = settings.PROPHET_FORECAST_DAYS
        self.changepoint_prior_scale = 0.25  # Tăng lên 0.25 để mô hình linh hoạt hơn
        self.seasonality_mode = settings.PROPHET_SEASONALITY_MODE
        self.interval_width = settings.PROPHET_INTERVAL_WIDTH

    async def predict(
        self,
        symbol: str,
        forecast_days: Optional[int] = None
    ) -> Optional[Dict]:
        """
        Predict stock price using Prophet
        """
        try:
            forecast_days = forecast_days or self.forecast_days
            
            # Fetch historical data
            historical_data = await mongodb_service.get_historical_prices(
                symbol=symbol,
                days=365  # Use 1 year of data for training
            )

            if len(historical_data) < 30:
                logger.info(f"⏭️ Skipping {symbol}: Insufficient data ({len(historical_data)} days)")
                return None

            # Prepare data
            df = self._prepare_data(historical_data)
            
            if df is None or len(df) < 50:
                logger.error(f"Insufficient data for TA on {symbol}")
                return None

            # Manual Calculation of Technical Indicators
            df = self._calculate_technical_indicators_manual(df)

            # Get current values
            current_price = df['y'].iloc[-1]
            current_rsi = df['RSI_14'].iloc[-1]
            current_ema20 = df['EMA_20'].iloc[-1]
            current_ema50 = df['EMA_50'].iloc[-1]
            current_macd = df['MACD_Line'].iloc[-1]
            
            # Prepare for Prophet
            prophet_df = df[['ds', 'y', 'volume']].copy()

            # Train and Forecast
            forecast_df = self._train_and_forecast(prophet_df, forecast_days)
            
            if forecast_df is None:
                return None

            # Results
            predicted_price = forecast_df['yhat'].iloc[-1]
            change_percent = ((predicted_price - current_price) / current_price) * 100
            lower_bound = forecast_df['yhat_lower'].iloc[-1]
            upper_bound = forecast_df['yhat_upper'].iloc[-1]

            # Logic Hybrid Recommendation
            recommendation = self._get_recommendation_label(
                change_percent, 
                current_rsi, 
                current_price, 
                current_ema20
            )

            result = {
                'symbol': symbol,
                'forecast_days': forecast_days,
                'prediction_date': (datetime.now() + timedelta(days=forecast_days)).date(),
                'current_price': float(current_price),
                'predicted_price': float(predicted_price),
                'change_percent': float(change_percent),
                'confidence_interval_lower': float(lower_bound),
                'confidence_interval_upper': float(upper_bound),
                'recommendation': recommendation,
                'rsi': float(current_rsi) if not pd.isna(current_rsi) else None,
                'macd': float(current_macd) if current_macd and not pd.isna(current_macd) else None,
                'ema_20': float(current_ema20) if not pd.isna(current_ema20) else None,
                'ema_50': float(current_ema50) if not pd.isna(current_ema50) else None,
                'created_at': datetime.utcnow()
            }

            return result

        except Exception as e:
            logger.error(f"Error predicting {symbol}: {e}")
            return None

    def _prepare_data(self, historical_data: list) -> Optional[pd.DataFrame]:
        try:
            df = pd.DataFrame(historical_data)
            df['ds'] = pd.to_datetime(df['datetime']).dt.tz_localize(None)
            df['y'] = pd.to_numeric(df['close'], errors='coerce')
            df['volume'] = pd.to_numeric(df['volume'], errors='coerce').fillna(0)
            
            df = df.sort_values('ds').drop_duplicates(subset=['ds'], keep='last')
            df = df[['ds', 'y', 'volume']].dropna()

            # Handle Outliers
            Q1 = df['y'].quantile(0.25)
            Q3 = df['y'].quantile(0.75)
            IQR = Q3 - Q1
            df['y'] = np.where(df['y'] < Q1 - 1.5 * IQR, Q1 - 1.5 * IQR, df['y'])
            df['y'] = np.where(df['y'] > Q3 + 1.5 * IQR, Q3 + 1.5 * IQR, df['y'])
            
            return df
        except Exception as e:
            logger.error(f"Error preparing data: {e}")
            return None

    def _calculate_technical_indicators_manual(self, df: pd.DataFrame) -> pd.DataFrame:
        """Manual calculation of indicators using pure pandas to avoid dependency hell"""
        try:
            df = df.copy()
            close = df['y']
            
            # --- RSI (14) using Wilder's Smoothing ---
            delta = close.diff()
            up = delta.where(delta > 0, 0)
            down = -delta.where(delta < 0, 0)
            
            # alpha = 1 / period for Wilder's
            avg_gain = up.ewm(alpha=1/14, min_periods=14, adjust=False).mean()
            avg_loss = down.ewm(alpha=1/14, min_periods=14, adjust=False).mean()
            rs = avg_gain / avg_loss
            df['RSI_14'] = 100 - (100 / (1 + rs))
            
            # --- EMA (20 & 50) ---
            df['EMA_20'] = close.ewm(span=20, adjust=False).mean()
            df['EMA_50'] = close.ewm(span=50, adjust=False).mean()
            
            # --- MACD (12, 26, 9) ---
            exp1 = close.ewm(span=12, adjust=False).mean()
            exp2 = close.ewm(span=26, adjust=False).mean()
            df['MACD_Line'] = exp1 - exp2
            df['MACD_Signal'] = df['MACD_Line'].ewm(span=9, adjust=False).mean()
            df['MACD_Hist'] = df['MACD_Line'] - df['MACD_Signal']
            
            return df
        except Exception as e:
            logger.error(f"Error manual calculation indicators: {e}")
            return df

    def _train_and_forecast(self, df: pd.DataFrame, forecast_days: int) -> Optional[pd.DataFrame]:
        try:
            model = Prophet(
                changepoint_prior_scale=self.changepoint_prior_scale,
                seasonality_mode=self.seasonality_mode,
                interval_width=self.interval_width,
                daily_seasonality=True,
                weekly_seasonality=True,
                yearly_seasonality=True
            )
            model.add_regressor('volume')
            model.fit(df)

            future = model.make_future_dataframe(periods=forecast_days)
            future['ds'] = future['ds'].dt.tz_localize(None)
            
            # Map volume to future (forward fill)
            vol_map = df[['ds', 'volume']].set_index('ds')
            future = future.join(vol_map, on='ds')
            future['volume'] = future['volume'].ffill().fillna(0)
            
            forecast = model.predict(future)
            return forecast[forecast['ds'] > df['ds'].max()]
        except Exception as e:
            logger.error(f"Error training: {e}")
            return None

    def _get_recommendation_label(self, change_percent: float, rsi: float, price: float, ema20: float) -> str:
        """
        Hybrid logic with override requested
        """
        # Dự báo từ AI
        is_prophet_up = change_percent > 0.5
        is_prophet_down = change_percent < -0.5

        # 1. Luật STRONG BUY: Prophet tăng + RSI chưa quá mua + Giá trên EMA20
        if is_prophet_up and (rsi < 70) and (price > ema20):
            return "STRONG_BUY"
        
        # 2. Luật lọc dự báo ngược: Nếu Prophet báo Bán nhưng RSI > 50 và Giá > EMA20 -> HOLD
        if is_prophet_down and (rsi > 50) and (price > ema20):
            return "HOLD"

        # 3. Luật STRONG SELL: Prophet giảm + Giá dưới EMA20
        if is_prophet_down and (price < ema20):
            return "STRONG_SELL"

        # 4. Standard rules backoff
        if change_percent >= 2.0:
            return "BUY" if rsi < 75 else "HOLD"
        elif change_percent >= 0.5:
            return "BUY" if price > ema20 else "HOLD"
        elif change_percent <= -2.0:
            return "SELL" if rsi > 25 else "HOLD"
        elif change_percent <= -0.5:
            return "SELL" if price < ema20 else "HOLD"
        
        return "HOLD"

    async def get_forecast_chart_data(self, symbol: str, forecast_days: Optional[int] = None, history_days: int = 90) -> Optional[Dict]:
        try:
            forecast_days = forecast_days or self.forecast_days
            historical_data = await mongodb_service.get_historical_prices(symbol=symbol, days=365)

            if len(historical_data) < 30:
                return None

            df = self._prepare_data(historical_data)
            df = self._calculate_technical_indicators_manual(df)
            
            current_price = df['y'].iloc[-1]
            current_rsi = df['RSI_14'].iloc[-1]
            current_ema20 = df['EMA_20'].iloc[-1]

            prophet_df = df[['ds', 'y', 'volume']].copy()
            model = Prophet(
                changepoint_prior_scale=self.changepoint_prior_scale,
                seasonality_mode=self.seasonality_mode,
                interval_width=self.interval_width
            )
            model.add_regressor('volume')
            model.fit(prophet_df)

            future = model.make_future_dataframe(periods=forecast_days)
            future['ds'] = future['ds'].dt.tz_localize(None)
            vol_map = df[['ds', 'volume']].set_index('ds')
            future = future.join(vol_map, on='ds')
            future['volume'] = future['volume'].ffill().fillna(0)
            
            forecast = model.predict(future)

            chart_data = []
            hist_df = df.tail(history_days)
            for _, row in hist_df.iterrows():
                f_row = forecast[forecast['ds'] == row['ds']]
                chart_data.append({
                    'date': row['ds'].strftime('%Y-%m-%d'),
                    'actual': float(row['y']),
                    'predicted': float(f_row['yhat'].iloc[0]) if not f_row.empty else None,
                    'lower': float(f_row['yhat_lower'].iloc[0]) if not f_row.empty else None,
                    'upper': float(f_row['yhat_upper'].iloc[0]) if not f_row.empty else None,
                })

            future_f = forecast[forecast['ds'] > df['ds'].max()]
            for _, row in future_f.iterrows():
                chart_data.append({
                    'date': row['ds'].strftime('%Y-%m-%d'),
                    'actual': None,
                    'predicted': float(row['yhat']),
                    'lower': float(row['yhat_lower']),
                    'upper': float(row['yhat_upper']),
                })

            predicted_price = future_f['yhat'].iloc[-1]
            change_percent = ((predicted_price - current_price) / current_price) * 100

            return {
                'symbol': symbol,
                'forecast_days': forecast_days,
                'current_price': float(current_price),
                'predicted_price': float(predicted_price),
                'change_percent': float(change_percent),
                'recommendation': self._get_recommendation_label(change_percent, current_rsi, current_price, current_ema20),
                'data': chart_data,
                'created_at': datetime.utcnow()
            }
        except Exception as e:
            logger.error(f"Error chart data: {e}")
            return None

    async def generate_recommendation(self, symbol: str, forecast_days: Optional[int] = None) -> Optional[Dict]:
        try:
            prediction = await self.predict(symbol, forecast_days)
            if prediction is None: return None

            rec = {
                'symbol': symbol,
                'period': datetime.combine(prediction['prediction_date'], datetime.min.time()),
                'buy': 40, 'hold': 40, 'sell': 20, # Simulated
                'strongBuy': 10, 'strongSell': 5,
                'created_at': datetime.utcnow(),
                'updated_at': datetime.utcnow(),
                'metadata': {
                    'predicted_price': prediction['predicted_price'],
                    'current_price': prediction['current_price'],
                    'change_percent': prediction['change_percent'],
                    'rsi': prediction.get('rsi'),
                    'ema_20': prediction.get('ema_20'),
                    'macd': prediction.get('macd')
                }
            }
            await mongodb_service.save_recommendation(rec)
            return rec
        except Exception as e:
            logger.error(f"Error recommendation: {e}")
            return None


# Global instance
prediction_service = ProphetPredictionService()
