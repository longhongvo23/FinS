"""
Technical Analysis Module for Stock Trading Signals
Implements key technical indicators for hybrid prediction model
"""

import pandas as pd
import numpy as np
from typing import Dict, Optional
from loguru import logger


class TechnicalAnalysis:
    """
    Technical analysis tools for stock trading signals
    Implements indicators similar to TradingView's recommendation system
    """
    
    def __init__(self):
        self.signals = []
    
    def calculate_all_indicators(
        self,
        df: pd.DataFrame,
        close_col: str = 'close',
        high_col: str = 'high',
        low_col: str = 'low',
        volume_col: str = 'volume'
    ) -> Dict[str, float]:
        """
        Calculate all technical indicators and return signal scores
        
        Args:
            df: DataFrame with OHLCV data
            close_col: Column name for close prices
            high_col: Column name for high prices
            low_col: Column name for low prices
            volume_col: Column name for volume
            
        Returns:
            Dictionary with indicator scores and overall technical score
        """
        try:
            if df is None or df.empty or len(df) < 20:
                logger.warning("Insufficient data for technical analysis")
                return self._neutral_scores()
            
            # Ensure numeric types
            close = pd.to_numeric(df[close_col], errors='coerce').dropna()
            high = pd.to_numeric(df[high_col], errors='coerce').dropna()
            low = pd.to_numeric(df[low_col], errors='coerce').dropna()
            volume = pd.to_numeric(df[volume_col], errors='coerce').dropna()
            
            if len(close) < 20:
                return self._neutral_scores()
            
            current_price = close.iloc[-1]
            
            # Calculate indicators
            rsi = self._calculate_rsi(close, period=14)
            macd_signal = self._calculate_macd(close)
            bb_signal = self._calculate_bollinger_bands(close, current_price)
            ema_signal = self._calculate_ema_crossover(close, current_price)
            sma_signal = self._calculate_sma_crossover(close, current_price)
            volume_signal = self._calculate_volume_trend(volume)
            momentum_signal = self._calculate_momentum(close)
            stochastic_signal = self._calculate_stochastic(high, low, close)
            
            # Aggregate signals
            indicators = {
                'rsi': rsi,
                'macd': macd_signal,
                'bollinger': bb_signal,
                'ema': ema_signal,
                'sma': sma_signal,
                'volume': volume_signal,
                'momentum': momentum_signal,
                'stochastic': stochastic_signal
            }
            
            # Calculate weighted technical score (-1 to +1)
            # Oscillators weight: 40%
            oscillator_score = (
                rsi * 0.3 +
                macd_signal * 0.25 +
                momentum_signal * 0.25 +
                stochastic_signal * 0.2
            )
            
            # Moving averages weight: 35%
            ma_score = (
                ema_signal * 0.5 +
                sma_signal * 0.5
            )
            
            # Other indicators: 25%
            other_score = (
                bb_signal * 0.4 +
                volume_signal * 0.6
            )
            
            technical_score = (
                oscillator_score * 0.4 +
                ma_score * 0.35 +
                other_score * 0.25
            )
            
            indicators['technical_score'] = technical_score
            indicators['oscillator_score'] = oscillator_score
            indicators['ma_score'] = ma_score
            
            logger.debug(f"Technical Analysis Score: {technical_score:.2f}")
            return indicators
            
        except Exception as e:
            logger.error(f"Error calculating technical indicators: {e}")
            return self._neutral_scores()
    
    def _neutral_scores(self) -> Dict[str, float]:
        """Return neutral scores when calculation fails"""
        return {
            'rsi': 0.0,
            'macd': 0.0,
            'bollinger': 0.0,
            'ema': 0.0,
            'sma': 0.0,
            'volume': 0.0,
            'momentum': 0.0,
            'stochastic': 0.0,
            'technical_score': 0.0,
            'oscillator_score': 0.0,
            'ma_score': 0.0
        }
    
    def _calculate_rsi(self, close: pd.Series, period: int = 14) -> float:
        """
        Calculate RSI (Relative Strength Index)
        Returns signal: +1 (oversold/buy), 0 (neutral), -1 (overbought/sell)
        """
        try:
            if len(close) < period + 1:
                return 0.0
            
            delta = close.diff()
            gain = delta.where(delta > 0, 0).rolling(window=period).mean()
            loss = -delta.where(delta < 0, 0).rolling(window=period).mean()
            
            rs = gain / loss
            rsi = 100 - (100 / (1 + rs))
            current_rsi = rsi.iloc[-1]
            
            # Signal logic
            if current_rsi < 30:  # Oversold - Strong Buy
                return 1.0
            elif current_rsi < 40:  # Slightly oversold - Buy
                return 0.5
            elif current_rsi > 70:  # Overbought - Strong Sell
                return -1.0
            elif current_rsi > 60:  # Slightly overbought - Sell
                return -0.5
            else:  # Neutral zone
                return 0.0
                
        except Exception as e:
            logger.error(f"Error calculating RSI: {e}")
            return 0.0
    
    def _calculate_macd(
        self,
        close: pd.Series,
        fast: int = 12,
        slow: int = 26,
        signal: int = 9
    ) -> float:
        """
        Calculate MACD (Moving Average Convergence Divergence)
        Returns signal: +1 (bullish), 0 (neutral), -1 (bearish)
        """
        try:
            if len(close) < slow + signal:
                return 0.0
            
            ema_fast = close.ewm(span=fast, adjust=False).mean()
            ema_slow = close.ewm(span=slow, adjust=False).mean()
            macd_line = ema_fast - ema_slow
            signal_line = macd_line.ewm(span=signal, adjust=False).mean()
            histogram = macd_line - signal_line
            
            current_hist = histogram.iloc[-1]
            prev_hist = histogram.iloc[-2] if len(histogram) > 1 else 0
            
            # Signal logic
            if current_hist > 0 and prev_hist <= 0:  # Bullish crossover
                return 1.0
            elif current_hist > 0:  # Above zero (bullish)
                return 0.5
            elif current_hist < 0 and prev_hist >= 0:  # Bearish crossover
                return -1.0
            elif current_hist < 0:  # Below zero (bearish)
                return -0.5
            else:
                return 0.0
                
        except Exception as e:
            logger.error(f"Error calculating MACD: {e}")
            return 0.0
    
    def _calculate_bollinger_bands(
        self,
        close: pd.Series,
        current_price: float,
        period: int = 20,
        std_dev: float = 2.0
    ) -> float:
        """
        Calculate Bollinger Bands
        Returns signal based on price position relative to bands
        """
        try:
            if len(close) < period:
                return 0.0
            
            sma = close.rolling(window=period).mean()
            std = close.rolling(window=period).std()
            
            upper_band = sma + (std * std_dev)
            lower_band = sma - (std * std_dev)
            
            current_upper = upper_band.iloc[-1]
            current_lower = lower_band.iloc[-1]
            current_middle = sma.iloc[-1]
            
            # Signal logic
            if current_price <= current_lower:  # Below lower band - Buy
                return 1.0
            elif current_price < current_middle:  # Below middle - Slight Buy
                return 0.3
            elif current_price >= current_upper:  # Above upper band - Sell
                return -1.0
            elif current_price > current_middle:  # Above middle - Slight Sell
                return -0.3
            else:
                return 0.0
                
        except Exception as e:
            logger.error(f"Error calculating Bollinger Bands: {e}")
            return 0.0
    
    def _calculate_ema_crossover(
        self,
        close: pd.Series,
        current_price: float
    ) -> float:
        """
        Calculate EMA crossover signals (20, 50, 200 periods)
        Returns aggregated signal from multiple EMAs
        """
        try:
            signals = []
            periods = [20, 50, 200]
            
            for period in periods:
                if len(close) >= period:
                    ema = close.ewm(span=period, adjust=False).mean()
                    current_ema = ema.iloc[-1]
                    
                    # Compare price to EMA
                    if current_price > current_ema:
                        signals.append(1.0)  # Bullish
                    else:
                        signals.append(-1.0)  # Bearish
            
            if not signals:
                return 0.0
            
            return sum(signals) / len(signals)
            
        except Exception as e:
            logger.error(f"Error calculating EMA crossover: {e}")
            return 0.0
    
    def _calculate_sma_crossover(
        self,
        close: pd.Series,
        current_price: float
    ) -> float:
        """
        Calculate SMA crossover signals (20, 50, 200 periods)
        Returns aggregated signal from multiple SMAs
        """
        try:
            signals = []
            periods = [20, 50, 200]
            
            for period in periods:
                if len(close) >= period:
                    sma = close.rolling(window=period).mean()
                    current_sma = sma.iloc[-1]
                    
                    # Compare price to SMA
                    if current_price > current_sma:
                        signals.append(1.0)  # Bullish
                    else:
                        signals.append(-1.0)  # Bearish
            
            if not signals:
                return 0.0
            
            return sum(signals) / len(signals)
            
        except Exception as e:
            logger.error(f"Error calculating SMA crossover: {e}")
            return 0.0
    
    def _calculate_volume_trend(
        self,
        volume: pd.Series,
        period: int = 20
    ) -> float:
        """
        Calculate volume trend
        Returns signal based on volume momentum
        """
        try:
            if len(volume) < period + 1:
                return 0.0
            
            avg_volume = volume.rolling(window=period).mean()
            current_volume = volume.iloc[-1]
            current_avg = avg_volume.iloc[-1]
            
            # Volume confirmation signal
            volume_ratio = current_volume / current_avg if current_avg > 0 else 1.0
            
            if volume_ratio > 1.5:  # High volume - Strong signal
                return 0.5
            elif volume_ratio > 1.2:  # Above average volume
                return 0.3
            elif volume_ratio < 0.7:  # Low volume - Weak signal
                return -0.3
            else:
                return 0.0
                
        except Exception as e:
            logger.error(f"Error calculating volume trend: {e}")
            return 0.0
    
    def _calculate_momentum(
        self,
        close: pd.Series,
        period: int = 10
    ) -> float:
        """
        Calculate price momentum
        Returns signal based on momentum direction
        """
        try:
            if len(close) < period + 1:
                return 0.0
            
            momentum = close - close.shift(period)
            current_momentum = momentum.iloc[-1]
            
            # Normalize momentum as percentage
            momentum_pct = (current_momentum / close.iloc[-period-1]) * 100
            
            # Signal logic
            if momentum_pct > 5:  # Strong upward momentum
                return 1.0
            elif momentum_pct > 2:  # Moderate upward momentum
                return 0.5
            elif momentum_pct < -5:  # Strong downward momentum
                return -1.0
            elif momentum_pct < -2:  # Moderate downward momentum
                return -0.5
            else:
                return 0.0
                
        except Exception as e:
            logger.error(f"Error calculating momentum: {e}")
            return 0.0
    
    def _calculate_stochastic(
        self,
        high: pd.Series,
        low: pd.Series,
        close: pd.Series,
        k_period: int = 14,
        d_period: int = 3
    ) -> float:
        """
        Calculate Stochastic Oscillator (%K and %D)
        Returns signal based on stochastic levels
        """
        try:
            if len(close) < k_period + d_period:
                return 0.0
            
            # Calculate %K
            lowest_low = low.rolling(window=k_period).min()
            highest_high = high.rolling(window=k_period).max()
            
            k_percent = 100 * ((close - lowest_low) / (highest_high - lowest_low))
            d_percent = k_percent.rolling(window=d_period).mean()
            
            current_k = k_percent.iloc[-1]
            current_d = d_percent.iloc[-1]
            
            # Signal logic
            if current_k < 20 and current_d < 20:  # Oversold
                return 1.0
            elif current_k < 30:  # Slightly oversold
                return 0.5
            elif current_k > 80 and current_d > 80:  # Overbought
                return -1.0
            elif current_k > 70:  # Slightly overbought
                return -0.5
            else:
                return 0.0
                
        except Exception as e:
            logger.error(f"Error calculating Stochastic: {e}")
            return 0.0
    
    def get_recommendation_from_score(self, technical_score: float) -> str:
        """
        Convert technical score to recommendation label
        
        Args:
            technical_score: Score from -1 (strong sell) to +1 (strong buy)
            
        Returns:
            Recommendation label
        """
        if technical_score >= 0.6:
            return "STRONG_BUY"
        elif technical_score >= 0.2:
            return "BUY"
        elif technical_score >= -0.2:
            return "HOLD"
        elif technical_score >= -0.6:
            return "SELL"
        else:
            return "STRONG_SELL"


# Global instance
technical_analysis = TechnicalAnalysis()
