from fastapi import FastAPI, HTTPException, BackgroundTasks, Query
from fastapi.middleware.cors import CORSMiddleware
from contextlib import asynccontextmanager
from typing import List, Optional
from datetime import datetime
import asyncio
from loguru import logger
import sys

from app.config import settings
from app.models import (
    PredictionRequest,
    PredictionResponse,
    BatchPredictionRequest,
    HealthResponse,
    Recommendation,
    ForecastChartResponse
)
from app.database import mongodb_service
from app.prophet_service import prediction_service
from app.kafka_service import kafka_service
from app.scheduler import scheduler_service


# Configure logging
logger.remove()
logger.add(
    sys.stdout,
    format="<green>{time:YYYY-MM-DD HH:mm:ss}</green> | <level>{level: <8}</level> | <cyan>{name}</cyan>:<cyan>{function}</cyan> - <level>{message}</level>",
    level=settings.LOG_LEVEL
)


@asynccontextmanager
async def lifespan(app: FastAPI):
    """Startup and shutdown events"""
    # Startup
    logger.info(f"Starting {settings.APP_NAME} v{settings.APP_VERSION}")
    
    try:
        # Connect to MongoDB
        await mongodb_service.connect()
        
        # Start Kafka producer (with retry)
        await kafka_service.start_producer()
        
        # Start consumer in background (with retry)
        asyncio.create_task(start_kafka_consumer())
        
        # Register with Consul if enabled
        if settings.SERVICE_DISCOVERY_ENABLED:
            asyncio.create_task(register_with_consul())
        
        # Start scheduler (will skip jobs if data not ready)
        await scheduler_service.start()
        
        logger.info("✅ All services started successfully")
    except Exception as e:
        logger.error(f"Failed to start services: {e}")
        raise
    
    yield
    
    # Shutdown
    logger.info("Shutting down services...")
    if settings.SERVICE_DISCOVERY_ENABLED:
        await deregister_from_consul()
    await scheduler_service.stop()
    await kafka_service.stop_producer()
    await kafka_service.stop_consumer()
    await mongodb_service.disconnect()
    logger.info("All services stopped")


async def start_kafka_consumer():
    """Start Kafka consumer in background"""
    try:
        await kafka_service.start_consumer()
        await kafka_service.consume_stock_updates()
    except Exception as e:
        logger.error(f"Kafka consumer error: {e}")


async def register_with_consul():
    """Register service with Consul"""
    try:
        import httpx
        
        service_id = f"{settings.APP_NAME}-{settings.APP_PORT}"
        
        registration = {
            "ID": service_id,
            "Name": settings.APP_NAME,
            "Tags": ["ai", "prediction", "prophet", "python"],
            "Address": "aiservice",
            "Port": settings.APP_PORT,
            "Check": {
                "HTTP": f"http://aiservice:{settings.APP_PORT}/health",
                "Interval": "30s",
                "Timeout": "10s",
                "DeregisterCriticalServiceAfter": "90s"
            },
            "Meta": {
                "version": settings.APP_VERSION,
                "framework": "fastapi",
                "language": "python"
            }
        }
        
        async with httpx.AsyncClient() as client:
            response = await client.put(
                f"http://{settings.CONSUL_HOST}:{settings.CONSUL_PORT}/v1/agent/service/register",
                json=registration,
                timeout=10.0
            )
            
            if response.status_code == 200:
                logger.info(f"Successfully registered with Consul: {service_id}")
            else:
                logger.error(f"Failed to register with Consul: {response.status_code}")
                
    except Exception as e:
        logger.error(f"Error registering with Consul: {e}")


async def deregister_from_consul():
    """Deregister service from Consul"""
    try:
        import httpx
        
        service_id = f"{settings.APP_NAME}-{settings.APP_PORT}"
        
        async with httpx.AsyncClient() as client:
            response = await client.put(
                f"http://{settings.CONSUL_HOST}:{settings.CONSUL_PORT}/v1/agent/service/deregister/{service_id}",
                timeout=10.0
            )
            
            if response.status_code == 200:
                logger.info(f"Successfully deregistered from Consul: {service_id}")
            else:
                logger.warning(f"Failed to deregister from Consul: {response.status_code}")
                
    except Exception as e:
        logger.warning(f"Error deregistering from Consul: {e}")


# Create FastAPI app
app = FastAPI(
    title=settings.APP_NAME,
    version=settings.APP_VERSION,
    description="AI Service for Stock Price Prediction using Prophet",
    lifespan=lifespan
)

# CORS middleware - DISABLED: Gateway handles CORS
# When running behind Spring Cloud Gateway, do not add CORS headers here
# to avoid duplicate Access-Control-Allow-Origin headers
# app.add_middleware(
#     CORSMiddleware,
#     allow_origins=["*"],
#     allow_credentials=True,
#     allow_methods=["*"],
#     allow_headers=["*"],
# )


@app.get("/", tags=["Root"])
async def root():
    """Root endpoint"""
    return {
        "service": settings.APP_NAME,
        "version": settings.APP_VERSION,
        "status": "running",
        "timestamp": datetime.utcnow()
    }


@app.get("/health", response_model=HealthResponse, tags=["Health"])
async def health_check():
    """Health check endpoint"""
    dependencies = {}
    
    # Check MongoDB
    try:
        await mongodb_service.client.admin.command('ping')
        dependencies["mongodb"] = "healthy"
    except:
        dependencies["mongodb"] = "unhealthy"
    
    # Check Kafka
    try:
        if kafka_service.producer:
            dependencies["kafka"] = "healthy"
        else:
            dependencies["kafka"] = "not_initialized"
    except:
        dependencies["kafka"] = "unhealthy"
    
    overall_status = "healthy" if all(
        v == "healthy" for v in dependencies.values()
    ) else "degraded"
    
    return HealthResponse(
        status=overall_status,
        service=settings.APP_NAME,
        version=settings.APP_VERSION,
        dependencies=dependencies
    )


@app.post("/api/predict", response_model=PredictionResponse, tags=["Prediction"])
async def predict_stock(request: PredictionRequest):
    """
    Predict stock price for a single symbol
    """
    try:
        prediction = await prediction_service.predict(
            symbol=request.symbol,
            forecast_days=request.forecast_days
        )
        
        if prediction is None:
            raise HTTPException(
                status_code=404,
                detail=f"Unable to generate prediction for {request.symbol}. "
                       f"Insufficient historical data (minimum 30 days required). "
                       f"Please wait for crawlservice to collect more data."
            )
        
        return PredictionResponse(**prediction)
    
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error in predict endpoint: {e}")
        raise HTTPException(status_code=500, detail=str(e))


@app.get("/api/forecast/{symbol}", response_model=ForecastChartResponse, tags=["Prediction"])
async def get_forecast_chart(
    symbol: str,
    forecast_days: Optional[int] = Query(30, ge=1, le=90, description="Number of days to forecast"),
    history_days: Optional[int] = Query(90, ge=30, le=365, description="Number of historical days to include")
):
    """
    Get forecast chart data for a symbol (historical + predicted)
    """
    try:
        forecast_data = await prediction_service.get_forecast_chart_data(
            symbol=symbol.upper(),
            forecast_days=forecast_days,
            history_days=history_days
        )
        
        if forecast_data is None:
            raise HTTPException(
                status_code=404,
                detail=f"Unable to generate forecast for {symbol}. "
                       f"Insufficient historical data (minimum 30 days required)."
            )
        
        return ForecastChartResponse(**forecast_data)
    
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error in forecast chart endpoint: {e}")
        raise HTTPException(status_code=500, detail=str(e))


@app.post("/api/predict/batch", tags=["Prediction"])
async def predict_batch(
    request: BatchPredictionRequest,
    background_tasks: BackgroundTasks
):
    """
    Predict stock prices for multiple symbols (async in background)
    """
    try:
        # Add batch prediction to background tasks
        background_tasks.add_task(
            run_batch_predictions,
            request.symbols,
            request.forecast_days
        )
        
        return {
            "message": f"Batch prediction started for {len(request.symbols)} symbols",
            "symbols": request.symbols,
            "status": "processing"
        }
    
    except Exception as e:
        logger.error(f"Error in batch predict endpoint: {e}")
        raise HTTPException(status_code=500, detail=str(e))


async def run_batch_predictions(symbols: List[str], forecast_days: int):
    """Run batch predictions in background"""
    logger.info(f"Starting batch predictions for {len(symbols)} symbols")
    
    for symbol in symbols:
        try:
            recommendation = await prediction_service.generate_recommendation(
                symbol=symbol,
                forecast_days=forecast_days
            )
            
            if recommendation:
                await kafka_service.publish_prediction(recommendation)
                
        except Exception as e:
            logger.error(f"Error predicting {symbol} in batch: {e}")


@app.post("/api/recommendation/generate", response_model=Recommendation, tags=["Recommendation"])
async def generate_recommendation(request: PredictionRequest):
    """
    Generate and save recommendation for a symbol
    """
    try:
        recommendation = await prediction_service.generate_recommendation(
            symbol=request.symbol,
            forecast_days=request.forecast_days
        )
        
        if recommendation is None:
            raise HTTPException(
                status_code=404,
                detail=f"Unable to generate recommendation for {request.symbol}"
            )
        
        # Publish to Kafka
        await kafka_service.publish_prediction(recommendation)
        
        return Recommendation(**recommendation)
    
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error in generate recommendation endpoint: {e}")
        raise HTTPException(status_code=500, detail=str(e))


@app.get("/api/recommendation/{symbol}", response_model=Recommendation, tags=["Recommendation"])
async def get_recommendation(symbol: str):
    """
    Get latest recommendation for a symbol
    """
    try:
        recommendation = await mongodb_service.get_recommendation(symbol)
        
        if recommendation is None:
            raise HTTPException(
                status_code=404,
                detail=f"No recommendation found for {symbol}"
            )
        
        return Recommendation(**recommendation)
    
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error in get recommendation endpoint: {e}")
        raise HTTPException(status_code=500, detail=str(e))


@app.get("/api/symbols", tags=["Symbols"])
async def get_symbols():
    """
    Get all available symbols with data statistics
    """
    try:
        symbols = await mongodb_service.get_all_symbols()
        
        # Get data count for first few symbols as sample
        sample_counts = {}
        for symbol in symbols[:5]:
            data = await mongodb_service.get_historical_prices(symbol, days=365)
            sample_counts[symbol] = len(data)
        
        return {
            "symbols": symbols,
            "count": len(symbols),
            "sample_data_counts": sample_counts,
            "note": "Minimum 30 days of historical data required for predictions"
        }
    except Exception as e:
        logger.error(f"Error in get symbols endpoint: {e}")
        raise HTTPException(status_code=500, detail=str(e))


@app.post("/api/admin/run-predictions", tags=["Admin"])
async def trigger_predictions(background_tasks: BackgroundTasks):
    """
    Manually trigger predictions for all symbols
    """
    try:
        background_tasks.add_task(scheduler_service.run_daily_predictions)
        return {
            "message": "Prediction job triggered",
            "status": "processing"
        }
    except Exception as e:
        logger.error(f"Error triggering predictions: {e}")
        raise HTTPException(status_code=500, detail=str(e))


if __name__ == "__main__":
    import uvicorn
    uvicorn.run(
        "app.main:app",
        host="0.0.0.0",
        port=settings.APP_PORT,
        reload=True
    )
