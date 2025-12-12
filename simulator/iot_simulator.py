"""
IoT Device Simulator
Simulates multiple IoT devices publishing sensor data via MQTT and storing in InfluxDB
"""

import time
import random
import json
import os
import sys
from datetime import datetime
from dotenv import load_dotenv
import paho.mqtt.client as mqtt
from influxdb_client import InfluxDBClient, Point
from influxdb_client.client.write_api import SYNCHRONOUS

# Add devices directory to path
sys.path.append(os.path.join(os.path.dirname(__file__), 'devices'))

from devices.temperature_sensor import TemperatureSensor
from devices.humidity_sensor import HumiditySensor
from devices.smart_switch import SmartSwitch

# Load environment variables
load_dotenv()

# Configuration
MQTT_BROKER = os.getenv('MQTT_BROKER', 'localhost')
MQTT_PORT = int(os.getenv('MQTT_PORT', 1883))
INFLUXDB_URL = os.getenv('INFLUXDB_URL', 'http://localhost:8086')
INFLUXDB_TOKEN = os.getenv('INFLUXDB_TOKEN', 'my-super-secret-auth-token')
INFLUXDB_ORG = os.getenv('INFLUXDB_ORG', 'iot-org')
INFLUXDB_BUCKET = os.getenv('INFLUXDB_BUCKET', 'iot-data')

class IoTSimulator:
    def __init__(self):
        self.devices = []
        self.mqtt_client = None
        self.influx_client = None
        self.running = False
        
    def setup_mqtt(self):
        """Setup MQTT client with retry logic"""
        self.mqtt_client = mqtt.Client()
        self.mqtt_client.on_connect = self.on_mqtt_connect
        self.mqtt_client.on_publish = self.on_mqtt_publish
        
        # Retry connection with exponential backoff
        max_retries = 10
        retry_delay = 2
        
        for attempt in range(max_retries):
            try:
                self.mqtt_client.connect(MQTT_BROKER, MQTT_PORT, 60)
                self.mqtt_client.loop_start()
                # Wait a moment to verify connection
                time.sleep(1)
                if self.mqtt_client.is_connected():
                    print(f"Connected to MQTT broker at {MQTT_BROKER}:{MQTT_PORT}")
                    return
                else:
                    print(f"Connection attempt {attempt + 1} failed, retrying in {retry_delay}s...")
            except Exception as e:
                print(f"Connection attempt {attempt + 1} failed: {e}, retrying in {retry_delay}s...")
            
            if attempt < max_retries - 1:
                time.sleep(retry_delay)
                retry_delay = min(retry_delay * 2, 10)  # Exponential backoff, max 10s
        
        print(f"WARNING: Failed to connect to MQTT broker after {max_retries} attempts. Data will not be published to MQTT.")
    
    def setup_influxdb(self):
        """Setup InfluxDB client"""
        try:
            self.influx_client = InfluxDBClient(
                url=INFLUXDB_URL,
                token=INFLUXDB_TOKEN,
                org=INFLUXDB_ORG
            )
            self.write_api = self.influx_client.write_api(write_options=SYNCHRONOUS)
            print(f"Connected to InfluxDB at {INFLUXDB_URL}")
        except Exception as e:
            print(f"Failed to connect to InfluxDB: {e}")
    
    def on_mqtt_connect(self, client, userdata, flags, rc):
        """MQTT connection callback"""
        if rc == 0:
            print("MQTT broker connected successfully")
        else:
            print(f"Failed to connect to MQTT broker, return code {rc}")
            # Try to reconnect
            client.reconnect()
    
    def on_mqtt_publish(self, client, userdata, mid):
        """MQTT publish callback"""
        pass
    
    def add_device(self, device):
        """Add a device to the simulator"""
        self.devices.append(device)
        print(f"Added device: {device.device_id} ({device.device_type})")
    
    def publish_data(self, device, data):
        """Publish device data to MQTT and InfluxDB"""
        # Publish to MQTT
        topic = f"sensors/{device.device_type}/{device.device_id}"
        payload = json.dumps(data)
        
        if self.mqtt_client and self.mqtt_client.is_connected():
            self.mqtt_client.publish(topic, payload)
        
        # Write to InfluxDB
        if self.influx_client:
            point = Point(device.device_type) \
                .tag("device_id", device.device_id) \
                .tag("device_type", device.device_type) \
                .field("value", data.get('value', 0)) \
                .time(datetime.utcnow())
            
            # Add additional fields
            for key, value in data.items():
                if key != 'value':
                    point.field(key, value)
            
            try:
                self.write_api.write(bucket=INFLUXDB_BUCKET, org=INFLUXDB_ORG, record=point)
            except Exception as e:
                print(f"Failed to write to InfluxDB: {e}")
    
    def run(self, interval=5):
        """Run the simulator"""
        self.running = True
        print(f"\nStarting IoT Simulator with {len(self.devices)} devices...")
        print(f"Publishing interval: {interval} seconds")
        print("Press Ctrl+C to stop\n")
        
        try:
            while self.running:
                for device in self.devices:
                    data = device.read()
                    self.publish_data(device, data)
                    print(f"[{datetime.now().strftime('%Y-%m-%d %H:%M:%S')}] {device.device_id}: {data}")
                
                time.sleep(interval)
        except KeyboardInterrupt:
            print("\nStopping simulator...")
            self.stop()
    
    def stop(self):
        """Stop the simulator"""
        self.running = False
        if self.mqtt_client:
            self.mqtt_client.loop_stop()
            self.mqtt_client.disconnect()
        if self.influx_client:
            self.influx_client.close()
        print("Simulator stopped")

def main():
    """Main function"""
    simulator = IoTSimulator()
    
    # Setup connections
    simulator.setup_mqtt()
    simulator.setup_influxdb()
    
    # Add devices
    simulator.add_device(TemperatureSensor("temp-001", "living-room"))
    simulator.add_device(TemperatureSensor("temp-002", "bedroom"))
    simulator.add_device(HumiditySensor("hum-001", "living-room"))
    simulator.add_device(HumiditySensor("hum-002", "bedroom"))
    simulator.add_device(SmartSwitch("switch-001", "living-room"))
    simulator.add_device(SmartSwitch("switch-002", "bedroom"))
    
    # Run simulator
    simulator.run(interval=5)

if __name__ == '__main__':
    main()

