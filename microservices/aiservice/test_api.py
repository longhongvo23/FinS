#!/usr/bin/env python3
import http.client
import json
import time

def test_health():
    try:
        conn = http.client.HTTPConnection('localhost', 8086)
        conn.request('GET', '/health')
        r = conn.getresponse()
        data = r.read().decode()
        print(f"Status: {r.status}")
        print(f"Response: {data}")
        return r.status == 200
    except Exception as e:
        print(f"Error: {e}")
        return False

def test_forecast():
    try:
        conn = http.client.HTTPConnection('localhost', 8086)
        conn.request('GET', '/api/forecast/AAPL?forecast_days=30&history_days=90')
        r = conn.getresponse()
        data = r.read().decode()
        print(f"Status: {r.status}")
        print(f"Response (first 500 chars): {data[:500]}")
        return r.status == 200
    except Exception as e:
        print(f"Error: {e}")
        return False

if __name__ == "__main__":
    print("Testing Health Endpoint...")
    if test_health():
        print("\\n✅ Health check passed!")
        print("\\nTesting Forecast Endpoint...")
        time.sleep(2)
        if test_forecast():
            print("\\n✅ Forecast test passed!")
        else:
            print("\\n❌ Forecast test failed!")
    else:
        print("\\n❌ Health check failed!")
