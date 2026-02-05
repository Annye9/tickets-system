@echo off
REM Script para ejecutar el backend sin necesidad de PYTHONPATH manual
REM Esto funciona porque la estructura del proyecto está correctamente organizada

echo ===================================
echo Backend de Tickets - Iniciando...
echo ===================================

REM Activar el venv
call venv\Scripts\activate.bat

REM Ejecutar con uvicorn
echo Iniciando uvicorn en puerto 8001...
python -m uvicorn main:app --reload --port 8001

pause
