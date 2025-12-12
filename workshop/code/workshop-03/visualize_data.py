#!/usr/bin/env python3
"""
Workshop 03: Visualize Data
Write sample data and view in Grafana
"""

import sys
import os

# Add parent directory to path to import influxdb_write
sys.path.insert(0, os.path.dirname(__file__))

def main():
    print("=" * 60)
    print("Data Visualization Helper")
    print("=" * 60)
    print()
    
    # Write sample data
    print("Step 1: Writing sample data to InfluxDB...")
    print("Run: python influxdb_write.py first to write data")
    
    print()
    print("=" * 60)
    print("Step 2: Viewing data in Grafana")
    print("=" * 60)
    print()
    print("To view your data in Grafana:")
    print("1. Open Grafana: http://localhost:3000")
    print("2. Login: admin / admin")
    print("3. Go to 'Explore'")
    print("4. Select 'InfluxDB' datasource")
    print("5. Run this query:")
    print()
    print('   from(bucket: "iot-data")')
    print('     |> range(start: -5m)')
    print('     |> filter(fn: (r) => r["_measurement"] == "temperature")')
    print()
    print("6. Click 'Run query' to see your data!")
    print()
    print("=" * 60)

if __name__ == "__main__":
    main()

