"""
MQTT API endpoints for publishing and subscribing to MQTT topics
"""

from flask import Blueprint, request, jsonify
import paho.mqtt.client as mqtt
import os
import json
from threading import Lock

bp = Blueprint('mqtt', __name__)

# MQTT Configuration
MQTT_BROKER = os.getenv('MQTT_BROKER', 'emqx')
MQTT_PORT = int(os.getenv('MQTT_PORT', 1883))

# MQTT Client
mqtt_client = None
mqtt_lock = Lock()

def get_mqtt_client():
    """Get or create MQTT client"""
    global mqtt_client
    with mqtt_lock:
        if mqtt_client is None:
            mqtt_client = mqtt.Client()
            mqtt_client.connect(MQTT_BROKER, MQTT_PORT, 60)
            mqtt_client.loop_start()
        return mqtt_client

@bp.route('/publish', methods=['POST'])
def publish():
    """Publish a message to an MQTT topic"""
    try:
        data = request.get_json()
        topic = data.get('topic')
        message = data.get('message')
        qos = data.get('qos', 0)
        
        if not topic or message is None:
            return jsonify({'error': 'Topic and message are required'}), 400
        
        client = get_mqtt_client()
        result = client.publish(topic, json.dumps(message) if isinstance(message, dict) else str(message), qos)
        
        if result.rc == mqtt.MQTT_ERR_SUCCESS:
            return jsonify({
                'success': True,
                'topic': topic,
                'message': message,
                'message_id': result.mid
            }), 200
        else:
            return jsonify({'error': 'Failed to publish message'}), 500
            
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@bp.route('/subscribe', methods=['POST'])
def subscribe():
    """Subscribe to an MQTT topic"""
    try:
        data = request.get_json()
        topic = data.get('topic')
        qos = data.get('qos', 0)
        
        if not topic:
            return jsonify({'error': 'Topic is required'}), 400
        
        client = get_mqtt_client()
        result = client.subscribe(topic, qos)
        
        if result[0] == mqtt.MQTT_ERR_SUCCESS:
            return jsonify({
                'success': True,
                'topic': topic,
                'qos': qos,
                'message_id': result[1]
            }), 200
        else:
            return jsonify({'error': 'Failed to subscribe to topic'}), 500
            
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@bp.route('/test', methods=['GET'])
def test():
    """Test MQTT connection"""
    try:
        client = get_mqtt_client()
        if client.is_connected():
            return jsonify({
                'success': True,
                'broker': f'{MQTT_BROKER}:{MQTT_PORT}',
                'status': 'connected'
            }), 200
        else:
            return jsonify({
                'success': False,
                'status': 'not connected'
            }), 500
    except Exception as e:
        return jsonify({'error': str(e)}), 500

