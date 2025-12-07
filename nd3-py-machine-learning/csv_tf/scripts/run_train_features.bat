@echo off
REM Helper script to run train_features.py with the virtual environment

cd /d "%~dp0"
..\..\venv\Scripts\python.exe ..\train_features.py
