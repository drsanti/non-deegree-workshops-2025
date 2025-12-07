@echo off
REM Helper script to run verify_models.py with the virtual environment

cd /d "%~dp0"
..\..\venv\Scripts\python.exe ..\verify_models.py
