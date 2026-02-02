from apscheduler.schedulers.asyncio import AsyncIOScheduler
from apscheduler.triggers.cron import CronTrigger
from loguru import logger

from app.config import settings
from app.database import mongodb_service
from app.prophet_service import prediction_service
from app.kafka_service import kafka_service
from app.notification_client import notification_client


class SchedulerService:
    """Service for scheduled tasks"""

    def __init__(self):
        self.scheduler = AsyncIOScheduler()

    async def start(self):
        """Start scheduler"""
        if settings.AUTO_PREDICTION_ENABLED:
            # Add daily prediction job
            self.scheduler.add_job(
                self.run_daily_predictions,
                CronTrigger.from_crontab(settings.PREDICTION_CRON_SCHEDULE),
                id='daily_predictions',
                name='Daily Stock Predictions',
                replace_existing=True
            )
            logger.info(
                f"Scheduled daily predictions: {settings.PREDICTION_CRON_SCHEDULE}"
            )

        self.scheduler.start()
        logger.info("Scheduler started")

    async def stop(self):
        """Stop scheduler"""
        if self.scheduler.running:
            self.scheduler.shutdown()
            logger.info("Scheduler stopped")

    async def run_daily_predictions(self):
        """Run predictions for all symbols - skip gracefully if no data"""
        try:
            logger.info("📅 Starting daily prediction job...")
            
            # Get all symbols
            symbols = await mongodb_service.get_all_symbols()
            
            if not symbols:
                logger.info("⏭️  No symbols found in database yet. Skipping predictions (waiting for crawlservice to collect data).")
                return

            logger.info(f"🎯 Found {len(symbols)} symbols, checking data availability...")
            
            success_count = 0
            failed_count = 0
            skipped_count = 0

            for symbol in symbols:
                try:
                    # Quick check if symbol has minimum data
                    data = await mongodb_service.get_historical_prices(symbol, days=30)
                    
                    if len(data) < 30:
                        logger.debug(f"⏭️  Skipping {symbol}: only {len(data)} days of data (minimum 30 required)")
                        skipped_count += 1
                        continue
                    
                    recommendation = await prediction_service.generate_recommendation(
                        symbol=symbol
                    )
                    
                    if recommendation:
                        success_count += 1
                        
                        # Publish to Kafka (gracefully handle if Kafka not available)
                        await kafka_service.publish_prediction(recommendation)
                        
                        # Send notification to users
                        await notification_client.send_ai_recommendation(
                            symbol=recommendation.get('symbol', symbol),
                            recommendation=recommendation.get('recommendation', 'HOLD'),
                            percent_change=recommendation.get('predicted_change_percent', 0),
                            forecast_days=recommendation.get('forecast_days', 7),
                            confidence=recommendation.get('confidence', 0.5),
                            reason=recommendation.get('reason')
                        )
                    else:
                        failed_count += 1
                        
                except Exception as e:
                    logger.error(f"❌ Error predicting {symbol}: {e}")
                    failed_count += 1

            logger.info(
                f"✅ Daily prediction job completed: "
                f"{success_count} succeeded, {failed_count} failed, {skipped_count} skipped (insufficient data)"
            )
            
            if skipped_count > 0:
                logger.info(
                    f"💡 Tip: {skipped_count} symbols were skipped due to insufficient data. "
                    f"Wait for crawlservice to collect more historical data (minimum 30 days)."
                )

        except Exception as e:
            logger.error(f"❌ Error in daily prediction job: {e}")


# Global instance
scheduler_service = SchedulerService()
