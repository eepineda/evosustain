@echo off
cd /d "%~dp0"
echo === EVOFORD JOURNAL ===
python .\scripts\build_site.py
if errorlevel 1 (echo BUILD FAILED & pause & exit /b 1)
echo BUILD COMPLETE
echo Open dist\index.html to preview.
pause
