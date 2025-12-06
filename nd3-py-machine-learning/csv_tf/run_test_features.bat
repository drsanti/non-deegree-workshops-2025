@echo off
REM Helper script to run test_features.py with the virtual environment

cd /d "%~dp0"
..\venv\Scripts\python.exe test_features.py

