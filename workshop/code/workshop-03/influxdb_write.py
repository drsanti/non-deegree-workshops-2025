#!/usr/bin/env python3
"""
Workshop 03: InfluxDB Write
Write data to InfluxDB time-series database
"""

from influxdb_client import InfluxDBClient, Point
from influxdb_client.client.write_api import SYNCHRONOUS
from datetime import datetime
import os
from dotenv import load_dotenv

load_dotenv()

# InfluxDB Configuration
URL = os.getenv("INFLUXDB_URL", "http://localhost:8086")
TOKEN = os.getenv("INFLUXDB_TOKEN", "my-super-secret-auth-token")
ORG = os.getenv("INFLUXDB_ORG", "iot-org")
BUCKET = os.getenv("INFLUXDB_BUCKET", "iot-data")

def main():
    print("Connecting to InfluxDB...")
    print(f"URL: {URL}")
    print(f"Org: {ORG}")
    print(f"Bucket: {BUCKET}")
    print()
    
    # Create client
    client = InfluxDBClient(url=URL, token=TOKEN, org=ORG)
    write_api = client.write_api(write_options=SYNCHRONOUS)
    
    # Example 1: Write a single data point
    print("Example 1: Writing a single data point...")
    point = Point("temperature") \
        .tag("device_id", "temp-001") \
        .tag("location", "living-room") \
        .field("value", 25.5) \
        .field("unit", "celsius") \
        .time(datetime.utcnow())
    
    write_api.write(bucket=BUCKET, org=ORG, record=point)
    print(f"✓ Written: {point}")
    print()
    
    # Example 2: Write multiple points
    print("Example 2: Writing multiple data points...")
    points = []
    for i in range(10):
        point = Point("temperature") \
            .tag("device_id", f"temp-{i:03d}") \
            .tag("location", f"room-{i % 3 + 1}") \
            .field("value", 20 + i * 0.5) \
            .field("unit", "celsius") \
            .time(datetime.utcnow())
        points.append(point)
    
    write_api.write(bucket=BUCKET, org=ORG, record=points)
    print(f"✓ Written {len(points)} data points")
    print()
    
    # Example 3: Write different measurement types
    print("Example 3: Writing different measurement types...")
    
    # Temperature
    temp_point = Point("temperature") \
        .tag("device_id", "temp-001") \
        .field("value", 23.5) \
        .time(datetime.utcnow())
    
    # Humidity
    hum_point = Point("humidity") \
        .tag("device_id", "hum-001") \
        .field("value", 65.0) \
        .field("unit", "percent") \
        .time(datetime.utcnow())
    
    write_api.write(bucket=BUCKET, org=ORG, record=[temp_point, hum_point])
    print("✓ Written temperature and humidity data")
    
    # Close client
    client.close()
    print("\n✓ All data written successfully!")

if __name__ == "__main__":
    main()

