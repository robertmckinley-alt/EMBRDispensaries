@echo off
cd /d "%~dp0"
echo Testing Dutchie API keys...
echo This does not print your keys.
echo.
npm.cmd run test:dutchie
echo.
pause
