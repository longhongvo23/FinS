from pydantic_settings import BaseSettings
from typing import Optional


class Settings(BaseSettings):
    # Application
    APP_NAME: str = "aiservice"
    APP_VERSION: str = "1.0.0"
    APP_ENV: str = "development"
    APP_PORT: int = 8086

    # MongoDB
    MONGODB_URI: str = "mongodb://mongodb:27017"
    MONGODB_DATABASE: str = "stockservice"
    HISTORICAL_PRICE_COLLECTION: str = "historical_price_ts"
    RECOMMENDATION_COLLECTION: str = "recommendation"

    # Kafka
    KAFKA_BOOTSTRAP_SERVERS: str = "kafka:9092"
    KAFKA_TOPIC_STOCK_UPDATES: str = "stock.updates"
    KAFKA_TOPIC_PREDICTIONS: str = "predictions.recommendations"
    KAFKA_GROUP_ID: str = "aiservice-consumer"
    KAFKA_AUTO_CREATE_TOPICS: bool = True

    # Prophet Model
    PROPHET_FORECAST_DAYS: int = 30
    PROPHET_CHANGEPOINT_PRIOR_SCALE: float = 0.25
    PROPHET_SEASONALITY_MODE: str = "multiplicative"
    PROPHET_INTERVAL_WIDTH: float = 0.95

    # Recommendation Thresholds (%)
    STRONG_BUY_THRESHOLD: float = 10.0
    BUY_THRESHOLD: float = 5.0
    HOLD_THRESHOLD: float = 2.0
    SELL_THRESHOLD: float = -5.0
    STRONG_SELL_THRESHOLD: float = -10.0

    # Scheduling
    PREDICTION_CRON_SCHEDULE: str = "0 0 * * *"
    AUTO_PREDICTION_ENABLED: bool = True
    MIN_HISTORICAL_DAYS: int = 30

    # Logging
    LOG_LEVEL: str = "INFO"
    LOG_FORMAT: str = "json"

    # Service Discovery
    CONSUL_HOST: str = "consul"
    CONSUL_PORT: int = 8500
    SERVICE_DISCOVERY_ENABLED: bool = False
    
    # Service URLs
    NOTIFICATION_SERVICE_URL: str = "http://notificationservice:8085"
    USER_SERVICE_URL: str = "http://userservice:8081"

    class Config:
        env_file = ".env"
        case_sensitive = True


settings = Settings()
