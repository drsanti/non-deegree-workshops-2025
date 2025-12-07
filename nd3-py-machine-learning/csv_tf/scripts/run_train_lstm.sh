#!/bin/bash
# Helper script to run train_lstm.py with the virtual environment

cd "$(dirname "$0")"
../../venv/Scripts/python.exe ../train_lstm.py
