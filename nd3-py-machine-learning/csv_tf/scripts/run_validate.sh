#!/bin/bash
# Helper script to run validate.py with the virtual environment

cd "$(dirname "$0")"
../../venv/Scripts/python.exe ../validate.py
