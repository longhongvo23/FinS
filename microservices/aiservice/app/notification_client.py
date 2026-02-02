"""
Notification Service Client for AI Service
Sends notifications to NotificationService when AI generates recommendations
"""

import httpx
from loguru import logger
from typing import List
from app.config import settings


class NotificationClient:
    """HTTP client to call NotificationService and UserService internal APIs"""
    
    def __init__(self):
        self.notification_url = getattr(settings, 'NOTIFICATION_SERVICE_URL', 'http://notificationservice:8085')
        self.user_service_url = getattr(settings, 'USER_SERVICE_URL', 'http://userservice:8081')
    
    async def get_users_watching_symbol(self, symbol: str) -> List[str]:
        """
        Get all user IDs who have this symbol in their watchlist
        
        Args:
            symbol: Stock symbol
            
        Returns:
            List of user IDs
        """
        try:
            async with httpx.AsyncClient(timeout=10.0) as client:
                response = await client.get(
                    f"{self.user_service_url}/api/internal/watchlist/users/{symbol}"
                )
                
                if response.status_code == 200:
                    user_ids = response.json()
                    logger.debug(f"Found {len(user_ids)} users watching {symbol}")
                    return user_ids
                else:
                    logger.warning(f"Failed to get users for {symbol}: {response.status_code}")
                    return []
                    
        except Exception as e:
            logger.error(f"Error getting users for {symbol}: {e}")
            return []
    
    async def send_ai_recommendation(
        self, 
        symbol: str, 
        recommendation: str, 
        percent_change: float,
        forecast_days: int,
        confidence: float,
        reason: str = None
    ) -> bool:
        """
        Send AI Prophet recommendation notification to all users watching this symbol
        
        Args:
            symbol: Stock symbol
            recommendation: BUY/SELL/HOLD
            percent_change: Predicted price change percentage
            forecast_days: Number of days forecasted
            confidence: Confidence score (0-1)
            reason: Optional reason/explanation
        
        Returns:
            bool: True if notification sent successfully
        """
        try:
            # Get users watching this symbol
            user_ids = await self.get_users_watching_symbol(symbol)
            
            if not user_ids:
                logger.info(f"No users watching {symbol}, skipping notification")
                return True  # Not an error, just no one to notify
            
            # Calculate predicted price as formatted string (if not provided)
            predicted_price = reason if reason else f"${percent_change:+.2f}%"
            
            # Send notification to each user
            success_count = 0
            for user_id in user_ids:
                payload = {
                    "userId": user_id,
                    "symbol": symbol,
                    "predictedChange": percent_change,
                    "predictedPrice": predicted_price,
                    "forecastDays": forecast_days,
                    "confidence": confidence
                }
                
                try:
                    async with httpx.AsyncClient(timeout=10.0) as client:
                        response = await client.post(
                            f"{self.notification_url}/api/internal/notifications/ai/prophet",
                            json=payload
                        )
                        
                        if response.status_code in [200, 201]:
                            success_count += 1
                        else:
                            logger.warning(f"Failed to send notification to user {user_id}: {response.status_code}")
                except Exception as e:
                    logger.error(f"Error sending notification to user {user_id}: {e}")
            
            logger.info(f"✅ Sent {success_count}/{len(user_ids)} AI Prophet notifications for {symbol}")
            return success_count > 0
                    
        except Exception as e:
            logger.error(f"Error sending AI recommendation notification for {symbol}: {e}")
            return False


# Global instance
notification_client = NotificationClient()
