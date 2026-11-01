@echo off
echo Starting TaskFlow Frontend Client on http://localhost:5173...
cd /d "%~dp0frontend"
call npm.cmd run dev
pause
