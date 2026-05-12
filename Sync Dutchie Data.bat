@echo off
cd /d "%~dp0"
echo Syncing Dutchie data into the local dashboard snapshot...
echo Start the dashboard first if this fails.
echo.
npm.cmd run sync:dutchie
echo.
pause
