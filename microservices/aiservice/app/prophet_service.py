import pandas as pd
import numpy as np
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

            # Prepare data for Prophet
            df = self._prepare_data(historical_data)
            
            if df is None or df.empty:
                logger.error(f"Failed to prepare data for {symbol}")
                return None

            # Train model and forecast
            forecast_df = self._train_and_forecast(df, forecast_days)
            
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

            result = {
                'symbol': symbol,
                'forecast_days': forecast_days,
                'prediction_date': (datetime.now() + timedelta(days=forecast_days)).date(),
                'current_price': float(current_price),
                'predicted_price': float(predicted_price),
                'change_percent': float(change_percent),
                'confidence_interval_lower': float(lower_bound),
                'confidence_interval_upper': float(upper_bound),
                'recommendation': self._get_recommendation_label(change_percent),
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
            # datetime is already ISODate from time series collection
            df['ds'] = pd.to_datetime(df['datetime'])
            
            # close is stored as string in the data, convert to float
            df['y'] = pd.to_numeric(df['close'], errors='coerce')
            
            # Sort by date
            df = df.sort_values('ds')
            
            # Remove duplicates
            df = df.drop_duplicates(subset=['ds'], keep='last')
            
            # Keep only required columns
            df = df[['ds', 'y']]
            
            # Remove NaN values
            df = df.dropna()
            
            logger.debug(f"Prepared {len(df)} data points for Prophet training")
            
            return df

        except Exception as e:
            logger.error(f"Error preparing data: {e}")
            return None

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
            model.fit(df)

            # Create future dataframe
            future = model.make_future_dataframe(periods=forecast_days)

            # Generate forecast
            forecast = model.predict(future)

            # Return only future predictions
            forecast_future = forecast[forecast['ds'] > df['ds'].max()]

            return forecast_future

        except Exception as e:
            logger.error(f"Error training/forecasting: {e}")
            return None

    def _get_recommendation_label(self, change_percent: float) -> str:
        """Convert change percentage to recommendation label"""
        if change_percent >= settings.STRONG_BUY_THRESHOLD:
            return "STRONG_BUY"
        elif change_percent >= settings.BUY_THRESHOLD:
            return "BUY"
        elif change_percent >= settings.HOLD_THRESHOLD:
            return "HOLD"
        elif change_percent >= settings.SELL_THRESHOLD:
            return "SELL"
        else:
            return "STRONG_SELL"

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
                    'confidence_upper': prediction['confidence_interval_upper']
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
            
            if df is None or df.empty:
                logger.error(f"Failed to prepare data for {symbol}")
                return None

            # Get current price
            current_price = df['y'].iloc[-1]

            # Train Prophet model
            model = Prophet(
                changepoint_prior_scale=self.changepoint_prior_scale,
                seasonality_mode=self.seasonality_mode,
                interval_width=self.interval_width,
                daily_seasonality=True,
                weekly_seasonality=True,
                yearly_seasonality=True
            )
            model.fit(df)

            # Create future dataframe (including historical for fitted values)
            future = model.make_future_dataframe(periods=forecast_days)
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
                'recommendation': self._get_recommendation_label(change_percent),
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
