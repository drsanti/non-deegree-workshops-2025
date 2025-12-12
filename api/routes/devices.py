"""
Device management API endpoints
"""

from flask import Blueprint, request, jsonify
import os

bp = Blueprint('devices', __name__)

# In-memory device registry (in production, use a database)
devices_registry = {}

@bp.route('/register', methods=['POST'])
def register():
    """Register a new IoT device"""
    try:
        data = request.get_json()
        device_id = data.get('device_id')
        device_type = data.get('device_type')
        device_name = data.get('device_name', device_id)
        
        if not device_id or not device_type:
            return jsonify({'error': 'device_id and device_type are required'}), 400
        
        devices_registry[device_id] = {
            'device_id': device_id,
            'device_type': device_type,
            'device_name': device_name,
            'status': 'active',
            'registered_at': data.get('registered_at')
        }
        
        return jsonify({
            'success': True,
            'device': devices_registry[device_id]
        }), 201
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@bp.route('/list', methods=['GET'])
def list_devices():
    """List all registered devices"""
    try:
        return jsonify({
            'success': True,
            'devices': list(devices_registry.values()),
            'count': len(devices_registry)
        }), 200
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@bp.route('/<device_id>', methods=['GET'])
def get_device(device_id):
    """Get device information"""
    try:
        if device_id not in devices_registry:
            return jsonify({'error': 'Device not found'}), 404
        
        return jsonify({
            'success': True,
            'device': devices_registry[device_id]
        }), 200
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@bp.route('/<device_id>/status', methods=['PUT'])
def update_status(device_id):
    """Update device status"""
    try:
        data = request.get_json()
        status = data.get('status')
        
        if device_id not in devices_registry:
            return jsonify({'error': 'Device not found'}), 404
        
        if status not in ['active', 'inactive', 'maintenance']:
            return jsonify({'error': 'Invalid status'}), 400
        
        devices_registry[device_id]['status'] = status
        
        return jsonify({
            'success': True,
            'device': devices_registry[device_id]
        }), 200
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@bp.route('/<device_id>', methods=['DELETE'])
def delete_device(device_id):
    """Delete a device"""
    try:
        if device_id not in devices_registry:
            return jsonify({'error': 'Device not found'}), 404
        
        del devices_registry[device_id]
        
        return jsonify({
            'success': True,
            'message': f'Device {device_id} deleted'
        }), 200
    except Exception as e:
        return jsonify({'error': str(e)}), 500

