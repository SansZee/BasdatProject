@echo off
cd /d "%~dp0"
echo Current directory: %cd%
echo.
echo Starting backend with fresh build...
echo.
del api.exe 2>nul
go build -o api.exe ./cmd/api
if %errorlevel% neq 0 (
    echo Build failed!
    pause
    exit /b 1
)
echo.
echo Running api.exe...
echo.
./api.exe
pause
