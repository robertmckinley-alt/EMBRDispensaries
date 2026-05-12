@echo off
cd /d "%~dp0"
echo Starting EMBR - Intellegence dashboard...
echo.
echo When it says Ready, open:
echo http://localhost:3100
echo.
npm.cmd run dev -- -p 3100
pause
