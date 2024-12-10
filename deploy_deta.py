import os
import sys
from deta import Deta
from dotenv import load_dotenv

# Load environment variables
load_dotenv('secrets.env')

def deploy_to_deta():
    """Deploy the FastAPI app to Deta"""
    try:
        # Initialize Deta
        deta = Deta(os.getenv('DETA_PROJECT_KEY'))
        
        # Create a new Micro
        micro = deta.Micro("smarttab-feedback")
        
        # Deploy the app
        os.system("deta deploy")
        
        print("Deployment successful!")
        print("Your API is now live at:", micro.get_url())
        
        # Update the feedback.js with the new URL
        update_api_endpoint(micro.get_url())
        
    except Exception as e:
        print("Deployment failed:", str(e))
        sys.exit(1)

def update_api_endpoint(url):
    """Update the API endpoint in feedback.js"""
    try:
        with open('feedback.js', 'r') as file:
            content = file.read()
        
        # Update the API endpoint
        content = content.replace(
            "const API_ENDPOINT = 'https://your-app.deta.dev'",
            f"const API_ENDPOINT = '{url}'"
        )
        
        with open('feedback.js', 'w') as file:
            file.write(content)
            
        print("API endpoint updated in feedback.js")
        
    except Exception as e:
        print("Failed to update API endpoint:", str(e))

if __name__ == "__main__":
    deploy_to_deta()
