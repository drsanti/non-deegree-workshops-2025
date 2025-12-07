@echo off
REM Helper script to run train_lstm.py with the virtual environment

cd /d "%~dp0"
..\..\venv\Scripts\python.exe ..\train_lstm.py
