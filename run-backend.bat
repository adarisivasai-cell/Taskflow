@echo off
echo Starting TaskFlow Backend Server on http://localhost:5000...
cd /d "%~dp0backend"
call npm.cmd start
pause
