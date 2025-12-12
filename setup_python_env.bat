@echo off
REM Python Environment Setup Script for Windows
REM This script creates a virtual environment and installs dependencies

echo ==========================================
echo IoT Home Automation - Python Environment Setup
echo ==========================================
echo.

REM Check Python version
echo Checking Python version...
python --version >nul 2>&1
if errorlevel 1 (
    echo ERROR: Python is not installed or not in PATH
    echo Please install Python 3.8 or higher from https://www.python.org/
    pause
    exit /b 1
)

for /f "tokens=2" %%i in ('python --version 2^>^&1') do set PYTHON_VERSION=%%i
echo Found Python: %PYTHON_VERSION%

REM Check pip
echo.
echo Checking pip...
python -m pip --version >nul 2>&1
if errorlevel 1 (
    echo ERROR: pip is not available
    echo Please install pip: python -m ensurepip --upgrade
    pause
    exit /b 1
)

REM Create virtual environment
echo.
echo Creating virtual environment...
if exist venv (
    echo Virtual environment already exists. Removing old one...
    rmdir /s /q venv
)

python -m venv venv
if errorlevel 1 (
    echo ERROR: Failed to create virtual environment
    pause
    exit /b 1
)
echo Virtual environment created successfully!

REM Activate virtual environment
echo.
echo Activating virtual environment...
call venv\Scripts\activate.bat

REM Upgrade pip
echo.
echo Upgrading pip...
python -m pip install --upgrade pip

REM Install dependencies
echo.
echo Installing Python dependencies...
pip install -r requirements.txt
if errorlevel 1 (
    echo ERROR: Failed to install dependencies
    pause
    exit /b 1
)

REM Create .env file if it doesn't exist
echo.
if not exist .env (
    if exist .env.example (
        echo Creating .env file from .env.example...
        copy .env.example .env >nul
        echo .env file created. Please update it with your configuration.
    ) else (
        echo WARNING: .env.example not found. Please create .env file manually.
    )
) else (
    echo .env file already exists.
)

echo.
echo ==========================================
echo Setup completed successfully!
echo ==========================================
echo.
echo To activate the virtual environment, run:
echo   venv\Scripts\activate
echo.
echo To deactivate, run:
echo   deactivate
echo.
pause

