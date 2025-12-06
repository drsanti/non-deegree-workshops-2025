#!/bin/bash
# Helper script to run test_lstm.py with the virtual environment

cd "$(dirname "$0")"
../venv/Scripts/python.exe test_lstm.py

