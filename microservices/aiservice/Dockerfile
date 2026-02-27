FROM python:3.11-slim

WORKDIR /app

# Install basic system dependencies (Prophet still needs a compiler)
RUN apt-get update && apt-get install -y \
    build-essential \
    libgomp1 \
    && rm -rf /var/lib/apt/lists/*

# Copy requirements first for better caching
COPY requirements.txt .

# Install Python dependencies
RUN pip install --no-cache-dir --upgrade pip && \
    pip install --no-cache-dir setuptools wheel && \
    pip install --no-cache-dir -r requirements.txt

# Copy application code
COPY . .

# Set permissions
RUN useradd -m -u 1000 aiservice && chown -R aiservice:aiservice /app
USER aiservice

EXPOSE 8086

# Run the application
CMD ["uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "8086"]
