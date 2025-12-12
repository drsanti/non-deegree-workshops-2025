"""
InfluxDB API endpoints for writing and querying time-series data
"""

from flask import Blueprint, request, jsonify
from influxdb_client import InfluxDBClient, Point
from influxdb_client.client.write_api import SYNCHRONOUS
import os

bp = Blueprint('database', __name__)

# InfluxDB Configuration
INFLUXDB_URL = os.getenv('INFLUXDB_URL', 'http://influxdb:8086')
INFLUXDB_TOKEN = os.getenv('INFLUXDB_TOKEN', 'my-super-secret-auth-token')
INFLUXDB_ORG = os.getenv('INFLUXDB_ORG', 'iot-org')
INFLUXDB_BUCKET = os.getenv('INFLUXDB_BUCKET', 'iot-data')

# InfluxDB Client
influx_client = None

def get_influx_client():
    """Get or create InfluxDB client"""
    global influx_client
    if influx_client is None:
        influx_client = InfluxDBClient(
            url=INFLUXDB_URL,
            token=INFLUXDB_TOKEN,
            org=INFLUXDB_ORG
        )
    return influx_client

@bp.route('/write', methods=['POST'])
def write():
    """Write data to InfluxDB"""
    try:
        data = request.get_json()
        measurement = data.get('measurement')
        fields = data.get('fields', {})
        tags = data.get('tags', {})
        timestamp = data.get('timestamp')
        
        if not measurement or not fields:
            return jsonify({'error': 'Measurement and fields are required'}), 400
        
        client = get_influx_client()
        write_api = client.write_api(write_options=SYNCHRONOUS)
        
        point = Point(measurement)
        
        # Add tags
        for key, value in tags.items():
            point.tag(key, value)
        
        # Add fields
        for key, value in fields.items():
            point.field(key, value)
        
        # Add timestamp if provided
        if timestamp:
            point.time(timestamp)
        
        write_api.write(bucket=INFLUXDB_BUCKET, org=INFLUXDB_ORG, record=point)
        
        return jsonify({
            'success': True,
            'measurement': measurement,
            'fields': fields,
            'tags': tags
        }), 200
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@bp.route('/query', methods=['POST'])
def query():
    """Query data from InfluxDB using Flux"""
    try:
        data = request.get_json()
        flux_query = data.get('query')
        
        if not flux_query:
            return jsonify({'error': 'Flux query is required'}), 400
        
        client = get_influx_client()
        query_api = client.query_api()
        
        result = query_api.query(org=INFLUXDB_ORG, query=flux_query)
        
        # Format results
        results = []
        for table in result:
            for record in table.records:
                results.append({
                    'time': record.get_time().isoformat(),
                    'measurement': record.get_measurement(),
                    'field': record.get_field(),
                    'value': record.get_value(),
                    'tags': record.values
                })
        
        return jsonify({
            'success': True,
            'results': results,
            'count': len(results)
        }), 200
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@bp.route('/test', methods=['GET'])
def test():
    """Test InfluxDB connection"""
    try:
        client = get_influx_client()
        buckets_api = client.buckets_api()
        buckets = buckets_api.find_buckets()
        
        return jsonify({
            'success': True,
            'url': INFLUXDB_URL,
            'org': INFLUXDB_ORG,
            'bucket': INFLUXDB_BUCKET,
            'buckets': [b.name for b in buckets]
        }), 200
    except Exception as e:
        return jsonify({'error': str(e)}), 500

