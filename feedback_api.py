import os
import uuid
import logging
from datetime import datetime
from functools import wraps

import firebase_admin
from firebase_admin import credentials, firestore
from flask import Flask, request, jsonify
from flask_cors import CORS
from dotenv import load_dotenv

# Load environment variables
load_dotenv('secrets.env')

# Configure Logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger('SmartTabFeedbackAPI')

# Initialize Firebase Admin SDK
try:
    cred = credentials.Certificate(os.getenv('GOOGLE_CLOUD_CREDENTIALS_PATH'))
    firebase_admin.initialize_app(cred, {
        'projectId': os.getenv('GOOGLE_CLOUD_PROJECT_ID')
    })
    firestore_client = firestore.client()
except Exception as e:
    logger.error(f"Firebase initialization error: {e}")
    raise

# Configuration
class Config:
    SECRET_KEY = os.getenv('SMARTTAB_API_SECRET', str(uuid.uuid4()))
    API_KEY = os.getenv('SMARTTAB_API_KEY', str(uuid.uuid4()))
    FEEDBACK_COLLECTION = os.getenv('FIRESTORE_COLLECTION_PREFIX', 'smarttab_') + 'feedback'
    USAGE_STATS_COLLECTION = os.getenv('FIRESTORE_COLLECTION_PREFIX', 'smarttab_') + 'usage_stats'
    CORS_ORIGINS = os.getenv('CORS_ORIGINS', '*').split(',')

# Authentication Decorator
def require_api_key(f):
    @wraps(f)
    def decorated_function(*args, **kwargs):
        api_key = request.headers.get('X-API-Key')
        if not api_key or api_key != Config.API_KEY:
            return jsonify({'error': 'Unauthorized'}), 401
        return f(*args, **kwargs)
    return decorated_function

# Initialize Flask App
app = Flask(__name__)
CORS(app, resources={
    r"/api/v1/*": {"origins": Config.CORS_ORIGINS}
})

# Utility Functions
def validate_payload(payload):
    """Validate incoming feedback payload."""
    required_fields = ['extensionId', 'feedback', 'timestamp']
    return all(field in payload for field in required_fields)

def sanitize_feedback(feedback):
    """Basic sanitization of feedback text."""
    # Remove potentially harmful HTML/script tags
    return feedback.replace('<', '&lt;').replace('>', '&gt;')

# API Endpoints
@app.route('/api/v1/feedback', methods=['POST'])
@require_api_key
def submit_feedback():
    try:
        payload = request.json
        
        # Validate payload
        if not validate_payload(payload):
            logger.warning(f"Invalid payload received: {payload}")
            return jsonify({
                'status': 'error', 
                'message': 'Invalid payload'
            }), 400
        
        # Sanitize feedback
        payload['feedback'] = sanitize_feedback(payload['feedback'])
        
        # Store in Firestore
        doc_ref = firestore_client.collection(Config.FEEDBACK_COLLECTION).document()
        doc_ref.set({
            'extension_id': payload['extensionId'],
            'feedback': payload['feedback'],
            'timestamp': firestore.SERVER_TIMESTAMP,
            'processed': False,
            'sentiment': None
        })
        
        logger.info(f"Feedback received from {payload['extensionId']}")
        
        return jsonify({
            'status': 'success', 
            'message': 'Feedback received',
            'id': doc_ref.id
        }), 201
    
    except Exception as e:
        logger.error(f"Feedback submission error: {str(e)}")
        return jsonify({
            'status': 'error', 
            'message': 'Internal server error'
        }), 500

@app.route('/api/v1/usage-stats', methods=['POST'])
@require_api_key
def submit_usage_stats():
    try:
        payload = request.json
        
        # Validate basic payload structure
        if not payload or 'extensionId' not in payload:
            logger.warning(f"Invalid usage stats payload: {payload}")
            return jsonify({
                'status': 'error', 
                'message': 'Invalid payload'
            }), 400
        
        # Store usage stats in Firestore
        doc_ref = firestore_client.collection(Config.USAGE_STATS_COLLECTION).document()
        doc_ref.set({
            'extension_id': payload['extensionId'],
            'stats': payload.get('stats', {}),
            'timestamp': firestore.SERVER_TIMESTAMP
        })
        
        logger.info(f"Usage stats received from {payload['extensionId']}")
        
        return jsonify({
            'status': 'success', 
            'message': 'Usage stats received',
            'id': doc_ref.id
        }), 201
    
    except Exception as e:
        logger.error(f"Usage stats submission error: {str(e)}")
        return jsonify({
            'status': 'error', 
            'message': 'Internal server error'
        }), 500

# Health Check Endpoint
@app.route('/health', methods=['GET'])
def health_check():
    return jsonify({
        'status': 'healthy',
        'timestamp': datetime.utcnow().isoformat()
    }), 200

if __name__ == '__main__':
    app.run(
        debug=os.getenv('DEBUG', 'false') == 'true', 
        host='0.0.0.0', 
        port=int(os.getenv('PORT', 5000))
    )
