import pandas as pd
import numpy as np
from prophet import Prophet
from datetime import datetime, date, timedelta
from typing import Tuple, Optional, Dict
from loguru import logger

from app.config import settings
from app.database import mongodb_service
from app.technical_analysis import technical_analysis
from app.sentiment_service import sentiment_service
from app.xgboost_service import xgboost_service


class ProphetPredictionService:
    """
    Hybrid Stock Prediction Service
    
    Prophet-Enhanced Ensemble Model combining:
    - Prophet (30%): Long-term trend forecasting
    - Technical Analysis (50%): Short-term signal confirmation
    - Volume Analysis (20%): Trade momentum validation
    """

    def __init__(self):
        self.forecast_days = settings.PROPHET_FORECAST_DAYS
        # Balanced hyperparameters for stock prediction
        self.changepoint_prior_scale = 0.08  # Balanced: detect recent changes but don't overfit
        self.seasonality_mode = 'additive'  # Additive prevents trend amplification
        self.interval_width = settings.PROPHET_INTERVAL_WIDTH
        
        # Ensemble weights (total = 1.0)
        self.prophet_weight = 0.20
        self.xgboost_weight = 0.15
        self.technical_weight = 0.35
        self.volume_weight = 0.10
        self.sentiment_weight = 0.20
        
        # Trend dampening: blend Prophet prediction toward current price
        # 0.0 = 100% Prophet, 1.0 = 100% current price (no change)
        # 0.5 = halfway between Prophet prediction and current price
        self.trend_dampening_factor = 0.4
        
        # Realistic forecast constraints (safety net)
        self.max_annual_volatility = 0.60
        self.absolute_max_change_pct = 0.30
        
        # Confidence decay: day 1 ≈ 70%, last day ≈ 35%
        self.confidence_day1 = 70.0
        self.confidence_min = 35.0

    async def predict(
        self,
        symbol: str,
        forecast_days: Optional[int] = None
    ) -> Optional[Dict]:
        """
        Hybrid prediction using Prophet + Technical Analysis ensemble
        
        Args:
            symbol: Stock symbol
            forecast_days: Number of days to forecast (default from config)
            
        Returns:
            Dictionary with prediction results or None if failed
        """
        try:
            forecast_days = forecast_days or self.forecast_days
            
            # Fetch historical data (use 180 days for better recent trend focus)
            historical_data = await mongodb_service.get_historical_prices(
                symbol=symbol,
                days=180  # Reduced from 365 for more recent market behavior
            )

            if len(historical_data) < 30:
                logger.info(
                    f"⏭️  Skipping {symbol}: Insufficient data ({len(historical_data)} days). "
                    f"Minimum 30 days required. Waiting for crawlservice to collect more data..."
                )
                return None

            # Prepare data for Prophet with enhanced features
            df = self._prepare_data(historical_data)
            
            if df is None or df.empty:
                logger.error(f"Failed to prepare data for {symbol}")
                return None

            # === PROPHET PREDICTION (30% weight) ===
            forecast_df = self._train_and_forecast(df, forecast_days)
            
            if forecast_df is None:
                logger.error(f"Failed to generate forecast for {symbol}")
                return None

            # Calculate volatility params for progressive bounds
            vol_params = self._calculate_volatility_params(df)
            last_data_date_ts = df['ds'].max()
            
            # Clamp Prophet forecast with progressive per-day bounds (safety net)
            forecast_df = self._clamp_forecast_series(forecast_df, vol_params, last_data_date_ts)
            
            # Apply trend dampening: blend Prophet prediction toward current price
            # This implements mean reversion - stock prices don't trend forever
            forecast_df = self._apply_trend_dampening(forecast_df, df)

            current_price = df['y'].iloc[-1]
            predicted_price = forecast_df['yhat'].iloc[-1]
            prophet_change_percent = ((predicted_price - current_price) / current_price) * 100
            
            # Normalize to -1 to +1 scale
            prophet_signal = np.tanh(prophet_change_percent / 20.0)  # Scale by 20% for normalization
            
            # === TECHNICAL ANALYSIS (50% weight) ===
            # Prepare OHLCV dataframe for technical indicators
            ta_df = df[['open', 'high', 'low', 'y', 'volume']].copy()
            ta_df.columns = ['open', 'high', 'low', 'close', 'volume']
            
            technical_indicators = technical_analysis.calculate_all_indicators(ta_df)
            technical_signal = technical_indicators.get('technical_score', 0.0)
            
            # === VOLUME CONFIRMATION (10% weight) ===
            volume_signal = technical_indicators.get('volume', 0.0)
            
            # === SENTIMENT ANALYSIS (20% weight) ===
            sentiment_signal = await sentiment_service.get_sentiment_score(symbol)
            
            # === XGBOOST MODEL (15% weight) ===
            xgboost_signal = xgboost_service.get_signal(df, forecast_days)
            
            # === ENSEMBLE COMBINATION ===
            ensemble_score = (
                prophet_signal * self.prophet_weight +
                xgboost_signal * self.xgboost_weight +
                technical_signal * self.technical_weight +
                volume_signal * self.volume_weight +
                sentiment_signal * self.sentiment_weight
            )
            
            # Calculate final prediction with ensemble adjustment
            # Adjust predicted price based on technical analysis
            ensemble_adjustment = 1 + (ensemble_score * 0.1)  # Max ±10% adjustment
            final_predicted_price = predicted_price * ensemble_adjustment
            
            # Apply sanity check with progressive bounds for the final forecast day
            final_predicted_price = self._apply_sanity_check(
                final_predicted_price, current_price, vol_params, forecast_days
            )
            final_change_percent = ((final_predicted_price - current_price) / current_price) * 100

            # Get confidence intervals (from Prophet, already clamped per-day)
            lower_bound = forecast_df['yhat_lower'].iloc[-1]
            upper_bound = forecast_df['yhat_upper'].iloc[-1]
            
            # Adjust confidence intervals with ensemble score
            final_day_bounds = self._get_bounds_for_day(vol_params, forecast_days)
            confidence_adjustment = abs(ensemble_score) * 0.5  # Tighter intervals with stronger signals
            interval_width = (upper_bound - lower_bound) * (1 - confidence_adjustment)
            lower_bound = max(final_predicted_price - (interval_width / 2), final_day_bounds['floor'])
            upper_bound = min(final_predicted_price + (interval_width / 2), final_day_bounds['cap'])

            # Get final recommendation
            recommendation = self._get_recommendation_label(final_change_percent, ensemble_score)

            result = {
                'symbol': symbol,
                'forecast_days': forecast_days,
                'prediction_date': (datetime.now() + timedelta(days=forecast_days)).date(),
                'current_price': float(current_price),
                'predicted_price': float(final_predicted_price),
                'change_percent': float(final_change_percent),
                'confidence_interval_lower': float(lower_bound),
                'confidence_interval_upper': float(upper_bound),
                'recommendation': recommendation,
                'created_at': datetime.utcnow(),
                # Additional metadata for transparency
                'metadata': {
                    'prophet_signal': float(prophet_signal),
                    'xgboost_signal': float(xgboost_signal),
                    'technical_signal': float(technical_signal),
                    'volume_signal': float(volume_signal),
                    'sentiment_signal': float(sentiment_signal),
                    'ensemble_score': float(ensemble_score),
                    'prophet_predicted_price': float(predicted_price),
                    'model_type': 'Prophet+XGBoost Hybrid Ensemble',
                    'bounds_cap': float(final_day_bounds['cap']),
                    'bounds_floor': float(final_day_bounds['floor']),
                    'max_change_pct': float(final_day_bounds['max_change_factor'] * 100)
                }
            }

            logger.info(
                f"Hybrid Prediction for {symbol}: {current_price:.2f} -> "
                f"{final_predicted_price:.2f} ({final_change_percent:+.2f}%) "
                f"[Prophet: {prophet_signal:.2f}, XGB: {xgboost_signal:.2f}, "
                f"TA: {technical_signal:.2f}, Sentiment: {sentiment_signal:.2f}, "
                f"Ensemble: {ensemble_score:.2f}]"
            )

            return result

        except Exception as e:
            logger.error(f"Error predicting {symbol}: {e}")
            return None

    def _prepare_data(self, historical_data: list) -> Optional[pd.DataFrame]:
        """
        Prepare enhanced data for Prophet model with additional regressors
        Includes volume, high-low spread, and volatility features
        """
        try:
            # Convert to DataFrame
            df = pd.DataFrame(historical_data)
            
            if df.empty:
                return None
            
            # Prophet requires 'ds' (date) and 'y' (value) columns
            df['ds'] = pd.to_datetime(df['datetime'])
            
            # Convert OHLCV to numeric
            df['y'] = pd.to_numeric(df['close'], errors='coerce')
            df['open'] = pd.to_numeric(df['open'], errors='coerce')
            df['high'] = pd.to_numeric(df['high'], errors='coerce')
            df['low'] = pd.to_numeric(df['low'], errors='coerce')
            df['volume'] = pd.to_numeric(df['volume'], errors='coerce')
            
            # Sort by date
            df = df.sort_values('ds')
            
            # Remove duplicates
            df = df.drop_duplicates(subset=['ds'], keep='last')
            
            # Feature engineering for Prophet regressors
            # 1. Volume feature (normalized)
            df['volume_feature'] = df['volume'] / df['volume'].rolling(window=20, min_periods=5).mean()
            df['volume_feature'] = df['volume_feature'].fillna(1.0)
            
            # 2. High-Low spread (volatility indicator)
            df['hl_spread'] = (df['high'] - df['low']) / df['y']
            df['hl_spread'] = df['hl_spread'].fillna(0.0)
            
            # 3. Price momentum (rate of change)
            df['momentum'] = df['y'].pct_change(periods=5).fillna(0.0)
            
            # Remove rows with NaN in required columns
            df = df.dropna(subset=['ds', 'y', 'volume_feature'])
            
            # Keep all columns for technical analysis later
            required_cols = ['ds', 'y', 'volume_feature', 'hl_spread', 'momentum', 
                           'open', 'high', 'low', 'volume']
            df = df[required_cols]
            
            # Remove outliers (extreme price movements > 50% in one day)
            df['price_change'] = df['y'].pct_change().abs()
            df = df[df['price_change'] < 0.5]  # Remove extreme outliers
            df = df.drop('price_change', axis=1)
            
            # Add cap and floor for logistic growth model
            # Cap/floor based on historical price range with generous margin
            price_min = df['y'].min()
            price_max = df['y'].max()
            price_range = price_max - price_min
            # Cap = max price + 50% of range, Floor = max(min price - 50% of range, 0.01)
            df['cap'] = price_max + price_range * 0.5
            df['floor'] = max(price_min - price_range * 0.5, 0.01)
            
            logger.debug(f"Prepared {len(df)} data points with logistic growth bounds "
                        f"[floor={df['floor'].iloc[0]:.2f}, cap={df['cap'].iloc[0]:.2f}]")
            
            return df

        except Exception as e:
            logger.error(f"Error preparing data: {e}")
            return None

    def _apply_trend_dampening(
        self,
        forecast_df: pd.DataFrame,
        historical_df: pd.DataFrame
    ) -> pd.DataFrame:
        """
        Dampen Prophet's trend by blending predictions toward current price.
        
        Financial rationale: stock prices exhibit mean reversion.
        Prophet tends to extrapolate trends indefinitely, which is unrealistic.
        This blending pulls extreme predictions back toward current levels,
        with dampening increasing for farther-out forecasts.
        """
        df = forecast_df.copy()
        current_price = historical_df['y'].iloc[-1]
        last_date = historical_df['ds'].max()
        max_days = max((df['ds'].max() - last_date).days, 1)
        
        for idx in df.index:
            days_ahead = max((df.loc[idx, 'ds'] - last_date).days, 1)
            # Progressive dampening: more dampening for farther dates
            # day 1: dampen_factor * (1/max_days), day 30: dampen_factor * 1.0
            progress = days_ahead / max_days
            dampen = self.trend_dampening_factor * progress
            
            # Blend: prediction = (1 - dampen) * prophet + dampen * current_price
            df.loc[idx, 'yhat'] = (1 - dampen) * df.loc[idx, 'yhat'] + dampen * current_price
            df.loc[idx, 'yhat_lower'] = (1 - dampen) * df.loc[idx, 'yhat_lower'] + dampen * current_price
            df.loc[idx, 'yhat_upper'] = (1 - dampen) * df.loc[idx, 'yhat_upper'] + dampen * current_price
        
        dampened_final = df['yhat'].iloc[-1]
        change_pct = ((dampened_final - current_price) / current_price) * 100
        logger.info(
            f"📉 Trend dampening applied (factor={self.trend_dampening_factor}): "
            f"final prediction ${dampened_final:.2f} ({change_pct:+.1f}% from ${current_price:.2f})"
        )
        
        return df

    def _calculate_volatility_params(
        self,
        df: pd.DataFrame
    ) -> Dict:
        """
        Calculate volatility parameters from historical data.
        Returns params used to compute progressive per-day bounds.
        """
        current_price = df['y'].iloc[-1]
        
        # Calculate historical daily return volatility
        daily_returns = df['y'].pct_change().dropna()
        daily_volatility = daily_returns.std()
        
        # Annualize and cap volatility estimate
        annualized_vol = daily_volatility * np.sqrt(252)
        annualized_vol = min(annualized_vol, self.max_annual_volatility)
        daily_vol_capped = annualized_vol / np.sqrt(252)
        
        logger.info(
            f"📊 Volatility params: current=${current_price:.2f}, "
            f"daily_vol={daily_volatility:.4f}, annual_vol={annualized_vol:.4f}, "
            f"capped_daily_vol={daily_vol_capped:.4f}"
        )
        
        return {
            'current_price': current_price,
            'daily_vol_capped': daily_vol_capped,
            'daily_volatility': daily_volatility,
            'annualized_vol': annualized_vol
        }

    def _get_bounds_for_day(
        self,
        vol_params: Dict,
        days_ahead: int
    ) -> Dict:
        """
        Get progressive bounds for a specific day ahead.
        Bounds widen with sqrt(days) — closer days are tighter, farther days are wider.
        This creates a natural fan-out shape instead of a flat line.
        """
        current_price = vol_params['current_price']
        daily_vol = vol_params['daily_vol_capped']
        
        days_ahead = max(days_ahead, 1)
        
        # Progressive bounds: scale with sqrt(days), 2.5 sigma
        max_change_factor = daily_vol * np.sqrt(days_ahead) * 2.5
        
        # Apply absolute hard cap
        max_change_factor = min(max_change_factor, self.absolute_max_change_pct)
        
        # Ensure minimum bounds (at least ±1%)
        max_change_factor = max(max_change_factor, 0.01)
        
        cap = current_price * (1 + max_change_factor)
        floor_price = current_price * (1 - max_change_factor)
        floor_price = max(floor_price, 0.01)
        
        return {
            'cap': cap,
            'floor': floor_price,
            'max_change_factor': max_change_factor
        }

    def _apply_sanity_check(
        self,
        predicted_price: float,
        current_price: float,
        vol_params: Dict,
        days_ahead: int
    ) -> float:
        """
        Clamp predicted price to progressive realistic bounds for a given day.
        """
        bounds = self._get_bounds_for_day(vol_params, days_ahead)
        clamped = float(np.clip(predicted_price, bounds['floor'], bounds['cap']))
        
        if abs(clamped - predicted_price) > 0.01:
            change_before = ((predicted_price - current_price) / current_price) * 100
            change_after = ((clamped - current_price) / current_price) * 100
            logger.warning(
                f"🔒 Sanity check (day {days_ahead}): ${predicted_price:.2f} ({change_before:+.1f}%) "
                f"→ ${clamped:.2f} ({change_after:+.1f}%) "
                f"[bounds: ${bounds['floor']:.2f} - ${bounds['cap']:.2f}]"
            )
        
        return clamped

    def _clamp_forecast_series(
        self,
        forecast_df: pd.DataFrame,
        vol_params: Dict,
        last_date: pd.Timestamp
    ) -> pd.DataFrame:
        """
        Clamp forecast values with progressive per-day bounds.
        Each day gets wider bounds (sqrt scaling), creating a smooth curve.
        """
        df = forecast_df.copy()
        
        for idx in df.index:
            days_ahead = max((df.loc[idx, 'ds'] - last_date).days, 1)
            bounds = self._get_bounds_for_day(vol_params, days_ahead)
            df.loc[idx, 'yhat'] = np.clip(df.loc[idx, 'yhat'], bounds['floor'], bounds['cap'])
            df.loc[idx, 'yhat_lower'] = np.clip(df.loc[idx, 'yhat_lower'], bounds['floor'], bounds['cap'])
            df.loc[idx, 'yhat_upper'] = np.clip(df.loc[idx, 'yhat_upper'], bounds['floor'], bounds['cap'])
        
        return df

    def _fill_future_regressors(
        self,
        future: pd.DataFrame,
        df: pd.DataFrame
    ) -> pd.DataFrame:
        """
        Fill future regressor values with decay.
        Momentum decays toward zero (mean reversion) to prevent
        Prophet from extrapolating short-term trends indefinitely.
        """
        last_volume = df['volume_feature'].tail(10).mean()
        last_spread = df['hl_spread'].tail(10).mean()
        last_momentum = df['momentum'].tail(10).mean()
        last_date = df['ds'].max()
        
        future = future.merge(
            df[['ds', 'volume_feature', 'hl_spread', 'momentum']],
            on='ds',
            how='left'
        )
        future['volume_feature'] = future['volume_feature'].fillna(last_volume)
        future['hl_spread'] = future['hl_spread'].fillna(last_spread)
        
        # Decay momentum toward zero for future dates (mean reversion)
        # This prevents Prophet from extrapolating short-term trends indefinitely
        future_mask = future['ds'] > last_date
        if future_mask.any():
            days_ahead = (future.loc[future_mask, 'ds'] - last_date).dt.days
            # Exponential decay: momentum halves every 5 days
            decay_factor = np.exp(-0.139 * days_ahead)  # ln(2)/5 ≈ 0.139
            future.loc[future_mask, 'momentum'] = last_momentum * decay_factor
        future['momentum'] = future['momentum'].fillna(0.0)
        
        return future

    def _get_confidence_pct(self, days_ahead: int, total_days: int) -> float:
        """
        Calculate confidence percentage that decreases over time.
        Day 1 ≈ 70%, last day ≈ 35%. Uses exponential decay.
        """
        if total_days <= 1:
            return self.confidence_day1
        progress = (days_ahead - 1) / (total_days - 1)  # 0.0 at day 1, 1.0 at last day
        confidence = self.confidence_day1 - (self.confidence_day1 - self.confidence_min) * progress
        return round(max(confidence, self.confidence_min), 1)

    def _train_and_forecast(
        self,
        df: pd.DataFrame,
        forecast_days: int
    ) -> Optional[pd.DataFrame]:
        """
        Train Prophet model with logistic growth for natural saturation.
        Logistic growth prevents infinite trend extrapolation.
        """
        try:
            # Use logistic growth - creates natural S-curve saturation
            model = Prophet(
                growth='logistic',
                changepoint_prior_scale=self.changepoint_prior_scale,
                seasonality_mode=self.seasonality_mode,
                interval_width=self.interval_width,
                daily_seasonality=False,
                weekly_seasonality=True,
                yearly_seasonality=True
            )
            
            # Add custom regressors for enhanced prediction
            model.add_regressor('volume_feature', standardize=True)
            model.add_regressor('hl_spread', standardize=True)
            model.add_regressor('momentum', standardize=True)

            # Fit model (df already has 'cap' and 'floor' columns)
            model.fit(df)

            # Create future dataframe
            future = model.make_future_dataframe(periods=forecast_days)
            
            # Fill future regressor values with momentum decay
            future = self._fill_future_regressors(future, df)
            
            # Logistic growth requires cap and floor in future too
            future['cap'] = df['cap'].iloc[0]
            future['floor'] = df['floor'].iloc[0]

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
        ensemble_score: float = None
    ) -> str:
        """
        Convert change percentage and ensemble score to recommendation label
        
        Args:
            change_percent: Predicted price change percentage
            ensemble_score: Combined signal from all models (-1 to +1)
            
        Returns:
            Recommendation label (STRONG_BUY, BUY, HOLD, SELL, STRONG_SELL)
        """
        # If ensemble score is provided, give it higher priority
        if ensemble_score is not None:
            if ensemble_score >= 0.6:
                return "STRONG_BUY"
            elif ensemble_score >= 0.2:
                return "BUY"
            elif ensemble_score >= -0.2:
                return "HOLD"
            elif ensemble_score >= -0.6:
                return "SELL"
            else:
                return "STRONG_SELL"
        
        # Fallback to change_percent based thresholds
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
                'recommendation': prediction['recommendation'],
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

    async def backtest(
        self,
        symbol: str,
        forecast_days: Optional[int] = None,
        num_windows: int = 5
    ) -> Optional[Dict]:
        """
        Walk-forward backtesting: train on historical subset, predict, compare with actual.
        Uses sliding windows to evaluate prediction accuracy.
        
        Args:
            symbol: Stock symbol
            forecast_days: Days to forecast in each window
            num_windows: Number of test windows (default 5)
        """
        try:
            forecast_days = forecast_days or self.forecast_days
            
            historical_data = await mongodb_service.get_historical_prices(
                symbol=symbol, days=365
            )
            
            if len(historical_data) < 60 + forecast_days:
                logger.warning(f"Insufficient data for backtesting {symbol}")
                return None
            
            df_full = self._prepare_data(historical_data)
            if df_full is None or df_full.empty:
                return None
            
            total_rows = len(df_full)
            # Minimum training size
            min_train = max(60, total_rows - num_windows * forecast_days)
            step = max(1, (total_rows - min_train - forecast_days) // max(num_windows - 1, 1))
            
            windows = []
            
            for i in range(num_windows):
                train_end_idx = min_train + i * step
                if train_end_idx + forecast_days > total_rows:
                    break
                
                train_df = df_full.iloc[:train_end_idx].copy()
                actual_future = df_full.iloc[train_end_idx:train_end_idx + forecast_days]
                
                if len(actual_future) == 0:
                    break
                
                # Train and forecast on this window
                forecast_result = self._train_and_forecast(train_df, len(actual_future))
                
                if forecast_result is None or forecast_result.empty:
                    continue
                
                current_price = train_df['y'].iloc[-1]
                predicted_price = float(forecast_result['yhat'].iloc[-1])
                actual_price = float(actual_future['y'].iloc[-1])
                
                error_pct = ((predicted_price - actual_price) / actual_price) * 100
                predicted_direction = predicted_price > current_price
                actual_direction = actual_price > current_price
                
                windows.append({
                    'train_end_date': train_df['ds'].iloc[-1].strftime('%Y-%m-%d'),
                    'predicted_price': round(predicted_price, 2),
                    'actual_price': round(actual_price, 2),
                    'error_pct': round(error_pct, 2),
                    'direction_correct': predicted_direction == actual_direction,
                })
            
            if not windows:
                return None
            
            errors = [abs(w['error_pct']) for w in windows]
            signed_errors = [w['error_pct'] for w in windows]
            direction_hits = sum(1 for w in windows if w['direction_correct'])
            
            result = {
                'symbol': symbol,
                'forecast_days': forecast_days,
                'windows': windows,
                'mape': round(sum(errors) / len(errors), 2),
                'direction_accuracy': round(direction_hits / len(windows) * 100, 1),
                'mean_error_pct': round(sum(signed_errors) / len(signed_errors), 2),
            }
            
            logger.info(
                f"Backtest {symbol}: MAPE={result['mape']:.1f}%, "
                f"Direction={result['direction_accuracy']:.0f}% ({len(windows)} windows)"
            )
            return result
            
        except Exception as e:
            logger.error(f"Error backtesting {symbol}: {e}")
            return None

    async def get_forecast_chart_data(
        self,
        symbol: str,
        forecast_days: Optional[int] = None,
        history_days: int = 90
    ) -> Optional[Dict]:
        """
        Get hybrid forecast data for chart visualization (always forecasting from TODAY)
        
        Args:
            symbol: Stock symbol
            forecast_days: Number of days to forecast FROM TODAY
            history_days: Number of historical days to include
            
        Returns:
            Dictionary with historical and forecast data for charting
        """
        try:
            forecast_days = forecast_days or self.forecast_days
            
            # Fetch historical data
            historical_data = await mongodb_service.get_historical_prices(
                symbol=symbol,
                days=180  # Use 180 days for training (aligned with predict)
            )

            if len(historical_data) < 30:
                logger.info(f"⏭️  Skipping {symbol}: Insufficient data ({len(historical_data)} days)")
                return None

            # Prepare data with enhanced features
            df = self._prepare_data(historical_data)
            
            if df is None or df.empty:
                logger.error(f"Failed to prepare data for {symbol}")
                return None

            # Get last data date and current price
            last_data_date = df['ds'].max()
            current_price = df['y'].iloc[-1]
            today = pd.Timestamp.now().normalize()
            
            # Calculate days gap between last data and today
            days_gap = (today - last_data_date).days
            
            # Log data freshness
            if days_gap > 0:
                logger.warning(f"⚠️  {symbol}: Data is {days_gap} days old (last: {last_data_date.date()}, today: {today.date()})")
            else:
                logger.info(f"✅ {symbol}: Data is up-to-date (last: {last_data_date.date()})")
            
            # Calculate total forecast periods needed
            # We need to forecast from last data date to today + forecast_days
            total_forecast_periods = max(days_gap, 0) + forecast_days

            # === Train Prophet model with logistic growth ===
            model = Prophet(
                growth='logistic',
                changepoint_prior_scale=self.changepoint_prior_scale,
                seasonality_mode=self.seasonality_mode,
                interval_width=self.interval_width,
                daily_seasonality=False,
                weekly_seasonality=True,
                yearly_seasonality=True
            )
            
            # Add regressors (same as _train_and_forecast)
            model.add_regressor('volume_feature', standardize=True)
            model.add_regressor('hl_spread', standardize=True)
            model.add_regressor('momentum', standardize=True)
            
            model.fit(df)

            # Create future dataframe - forecast to cover gap + requested days
            future = model.make_future_dataframe(periods=total_forecast_periods)
            
            # Fill future regressors with momentum decay
            future = self._fill_future_regressors(future, df)
            
            # Logistic growth requires cap and floor in future too
            future['cap'] = df['cap'].iloc[0]
            future['floor'] = df['floor'].iloc[0]
            
            forecast = model.predict(future)
            
            # Calculate volatility params for progressive bounds
            vol_params = self._calculate_volatility_params(df)

            # === Calculate technical analysis for ensemble adjustment ===
            ta_df = df[['open', 'high', 'low', 'y', 'volume']].copy()
            ta_df.columns = ['open', 'high', 'low', 'close', 'volume']
            technical_indicators = technical_analysis.calculate_all_indicators(ta_df)
            technical_signal = technical_indicators.get('technical_score', 0.0)
            volume_signal = technical_indicators.get('volume', 0.0)
            
            # Calculate ensemble adjustment
            raw_prophet_last = forecast[forecast['ds'] > df['ds'].max()]['yhat'].iloc[-1]
            prophet_change = ((raw_prophet_last - current_price) / current_price) * 100
            prophet_signal = np.tanh(prophet_change / 20.0)
            sentiment_signal = await sentiment_service.get_sentiment_score(symbol)
            xgboost_signal = xgboost_service.get_signal(df, forecast_days)
            ensemble_score = (
                prophet_signal * self.prophet_weight +
                xgboost_signal * self.xgboost_weight +
                technical_signal * self.technical_weight +
                volume_signal * self.volume_weight +
                sentiment_signal * self.sentiment_weight
            )
            ensemble_adjustment = 1 + (ensemble_score * 0.1)
            
            # Apply trend dampening to future forecast
            future_forecast_raw = forecast[forecast['ds'] > df['ds'].max()].copy()
            future_forecast_dampened = self._apply_trend_dampening(future_forecast_raw, df)
            
            # Helper to clamp price with progressive per-day bounds
            def clamp_day(price, days_ahead):
                day_bounds = self._get_bounds_for_day(vol_params, days_ahead)
                return float(np.clip(price, day_bounds['floor'], day_bounds['cap']))

            # Build chart data
            chart_data = []
            
            # Get last N days of historical data
            historical_df = df.tail(history_days)
            
            # Merge historical actual with forecast fitted values
            for _, row in historical_df.iterrows():
                date_str = row['ds'].strftime('%Y-%m-%d')
                forecast_row = forecast[forecast['ds'] == row['ds']]
                
                if not forecast_row.empty:
                    predicted = float(forecast_row['yhat'].iloc[0]) * ensemble_adjustment
                    lower = float(forecast_row['yhat_lower'].iloc[0]) * ensemble_adjustment
                    upper = float(forecast_row['yhat_upper'].iloc[0]) * ensemble_adjustment
                else:
                    predicted = lower = upper = None
                
                data_point = {
                    'date': date_str,
                    'actual': float(row['y']),
                    'predicted': predicted,
                    'lower': lower,
                    'upper': upper,
                }
                chart_data.append(data_point)

            # Add future forecast data starting from last_data_date + 1 day
            # Filter to only show from TODAY onwards (not historical predictions)
            
            for _, row in future_forecast_dampened.iterrows():
                forecast_date = row['ds']
                # Only include dates from today onwards for forecast visualization
                if forecast_date.normalize() >= today:
                    days_ahead = max((forecast_date - last_data_date).days, 1)
                    data_point = {
                        'date': forecast_date.strftime('%Y-%m-%d'),
                        'actual': None,
                        'predicted': clamp_day(float(row['yhat']) * ensemble_adjustment, days_ahead),
                        'lower': clamp_day(float(row['yhat_lower']) * ensemble_adjustment, days_ahead),
                        'upper': clamp_day(float(row['yhat_upper']) * ensemble_adjustment, days_ahead),
                        'confidence_pct': self._get_confidence_pct(days_ahead, total_forecast_periods),
                    }
                    chart_data.append(data_point)

            # Calculate summary with ensemble
            # Get prediction for today + forecast_days
            target_date = today + pd.Timedelta(days=forecast_days)
            target_row = future_forecast_dampened[
                future_forecast_dampened['ds'].dt.normalize() == target_date.normalize()
            ]
            
            if not target_row.empty:
                target_days = max((target_date - last_data_date).days, 1)
                predicted_price = clamp_day(float(target_row['yhat'].iloc[0]) * ensemble_adjustment, target_days)
            else:
                # Fallback to last forecast if exact date not found
                last_days = max((future_forecast_dampened['ds'].iloc[-1] - last_data_date).days, 1)
                predicted_price = clamp_day(float(future_forecast_dampened['yhat'].iloc[-1]) * ensemble_adjustment, last_days)
            
            change_percent = ((predicted_price - current_price) / current_price) * 100

            result = {
                'symbol': symbol,
                'forecast_days': forecast_days,
                'current_price': float(current_price),
                'predicted_price': float(predicted_price),
                'change_percent': float(change_percent),
                'recommendation': self._get_recommendation_label(change_percent, ensemble_score),
                'data': chart_data,
                'created_at': datetime.utcnow(),
                # Add data freshness info
                'last_data_date': last_data_date.strftime('%Y-%m-%d'),
                'data_age_days': days_gap,
                'is_data_fresh': days_gap <= 1  # Consider data fresh if <= 1 day old
            }

            logger.info(
                f"Generated hybrid forecast chart data for {symbol}: {len(chart_data)} data points "
                f"(data age: {days_gap} days, last: {last_data_date.date()})"
            )
            return result

        except Exception as e:
            logger.error(f"Error generating forecast chart data for {symbol}: {e}")
            return None


# Global instance
prediction_service = ProphetPredictionService()
