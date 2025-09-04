@echo off
echo Running mypy type checking...
cd /d "%~dp0"
"C:\code zone\.venv\Scripts\python.exe" -m mypy .
echo Mypy check complete!
