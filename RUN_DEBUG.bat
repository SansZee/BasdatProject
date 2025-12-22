@echo off
cd /d "D:\Others\Source Code\ProjekSMBD\backend"
echo Building...
go build -o api.exe ./cmd/api
echo.
echo Running with debug output...
echo.
go run ./cmd/api/main.go
pause
