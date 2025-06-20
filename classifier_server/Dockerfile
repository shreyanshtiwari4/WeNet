## Dockerfile for FastAPI zero-shot-classification service

# 1. Use official slim Python base image
FROM python:3.13-slim

# 2. Set environment variables to avoid Python buffering and set workdir
ENV PYTHONUNBUFFERED=1 \
    HF_HOME=/app/.cache/huggingface
WORKDIR /app

# 3. Install system dependencies
RUN apt-get update && \
    apt-get install -y --no-install-recommends git build-essential && \
    rm -rf /var/lib/apt/lists/*

# 4. Copy requirements and install Python dependencies
COPY requirements.txt ./
RUN pip install --no-cache-dir -r requirements.txt

# 5. Copy application code
COPY classifier_api.py ./

# 6. Expose port
EXPOSE 50000

# 7. Start the server
CMD ["uvicorn", "classifier_api:app", "--host", "0.0.0.0", "--port", "50000", "--workers", "2"]
