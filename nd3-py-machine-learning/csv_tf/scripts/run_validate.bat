@echo off
REM Helper script to run validate.py with the virtual environment

cd /d "%~dp0"
..\..\venv\Scripts\python.exe ..\validate.py
