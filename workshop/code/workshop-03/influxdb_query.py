#!/usr/bin/env python3
"""
Workshop 03: InfluxDB Query
Query data from InfluxDB using Flux
"""

from influxdb_client import InfluxDBClient
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
    query_api = client.query_api()
    
    # Query 1: Get all temperature data from last hour
    print("Query 1: Temperature data from last hour")
    print("-" * 60)
    query1 = f'''
    from(bucket: "{BUCKET}")
      |> range(start: -1h)
      |> filter(fn: (r) => r["_measurement"] == "temperature")
      |> filter(fn: (r) => r["_field"] == "value")
    '''
    
    try:
        result = query_api.query(org=ORG, query=query1)
        count = 0
        for table in result:
            for record in table.records:
                count += 1
                print(f"Time: {record.get_time()}, Value: {record.get_value()}, Device: {record.values.get('device_id', 'N/A')}")
        
        if count == 0:
            print("No data found. Make sure data has been written first.")
        else:
            print(f"\nTotal records: {count}")
    except Exception as e:
        print(f"Error: {e}")
    
    print()
    
    # Query 2: Get average temperature by device
    print("Query 2: Average temperature by device")
    print("-" * 60)
    query2 = f'''
    from(bucket: "{BUCKET}")
      |> range(start: -1h)
      |> filter(fn: (r) => r["_measurement"] == "temperature")
      |> filter(fn: (r) => r["_field"] == "value")
      |> group(columns: ["device_id"])
      |> mean()
    '''
    
    try:
        result = query_api.query(org=ORG, query=query2)
        for table in result:
            for record in table.records:
                device_id = record.values.get('device_id', 'N/A')
                avg_value = record.get_value()
                print(f"Device: {device_id}, Average: {avg_value:.2f}°C")
    except Exception as e:
        print(f"Error: {e}")
    
    print()
    
    # Query 3: Get latest value for each device
    print("Query 3: Latest temperature by device")
    print("-" * 60)
    query3 = f'''
    from(bucket: "{BUCKET}")
      |> range(start: -24h)
      |> filter(fn: (r) => r["_measurement"] == "temperature")
      |> filter(fn: (r) => r["_field"] == "value")
      |> group(columns: ["device_id"])
      |> last()
    '''
    
    try:
        result = query_api.query(org=ORG, query=query3)
        for table in result:
            for record in table.records:
                device_id = record.values.get('device_id', 'N/A')
                latest_value = record.get_value()
                time = record.get_time()
                print(f"Device: {device_id}, Latest: {latest_value}°C, Time: {time}")
    except Exception as e:
        print(f"Error: {e}")
    
    # Close client
    client.close()
    print("\n✓ Queries completed!")

if __name__ == "__main__":
    main()

