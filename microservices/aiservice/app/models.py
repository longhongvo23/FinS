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


class Recommendation(BaseModel):
    """Model for recommendation data matching JDL entity"""
    id: Optional[str] = Field(None, alias="_id")
    symbol: str
    period: date
    buy: int = Field(ge=0, default=0)
    hold: int = Field(ge=0, default=0)
    sell: int = Field(ge=0, default=0)
    strong_buy: int = Field(ge=0, default=0, alias="strongBuy")
    strong_sell: int = Field(ge=0, default=0, alias="strongSell")
    # Company reference for relationship (optional)
    company: Optional[dict] = None
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
    forecast_days: Optional[int] = 30


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
    created_at: datetime = Field(default_factory=datetime.utcnow)


class BatchPredictionRequest(BaseModel):
    """Request model for batch prediction"""
    symbols: List[str]
    forecast_days: Optional[int] = 30


class ForecastDataPoint(BaseModel):
    """Single data point for forecast chart"""
    date: str
    actual: Optional[float] = None  # Historical actual price
    predicted: Optional[float] = None  # Predicted price
    lower: Optional[float] = None  # Lower confidence bound
    upper: Optional[float] = None  # Upper confidence bound


class ForecastChartResponse(BaseModel):
    """Response model for forecast chart data"""
    symbol: str
    forecast_days: int
    current_price: float
    predicted_price: float
    change_percent: float
    recommendation: str
    data: List[ForecastDataPoint]  # Chart data points
    created_at: datetime = Field(default_factory=datetime.utcnow)


class HealthResponse(BaseModel):
    """Health check response"""
    status: str
    service: str
    version: str
    timestamp: datetime = Field(default_factory=datetime.utcnow)
    dependencies: dict = {}
