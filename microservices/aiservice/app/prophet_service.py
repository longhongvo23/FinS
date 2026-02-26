import pandas as pd
import numpy as np
import pandas_ta as ta
from prophet import Prophet
from datetime import datetime, date, timedelta
from typing import Tuple, Optional, Dict
from loguru import logger

from app.config import settings
from app.database import mongodb_service


class ProphetPredictionService:
    """Service for stock price prediction using Prophet"""

    def __init__(self):
        self.forecast_days = settings.PROPHET_FORECAST_DAYS
        self.changepoint_prior_scale = settings.PROPHET_CHANGEPOINT_PRIOR_SCALE
        self.seasonality_mode = settings.PROPHET_SEASONALITY_MODE
        self.interval_width = settings.PROPHET_INTERVAL_WIDTH

    async def predict(
        self,
        symbol: str,
        forecast_days: Optional[int] = None
    ) -> Optional[Dict]:
        """
        Predict stock price using Prophet
        
        Args:
            symbol: Stock symbol
            forecast_days: Number of days to forecast (default from config)
            
        Returns:
            Dictionary with prediction results or None if failed
        """
        try:
            forecast_days = forecast_days or self.forecast_days
            
            # Fetch historical data
            historical_data = await mongodb_service.get_historical_prices(
                symbol=symbol,
                days=365  # Use 1 year of data for training
            )

            if len(historical_data) < 30:
                logger.info(
                    f"⏭️  Skipping {symbol}: Insufficient data ({len(historical_data)} days). "
                    f"Minimum 30 days required. Waiting for crawlservice to collect more data..."
                )
                return None

            # Prepare data for Prophet - keeping full dataframe structure for TA checks
            df = self._prepare_data(historical_data)
            
            if df is None or len(df) < 50:  # Require at least 50 days for EMA(50) calculation
                logger.error(f"Failed to prepare data or insufficient data for technical analysis for {symbol}")
                return None

            # Add Technical Indicators
            df = self._calculate_technical_indicators(df)

            # Extract the actual value at current time
            current_price = df['y'].iloc[-1]
            current_rsi = df['RSI_14'].iloc[-1]
            current_macd = df['MACD_12_26_9'].iloc[-1]
            current_ema20 = df['EMA_20'].iloc[-1]
            current_ema50 = df['EMA_50'].iloc[-1]
            
            # Prepare only requested columns for Prophet to ensure no warnings 
            prophet_df = df[['ds', 'y', 'volume']].copy()

            # Train model and forecast
            forecast_df = self._train_and_forecast(prophet_df, forecast_days)
            
            if forecast_df is None:
                logger.error(f"Failed to generate forecast for {symbol}")
                return None

            # Calculate recommendation
            current_price = df['y'].iloc[-1]
            predicted_price = forecast_df['yhat'].iloc[-1]
            change_percent = ((predicted_price - current_price) / current_price) * 100

            # Get confidence intervals
            lower_bound = forecast_df['yhat_lower'].iloc[-1]
            upper_bound = forecast_df['yhat_upper'].iloc[-1]

            # Get hybrid recommendation
            hybrid_rec = self._get_recommendation_label(
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
                'recommendation': hybrid_rec,
                'rsi': float(current_rsi) if not pd.isna(current_rsi) else None,
                'macd': float(current_macd) if not pd.isna(current_macd) else None,
                'ema_20': float(current_ema20) if not pd.isna(current_ema20) else None,
                'ema_50': float(current_ema50) if not pd.isna(current_ema50) else None,
                'created_at': datetime.utcnow()
            }

            logger.info(
                f"Prediction for {symbol}: {current_price:.2f} -> "
                f"{predicted_price:.2f} ({change_percent:+.2f}%)"
            )

            return result

        except Exception as e:
            logger.error(f"Error predicting {symbol}: {e}")
            return None

    def _prepare_data(self, historical_data: list) -> Optional[pd.DataFrame]:
        """Prepare data for Prophet model from time series collection"""
        try:
            # Convert to DataFrame
            df = pd.DataFrame(historical_data)
            
            # Prophet requires 'ds' (date) and 'y' (value) columns
            df['ds'] = pd.to_datetime(df['datetime'])
            df['y'] = pd.to_numeric(df['close'], errors='coerce')
            df['volume'] = pd.to_numeric(df['volume'], errors='coerce').fillna(0)
            
            # Add OHLC columns for TA tracking
            df['open'] = pd.to_numeric(df['open'], errors='coerce')
            df['high'] = pd.to_numeric(df['high'], errors='coerce')
            df['low'] = pd.to_numeric(df['low'], errors='coerce')
            
            # Sort by date
            df = df.sort_values('ds')
            
            # Remove duplicates
            df = df.drop_duplicates(subset=['ds'], keep='last')
            
            # Keep required columns
            df = df[['ds', 'y', 'volume', 'open', 'high', 'low']]
            
            # Remove NaN rows
            df = df.dropna()

            # Handle Outliers using IQR method
            Q1 = df['y'].quantile(0.25)
            Q3 = df['y'].quantile(0.75)
            IQR = Q3 - Q1
            lower_bound = Q1 - 1.5 * IQR
            upper_bound = Q3 + 1.5 * IQR

            # Cap outliers instead of removing to maintain time continuity
            df['y'] = np.where(df['y'] < lower_bound, lower_bound, df['y'])
            df['y'] = np.where(df['y'] > upper_bound, upper_bound, df['y'])
            
            logger.debug(f"Prepared {len(df)} data points for Prophet training")
            
            return df

        except Exception as e:
            logger.error(f"Error preparing data: {e}")
            return None

    def _calculate_technical_indicators(self, df: pd.DataFrame) -> pd.DataFrame:
        """Calculate technical indicators using pandas-ta"""
        try:
            # Reindex to avoid CopyWarning 
            df = df.copy()

            # Pass 'y' as 'close' for pandas-ta
            df.rename(columns={'y': 'close'}, inplace=True)
            
            # RSI (Relative Strength Index)
            df.ta.rsi(length=14, append=True)
            
            # MACD
            df.ta.macd(fast=12, slow=26, signal=9, append=True)
            
            # Exponential Moving Averages
            df.ta.ema(length=20, append=True)
            df.ta.ema(length=50, append=True)
            
            # Change name back for Prophet requirements
            df.rename(columns={'close': 'y'}, inplace=True)
            
            return df
        
        except Exception as e:
            logger.error(f"Error calculating technical indicators: {e}")
            return df

    def _train_and_forecast(
        self,
        df: pd.DataFrame,
        forecast_days: int
    ) -> Optional[pd.DataFrame]:
        """Train Prophet model and generate forecast"""
        try:
            # Initialize Prophet model
            model = Prophet(
                changepoint_prior_scale=self.changepoint_prior_scale,
                seasonality_mode=self.seasonality_mode,
                interval_width=self.interval_width,
                daily_seasonality=True,
                weekly_seasonality=True,
                yearly_seasonality=True
            )

            # Fit model
            model.add_regressor('volume')
            model.fit(df)

            # Create future dataframe
            future = model.make_future_dataframe(periods=forecast_days)
            
            # Adding regressors to future dataframe (forward filling latest volume)
            future['volume'] = df['volume'].iloc[-1]

            # Generate forecast
            forecast = model.predict(future)

            # Return only future predictions
            forecast_future = forecast[forecast['ds'] > df['ds'].max()]

            return forecast_future

        except Exception as e:
            logger.error(f"Error training/forecasting: {e}")
            return None

    def _get_recommendation_label(
        self, 
        change_percent: float, 
        rsi: float, 
        current_price: float, 
        ema20: float
    ) -> str:
        """Convert change percentage and TA to recommendation label"""
        
        # Prophet indicates UP trends
        prophet_up = change_percent > 0
        
        # Prophet indicates DOWN trends
        prophet_down = change_percent < 0
        
        # Hybrid Approach: Technical analysis filters Prophet prediction
        if prophet_up and rsi < 70 and current_price > ema20:
            return "STRONG_BUY"
        elif prophet_down and rsi > 30 and current_price < ema20:
            return "STRONG_SELL"
            
        # Standard Prophet rules backoff if conditions aren't perfectly met
        if change_percent >= settings.STRONG_BUY_THRESHOLD:
            # Mismatched analysis (e.g. AI says strong buy but RSI > 70/Overbought), tone down
            return "BUY" if rsi < 75 else "HOLD"
        elif change_percent >= settings.BUY_THRESHOLD:
            return "BUY" if current_price > ema20 else "HOLD"
        elif change_percent <= settings.STRONG_SELL_THRESHOLD:
            return "SELL" if rsi > 25 else "HOLD"
        elif change_percent <= settings.SELL_THRESHOLD:
            return "SELL" if current_price < ema20 else "HOLD"
        else:
            return "HOLD"

    async def generate_recommendation(
        self,
        symbol: str,
        forecast_days: Optional[int] = None
    ) -> Optional[Dict]:
        """
        Generate recommendation and save to database
        
        Returns:
            Recommendation dictionary with counts
        """
        try:
            # Get prediction
            prediction = await self.predict(symbol, forecast_days)
            
            if prediction is None:
                return None

            # Convert recommendation to counts
            # Simulating analyst recommendations based on our prediction
            recommendation_counts = self._prediction_to_counts(
                prediction['recommendation'],
                prediction['change_percent']
            )

            # Prepare recommendation document
            # Convert date to datetime for MongoDB compatibility
            period_datetime = datetime.combine(
                prediction['prediction_date'], 
                datetime.min.time()
            ) if isinstance(prediction['prediction_date'], date) else prediction['prediction_date']
            
            recommendation = {
                'symbol': symbol,
                'period': period_datetime,
                'buy': recommendation_counts['buy'],
                'hold': recommendation_counts['hold'],
                'sell': recommendation_counts['sell'],
                'strongBuy': recommendation_counts['strong_buy'],
                'strongSell': recommendation_counts['strong_sell'],
                'created_at': datetime.utcnow(),
                'updated_at': datetime.utcnow(),
                # Additional metadata
                'metadata': {
                    'predicted_price': prediction['predicted_price'],
                    'current_price': prediction['current_price'],
                    'change_percent': prediction['change_percent'],
                    'confidence_lower': prediction['confidence_interval_lower'],
                    'confidence_upper': prediction['confidence_interval_upper'],
                    'rsi': prediction.get('rsi'),
                    'macd': prediction.get('macd'),
                    'ema_20': prediction.get('ema_20'),
                    'ema_50': prediction.get('ema_50')
                }
            }

            # Save to database
            success = await mongodb_service.save_recommendation(recommendation)
            
            if success:
                logger.info(
                    f"Generated recommendation for {symbol}: "
                    f"{prediction['recommendation']}"
                )
                return recommendation
            else:
                logger.error(f"Failed to save recommendation for {symbol}")
                return None

        except Exception as e:
            logger.error(f"Error generating recommendation for {symbol}: {e}")
            return None

    def _prediction_to_counts(
        self,
        recommendation: str,
        change_percent: float
    ) -> Dict[str, int]:
        """
        Convert single prediction to analyst-style recommendation counts
        This simulates multiple analysts based on the prediction confidence
        """
        # Base distribution (total 100 analysts)
        total_analysts = 100
        
        # Distribute based on recommendation and confidence
        confidence = min(abs(change_percent) / 20.0, 1.0)  # Normalize to 0-1
        
        counts = {
            'strong_buy': 0,
            'buy': 0,
            'hold': 0,
            'sell': 0,
            'strong_sell': 0
        }

        if recommendation == "STRONG_BUY":
            counts['strong_buy'] = int(60 * confidence + 10)
            counts['buy'] = int(30 * confidence)
            counts['hold'] = total_analysts - counts['strong_buy'] - counts['buy']
        elif recommendation == "BUY":
            counts['buy'] = int(50 * confidence + 10)
            counts['strong_buy'] = int(20 * confidence)
            counts['hold'] = total_analysts - counts['buy'] - counts['strong_buy']
        elif recommendation == "HOLD":
            counts['hold'] = int(60 + 20 * confidence)
            counts['buy'] = int(10 + 10 * (1 - confidence))
            counts['sell'] = total_analysts - counts['hold'] - counts['buy']
        elif recommendation == "SELL":
            counts['sell'] = int(50 * confidence + 10)
            counts['strong_sell'] = int(20 * confidence)
            counts['hold'] = total_analysts - counts['sell'] - counts['strong_sell']
        else:  # STRONG_SELL
            counts['strong_sell'] = int(60 * confidence + 10)
            counts['sell'] = int(30 * confidence)
            counts['hold'] = total_analysts - counts['strong_sell'] - counts['sell']

        return counts

    async def get_forecast_chart_data(
        self,
        symbol: str,
        forecast_days: Optional[int] = None,
        history_days: int = 90
    ) -> Optional[Dict]:
        """
        Get forecast data for chart visualization
        
        Args:
            symbol: Stock symbol
            forecast_days: Number of days to forecast
            history_days: Number of historical days to include
            
        Returns:
            Dictionary with historical and forecast data for charting
        """
        try:
            forecast_days = forecast_days or self.forecast_days
            
            # Fetch historical data
            historical_data = await mongodb_service.get_historical_prices(
                symbol=symbol,
                days=365  # Use 1 year for training
            )

            if len(historical_data) < 30:
                logger.info(f"⏭️  Skipping {symbol}: Insufficient data ({len(historical_data)} days)")
                return None

            # Prepare data for Prophet
            df = self._prepare_data(historical_data)
            
            if df is None or len(df) < 50:
                logger.error(f"Failed to prepare data or insufficient data for technical analysis for {symbol}")
                return None

            # Add Technical Indicators
            df = self._calculate_technical_indicators(df)

            # Get current price and TA
            current_price = df['y'].iloc[-1]
            current_rsi = df['RSI_14'].iloc[-1]
            current_ema20 = df['EMA_20'].iloc[-1]

            prophet_df = df[['ds', 'y', 'volume']].copy()

            # Train Prophet model
            model = Prophet(
                changepoint_prior_scale=self.changepoint_prior_scale,
                seasonality_mode=self.seasonality_mode,
                interval_width=self.interval_width,
                daily_seasonality=True,
                weekly_seasonality=True,
                yearly_seasonality=True
            )
            model.add_regressor('volume')
            model.fit(prophet_df)

            # Create future dataframe (including historical for fitted values)
            future = model.make_future_dataframe(periods=forecast_days)
            future['volume'] = prophet_df['volume'].iloc[-1]
            forecast = model.predict(future)

            # Build chart data
            chart_data = []
            
            # Get last N days of historical data
            historical_df = df.tail(history_days)
            
            # Merge historical actual with forecast fitted values
            for _, row in historical_df.iterrows():
                date_str = row['ds'].strftime('%Y-%m-%d')
                forecast_row = forecast[forecast['ds'] == row['ds']]
                
                data_point = {
                    'date': date_str,
                    'actual': float(row['y']),
                    'predicted': float(forecast_row['yhat'].iloc[0]) if not forecast_row.empty else None,
                    'lower': float(forecast_row['yhat_lower'].iloc[0]) if not forecast_row.empty else None,
                    'upper': float(forecast_row['yhat_upper'].iloc[0]) if not forecast_row.empty else None,
                }
                chart_data.append(data_point)

            # Add future forecast data (no actual values)
            future_forecast = forecast[forecast['ds'] > df['ds'].max()]
            for _, row in future_forecast.iterrows():
                data_point = {
                    'date': row['ds'].strftime('%Y-%m-%d'),
                    'actual': None,
                    'predicted': float(row['yhat']),
                    'lower': float(row['yhat_lower']),
                    'upper': float(row['yhat_upper']),
                }
                chart_data.append(data_point)

            # Calculate summary
            predicted_price = future_forecast['yhat'].iloc[-1]
            change_percent = ((predicted_price - current_price) / current_price) * 100

            result = {
                'symbol': symbol,
                'forecast_days': forecast_days,
                'current_price': float(current_price),
                'predicted_price': float(predicted_price),
                'change_percent': float(change_percent),
                'recommendation': self._get_recommendation_label(
                    change_percent, 
                    current_rsi, 
                    current_price, 
                    current_ema20
                ),
                'data': chart_data,
                'created_at': datetime.utcnow()
            }

            logger.info(f"Generated forecast chart data for {symbol}: {len(chart_data)} data points")
            return result

        except Exception as e:
            logger.error(f"Error generating forecast chart data for {symbol}: {e}")
            return None


# Global instance
prediction_service = ProphetPredictionService()
