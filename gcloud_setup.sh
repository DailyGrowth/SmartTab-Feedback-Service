#!/bin/bash

# Google Cloud Project Setup for SmartTab

# Prerequisite: Install gcloud CLI and login first
# Run: 
# 1. gcloud auth login
# 2. gcloud components update

# Project Configuration
PROJECT_ID="smarttab-feedback-$(date +%Y%m%d)"
REGION="us-central1"
SERVICE_ACCOUNT_NAME="smarttab-feedback-sa"

# Create Project
gcloud projects create $PROJECT_ID \
    --name="SmartTab Feedback Service" \
    --set-as-default

# Enable Required APIs
gcloud services enable \
    firestore.googleapis.com \
    cloudfunctions.googleapis.com \
    cloudapis.googleapis.com \
    run.googleapis.com

# Create Service Account
gcloud iam service-accounts create $SERVICE_ACCOUNT_NAME \
    --display-name="SmartTab Feedback Service Account"

# Grant Necessary Permissions
gcloud projects add-iam-policy-binding $PROJECT_ID \
    --member="serviceAccount:$SERVICE_ACCOUNT_NAME@$PROJECT_ID.iam.gserviceaccount.com" \
    --role="roles/firestore.admin"

gcloud projects add-iam-policy-binding $PROJECT_ID \
    --member="serviceAccount:$SERVICE_ACCOUNT_NAME@$PROJECT_ID.iam.gserviceaccount.com" \
    --role="roles/cloudfunctions.invoker"

# Create Credentials JSON
gcloud iam service-accounts keys create \
    ./credentials/gcloud_credentials.json \
    --iam-account=$SERVICE_ACCOUNT_NAME@$PROJECT_ID.iam.gserviceaccount.com

# Initialize Firestore in Native Mode
gcloud firestore databases create \
    --region=$REGION \
    --type=firestore-native

echo "Google Cloud Project Setup Complete!"
echo "Project ID: $PROJECT_ID"
echo "Service Account: $SERVICE_ACCOUNT_NAME@$PROJECT_ID.iam.gserviceaccount.com"
