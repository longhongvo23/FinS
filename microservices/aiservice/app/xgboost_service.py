"""
XGBoost Ensemble Model for Stock Price Prediction
Provides a secondary ML signal to complement Prophet in the ensemble.
"""

import pandas as pd
import numpy as np
from typing import Optional
from loguru import logger

try:
    from xgboost import XGBRegressor
    XGBOOST_AVAILABLE = True
except ImportError:
    XGBOOST_AVAILABLE = False
    logger.warning("XGBoost not installed. XGBoost ensemble signal will be disabled.")


class XGBoostService:
    """
    XGBoost model that predicts future price movement direction and magnitude
    using engineered features from historical OHLCV data.
    
    Returns a signal in [-1, +1] range to feed into the ensemble.
    """

    def __init__(self):
        self.lookback = 60  # Minimum rows needed for feature engineering
        self.n_estimators = 100
        self.max_depth = 4
        self.learning_rate = 0.05

    def get_signal(self, df: pd.DataFrame, forecast_days: int = 14) -> float:
        """
        Train XGBoost on historical data and return a prediction signal.
        
        Args:
            df: DataFrame with columns ['ds', 'y', 'open', 'high', 'low', 'volume']
            forecast_days: How many days ahead to predict
            
        Returns:
            Signal between -1.0 and +1.0 representing predicted direction/magnitude.
            Returns 0.0 if model cannot be trained.
        """
        if not XGBOOST_AVAILABLE:
            return 0.0
        
        try:
            if df is None or len(df) < self.lookback + forecast_days:
                return 0.0
            
            features_df = self._build_features(df)
            if features_df is None or len(features_df) < 30:
                return 0.0
            
            # Target: future return after forecast_days
            features_df['target'] = features_df['close'].shift(-forecast_days) / features_df['close'] - 1
            features_df = features_df.dropna()
            
            if len(features_df) < 20:
                return 0.0
            
            feature_cols = [c for c in features_df.columns if c not in ('target', 'close', 'ds')]
            
            X = features_df[feature_cols].values
            y = features_df['target'].values
            
            # Use all but last row for training, last row for prediction
            X_train, y_train = X[:-1], y[:-1]
            X_pred = X[-1:].copy()
            
            if len(X_train) < 15:
                return 0.0
            
            model = XGBRegressor(
                n_estimators=self.n_estimators,
                max_depth=self.max_depth,
                learning_rate=self.learning_rate,
                subsample=0.8,
                colsample_bytree=0.8,
                random_state=42,
                verbosity=0,
            )
            model.fit(X_train, y_train)
            
            predicted_return = float(model.predict(X_pred)[0])
            
            # Convert return to signal [-1, +1] using tanh scaling
            # Scale by 10% — a 10% predicted return maps to ~0.76 signal
            signal = float(np.tanh(predicted_return / 0.10))
            
            logger.debug(
                f"XGBoost signal: predicted_return={predicted_return:.4f}, signal={signal:.3f}"
            )
            return signal
            
        except Exception as e:
            logger.warning(f"XGBoost prediction failed: {e}")
            return 0.0

    def _build_features(self, df: pd.DataFrame) -> Optional[pd.DataFrame]:
        """Build feature matrix from OHLCV data."""
        try:
            f = pd.DataFrame()
            f['ds'] = df['ds'].values
            f['close'] = df['y'].values
            f['open'] = df['open'].values
            f['high'] = df['high'].values
            f['low'] = df['low'].values
            f['volume'] = df['volume'].values
            
            close = f['close']
            
            # Price-based features
            for period in [5, 10, 20]:
                f[f'return_{period}d'] = close.pct_change(period)
                f[f'sma_{period}'] = close.rolling(period).mean() / close - 1
                f[f'volatility_{period}d'] = close.pct_change().rolling(period).std()
            
            # RSI (14-day)
            delta = close.diff()
            gain = delta.where(delta > 0, 0).rolling(14).mean()
            loss = (-delta.where(delta < 0, 0)).rolling(14).mean()
            rs = gain / loss
            f['rsi_14'] = 100 - (100 / (1 + rs))
            
            # MACD
            ema12 = close.ewm(span=12, adjust=False).mean()
            ema26 = close.ewm(span=26, adjust=False).mean()
            f['macd'] = (ema12 - ema26) / close
            f['macd_signal'] = f['macd'].ewm(span=9, adjust=False).mean()
            f['macd_hist'] = f['macd'] - f['macd_signal']
            
            # Bollinger Band position
            sma20 = close.rolling(20).mean()
            std20 = close.rolling(20).std()
            f['bb_position'] = (close - sma20) / (2 * std20)
            
            # Volume features
            f['volume_sma_ratio'] = f['volume'] / f['volume'].rolling(20).mean()
            f['volume_change'] = f['volume'].pct_change(5)
            
            # High-Low spread
            f['hl_range'] = (f['high'] - f['low']) / close
            
            # Day of week (cyclical encoding)
            if pd.api.types.is_datetime64_any_dtype(f['ds']):
                dow = pd.to_datetime(f['ds']).dt.dayofweek
            else:
                dow = pd.to_datetime(f['ds']).dt.dayofweek
            f['day_sin'] = np.sin(2 * np.pi * dow / 5)
            f['day_cos'] = np.cos(2 * np.pi * dow / 5)
            
            # Drop intermediate columns
            f = f.drop(columns=['open', 'high', 'low', 'volume'], errors='ignore')
            
            # Drop rows with NaN from rolling calculations
            f = f.dropna()
            
            return f
            
        except Exception as e:
            logger.warning(f"XGBoost feature engineering failed: {e}")
            return None


# Global instance
xgboost_service = XGBoostService()
