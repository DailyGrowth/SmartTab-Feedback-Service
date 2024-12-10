#!/bin/bash

# Deployment and Monitoring Script for SmartTab Feedback Service

# Prerequisite: 
# 1. gcloud CLI installed and authenticated
# 2. Docker installed
# 3. Project created and configured

# Configuration
PROJECT_ID=$(gcloud config get-value project)
SERVICE_NAME="smarttab-feedback-service"
REGION="us-central1"

# Build Docker Image
build_image() {
    docker build -t gcr.io/$PROJECT_ID/$SERVICE_NAME:latest .
    docker push gcr.io/$PROJECT_ID/$SERVICE_NAME:latest
}

# Deploy to Cloud Run
deploy_service() {
    gcloud run deploy $SERVICE_NAME \
        --image gcr.io/$PROJECT_ID/$SERVICE_NAME:latest \
        --platform managed \
        --region $REGION \
        --allow-unauthenticated \
        --set-env-vars-file=secrets.env
}

# Set up Monitoring with Cloud Monitoring
setup_monitoring() {
    # Create Uptime Check
    gcloud monitoring uptime-check create \
        --display-name="SmartTab Feedback Service Health" \
        --resource-type=url \
        --hostname=$(gcloud run services describe $SERVICE_NAME --region=$REGION --format="value(status.url)") \
        --path="/health"

    # Create Alert Policy
    gcloud alpha monitoring policies create \
        --display-name="SmartTab Service Availability" \
        --condition-filter="metric.type=\"run.googleapis.com/request_count\" AND resource.type=\"cloud_run_revision\"" \
        --condition-threshold-value=1 \
        --condition-duration=60s
}

# Log Export to Cloud Storage
setup_log_export() {
    # Create log sink to Cloud Storage
    gcloud logging sinks create smarttab-feedback-logs \
        storage.googleapis.com/projects/$PROJECT_ID/buckets/smarttab-logs \
        --log-filter='resource.type="cloud_run_revision"'
}

# Main Execution
main() {
    echo "Starting SmartTab Feedback Service Deployment"
    
    build_image
    deploy_service
    setup_monitoring
    setup_log_export

    echo "Deployment Complete!"
    echo "Service URL: $(gcloud run services describe $SERVICE_NAME --region=$REGION --format="value(status.url)")"
}

# Error Handling
trap 'echo "Error occurred during deployment"' ERR

# Run Main
main
