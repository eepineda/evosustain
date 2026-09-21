@echo off
cd /d "%~dp0"
python ".\scripts\build_site.py"
if errorlevel 1 (echo Build failed.&pause&exit /b 1)
echo Build completed successfully.&pause
