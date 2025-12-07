#!/bin/bash
# Helper script to run verify_models.py with the virtual environment

cd "$(dirname "$0")"
../../venv/Scripts/python.exe ../verify_models.py
