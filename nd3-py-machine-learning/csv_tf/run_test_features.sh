#!/bin/bash
# Helper script to run test_features.py with the virtual environment

cd "$(dirname "$0")"
../venv/Scripts/python.exe test_features.py

