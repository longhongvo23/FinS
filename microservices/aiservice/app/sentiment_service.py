"""
Sentiment Analysis Service
Fetches news sentiment data from newsservice and computes aggregated sentiment signal.
"""

import httpx
from datetime import datetime, timedelta
from typing import Optional
from loguru import logger

from app.config import settings


class SentimentService:
    """
    Fetches news sentiment for stock symbols from the newsservice internal API.
    Computes a weighted sentiment score (-1 to +1) based on recent news articles.
    """

    def __init__(self):
        self.news_service_url = settings.NEWS_SERVICE_URL
        self.timeout = 10.0

    async def get_sentiment_score(self, symbol: str, days: int = 7) -> float:
        """
        Get aggregated sentiment score for a symbol from recent news.
        
        Returns:
            Sentiment score between -1.0 (very negative) and +1.0 (very positive).
            Returns 0.0 (neutral) if no news data is available.
        """
        try:
            url = f"{self.news_service_url}/api/internal/news/symbol/{symbol}"
            
            async with httpx.AsyncClient(timeout=self.timeout) as client:
                response = await client.get(url)
            
            if response.status_code != 200:
                logger.debug(f"No news data for {symbol} (status {response.status_code})")
                return 0.0
            
            articles = response.json()
            if not articles or not isinstance(articles, list):
                return 0.0
            
            # Filter articles from the last N days
            cutoff = datetime.utcnow() - timedelta(days=days)
            scored_articles = []
            
            for article in articles:
                # Parse published_at
                published_at = article.get('published_at') or article.get('publishedAt')
                if not published_at:
                    continue
                
                try:
                    if isinstance(published_at, str):
                        # Handle various date formats
                        for fmt in ('%Y-%m-%dT%H:%M:%S.%fZ', '%Y-%m-%dT%H:%M:%SZ', '%Y-%m-%dT%H:%M:%S'):
                            try:
                                pub_date = datetime.strptime(published_at, fmt)
                                break
                            except ValueError:
                                continue
                        else:
                            continue
                    else:
                        pub_date = published_at
                    
                    if pub_date < cutoff:
                        continue
                except (ValueError, TypeError):
                    continue
                
                # Extract sentiment from entities
                entities = article.get('entities', [])
                for entity in entities:
                    entity_symbol = entity.get('symbol', '')
                    if entity_symbol.upper() == symbol.upper():
                        sentiment = entity.get('sentiment_score') or entity.get('sentimentScore')
                        if sentiment is not None:
                            try:
                                score = float(sentiment)
                                relevance = float(entity.get('match_score') or entity.get('matchScore') or 1.0)
                                days_ago = max((datetime.utcnow() - pub_date).days, 0)
                                # More recent = higher weight (exponential decay)
                                recency_weight = 0.9 ** days_ago
                                scored_articles.append({
                                    'score': score,
                                    'weight': relevance * recency_weight
                                })
                            except (ValueError, TypeError):
                                continue
            
            if not scored_articles:
                logger.debug(f"No scored news articles for {symbol}")
                return 0.0
            
            # Weighted average sentiment
            total_weight = sum(a['weight'] for a in scored_articles)
            if total_weight == 0:
                return 0.0
            
            weighted_sentiment = sum(a['score'] * a['weight'] for a in scored_articles) / total_weight
            
            # Clamp to [-1, 1]
            sentiment = max(-1.0, min(1.0, weighted_sentiment))
            
            logger.info(
                f"📰 Sentiment for {symbol}: {sentiment:.3f} "
                f"({len(scored_articles)} articles in last {days} days)"
            )
            return sentiment
            
        except httpx.ConnectError:
            logger.debug(f"Cannot connect to newsservice for sentiment ({symbol})")
            return 0.0
        except Exception as e:
            logger.warning(f"Error fetching sentiment for {symbol}: {e}")
            return 0.0


# Global instance
sentiment_service = SentimentService()
