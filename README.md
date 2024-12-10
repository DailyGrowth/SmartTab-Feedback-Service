# SmartTab Feedback Service

## Overview
SmartTab Feedback Service is a lightweight, secure backend for collecting user feedback and usage statistics for the SmartTab Chrome Extension.

## Features
- Collect anonymous user feedback
- Track usage statistics
- Secure API endpoints
- Built with FastAPI and Supabase

## Deployment
Deployed on Render (Free Tier)
- Automatic SSL
- Serverless architecture
- GitHub integration

## Technologies
- FastAPI
- Supabase
- Python 3.9+
- Async programming

## Local Development
1. Clone the repository
2. Install dependencies: `pip install -r requirements.txt`
3. Copy `secrets_template.env` to `secrets.env`
4. Configure your Supabase credentials
5. Run the server: `uvicorn supabase_api:app --reload`

## Contributing
1. Fork the repository
2. Create a feature branch
3. Commit your changes
4. Push to the branch
5. Create a Pull Request

## License
MIT License
