from datetime import datetime, date
from typing import Optional, List
from pydantic import BaseModel, Field


class HistoricalPrice(BaseModel):
    """Model for historical price data from MongoDB"""
    symbol: str
    datetime: str
    interval: str
    open: float
    high: float
    low: float
    close: float
    volume: int


class RecommendationMetadata(BaseModel):
    """Metadata from Prophet prediction model"""
    predicted_price: Optional[float] = None
    current_price: Optional[float] = None
    change_percent: Optional[float] = None
    confidence_lower: Optional[float] = None
    confidence_upper: Optional[float] = None


class Recommendation(BaseModel):
    """Model for recommendation data matching JDL entity"""
    id: Optional[str] = Field(None, alias="_id")
    symbol: str
    period: date
    recommendation: Optional[str] = None
    buy: int = Field(ge=0, default=0)
    hold: int = Field(ge=0, default=0)
    sell: int = Field(ge=0, default=0)
    strong_buy: int = Field(ge=0, default=0, alias="strongBuy")
    strong_sell: int = Field(ge=0, default=0, alias="strongSell")
    # Company reference for relationship (optional)
    company: Optional[dict] = None
    # Metadata from Prophet model
    metadata: Optional[RecommendationMetadata] = None
    created_at: Optional[datetime] = Field(default_factory=datetime.utcnow)
    updated_at: Optional[datetime] = Field(default_factory=datetime.utcnow)

    class Config:
        populate_by_name = True
        json_encoders = {
            datetime: lambda v: v.isoformat(),
            date: lambda v: v.isoformat()
        }


class PredictionRequest(BaseModel):
    """Request model for prediction endpoint"""
    symbol: str
    forecast_days: Optional[int] = 14


PREDICTION_DISCLAIMER = (
    "Dự đoán này chỉ mang tính tham khảo, không phải lời khuyên đầu tư. "
    "Mô hình AI có thể sai và không đảm bảo lợi nhuận. "
    "Hãy tự nghiên cứu trước khi đưa ra quyết định đầu tư."
)


class PredictionResponse(BaseModel):
    """Response model for prediction endpoint"""
    symbol: str
    forecast_days: int
    prediction_date: date
    current_price: float
    predicted_price: float
    change_percent: float
    recommendation: str
    confidence_interval_lower: Optional[float] = None
    confidence_interval_upper: Optional[float] = None
    disclaimer: str = PREDICTION_DISCLAIMER
    created_at: datetime = Field(default_factory=datetime.utcnow)


class BatchPredictionRequest(BaseModel):
    """Request model for batch prediction"""
    symbols: List[str]
    forecast_days: Optional[int] = 14


class ForecastDataPoint(BaseModel):
    """Single data point for forecast chart"""
    date: str
    actual: Optional[float] = None  # Historical actual price
    predicted: Optional[float] = None  # Predicted price
    lower: Optional[float] = None  # Lower confidence bound
    upper: Optional[float] = None  # Upper confidence bound
    confidence_pct: Optional[float] = None  # Confidence % (decreases over time)


class ForecastChartResponse(BaseModel):
    """Response model for forecast chart data"""
    symbol: str
    forecast_days: int
    current_price: float
    predicted_price: float
    change_percent: float
    recommendation: str
    data: List[ForecastDataPoint]  # Chart data points
    disclaimer: str = PREDICTION_DISCLAIMER
    created_at: datetime = Field(default_factory=datetime.utcnow)
    # Data freshness information
    last_data_date: Optional[str] = None  # Last date of historical data
    data_age_days: Optional[int] = None  # How many days old the data is
    is_data_fresh: Optional[bool] = True  # Whether data is fresh (<= 1 day old)


class BacktestResult(BaseModel):
    """Result of a single backtest window"""
    train_end_date: str
    predicted_price: float
    actual_price: float
    error_pct: float  # (predicted - actual) / actual * 100
    direction_correct: bool  # Did we predict the right direction?


class BacktestResponse(BaseModel):
    """Response model for backtesting endpoint"""
    symbol: str
    forecast_days: int
    windows: List[BacktestResult]
    mape: float  # Mean Absolute Percentage Error
    direction_accuracy: float  # % of times direction was correct
    mean_error_pct: float  # Average signed error %
    disclaimer: str = PREDICTION_DISCLAIMER


class HealthResponse(BaseModel):
    """Health check response"""
    status: str
    service: str
    version: str
    timestamp: datetime = Field(default_factory=datetime.utcnow)
    dependencies: dict = {}
