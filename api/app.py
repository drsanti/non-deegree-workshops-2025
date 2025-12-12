"""
Flask API for IoT Home Automation Learning Platform
Provides REST endpoints for MQTT, InfluxDB, and device management
"""

from flask import Flask
from flask_cors import CORS
import os
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

app = Flask(__name__)
CORS(app)  # Enable CORS for all routes

# Import routes
from routes import mqtt, database, devices

# Register blueprints
app.register_blueprint(mqtt.bp, url_prefix='/mqtt')
app.register_blueprint(database.bp, url_prefix='/database')
app.register_blueprint(devices.bp, url_prefix='/devices')

@app.route('/')
def index():
    """API root endpoint"""
    return {
        'message': 'IoT Home Automation Learning Platform API',
        'version': '1.0.0',
        'endpoints': {
            'mqtt': '/mqtt',
            'database': '/database',
            'devices': '/devices',
            'health': '/health'
        }
    }

@app.route('/health')
def health():
    """Health check endpoint"""
    return {'status': 'healthy', 'service': 'flask-api'}

if __name__ == '__main__':
    port = int(os.environ.get('PORT', 5000))
    app.run(host='0.0.0.0', port=port, debug=True)

