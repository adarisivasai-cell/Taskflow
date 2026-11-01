@echo off
echo ====================================================
echo Pushing TaskFlow to https://github.com/adarisivasai-cell/Taskflow.git
echo ====================================================
cd /d "%~dp0"

git push -u origin main

echo.
if %ERRORLEVEL% equ 0 (
    echo [SUCCESS] Successfully pushed all TaskFlow files to GitHub!
) else (
    echo [FAILED] Push encountered an issue. Check your credentials or internet connection.
)
echo.
pause
