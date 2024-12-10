# Use official Python runtime as base image
FROM python:3.9-slim-buster

# Set working directory
WORKDIR /app

# Install system dependencies
RUN apt-get update && apt-get install -y \
    build-essential \
    && rm -rf /var/lib/apt/lists/*

# Copy requirements file
COPY requirements.txt .

# Install Python dependencies
RUN pip install --no-cache-dir -r requirements.txt

# Copy project files
COPY . .

# Expose port for the application
EXPOSE 5000

# Set environment variables
ENV FLASK_APP=feedback_api.py
ENV FLASK_RUN_HOST=0.0.0.0

# Run the application
CMD ["gunicorn", "-b", "0.0.0.0:5000", "feedback_api:app"]
