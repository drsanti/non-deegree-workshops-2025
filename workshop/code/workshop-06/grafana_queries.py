#!/usr/bin/env python3
"""
Workshop 06: Grafana Queries
Examples of Flux queries for Grafana
"""

# Query examples - see workshop documentation for usage

QUERY_1 = '''
from(bucket: "iot-data")
  |> range(start: -1h)
  |> filter(fn: (r) => r["_measurement"] == "temperature")
  |> filter(fn: (r) => r["_field"] == "value")
  |> aggregateWindow(every: 5m, fn: mean, createEmpty: false)
  |> yield(name: "mean")
'''

QUERY_2 = '''
from(bucket: "iot-data")
  |> range(start: -1h)
  |> filter(fn: (r) => r["_measurement"] == "temperature")
  |> filter(fn: (r) => r["_field"] == "value")
  |> group(columns: ["device_id"])
  |> mean()
'''

QUERY_3 = '''
from(bucket: "iot-data")
  |> range(start: -24h)
  |> filter(fn: (r) => r["_measurement"] == "temperature")
  |> filter(fn: (r) => r["_field"] == "value")
  |> group(columns: ["device_id"])
  |> last()
'''

def main():
    print("Flux Query Examples:")
    print("\n1. Hourly Average:")
    print(QUERY_1)
    print("\n2. Group by Device:")
    print(QUERY_2)
    print("\n3. Latest Values:")
    print(QUERY_3)
    print("\nUse these queries in Grafana Explore or via API")

if __name__ == "__main__":
    main()

