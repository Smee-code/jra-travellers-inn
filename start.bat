@echo off
setlocal EnableDelayedExpansion

set "ROOT=d:\USB Drive\JRA Trav"
set "VENV=%ROOT%\.venv\Scripts\python.exe"
set "BACKEND=%ROOT%\backend"
set "FRONTEND=%ROOT%\frontend"
set "TMPDIR=%ROOT%\.tmp"

:: Redirect TEMP to D drive — C drive may be low on space
set "TEMP=%TMPDIR%"
set "TMP=%TMPDIR%"
if not exist "%TMPDIR%" mkdir "%TMPDIR%"

cls
echo.
echo  ==========================================
echo    Traveller's Inn  ^|  Dev Server Launcher
echo  ==========================================
echo.

:: ── Pre-flight checks ─────────────────────────────────────────────────────
if not exist "%VENV%" (
    echo  [ERROR] Virtual environment not found.
    echo  Run: python -m venv "%ROOT%\.venv"
    echo  Then: pip install -r "%ROOT%\requirements.txt"
    echo.
    pause & exit /b 1
)

if not exist "%FRONTEND%\node_modules" (
    echo  [ERROR] node_modules missing.
    echo  Run: cd "%FRONTEND%" ^&^& npm install
    echo.
    pause & exit /b 1
)

:: ── Launch backend ────────────────────────────────────────────────────────
echo  [1/2] Starting Django backend...
start "TI Backend" /D "%BACKEND%" cmd /k ""%VENV%" manage.py runserver"

:: Give Django a moment to bind the port before Vite starts
timeout /t 3 /nobreak >nul

:: ── Launch frontend ───────────────────────────────────────────────────────
echo  [2/2] Starting Vite frontend...
start "TI Frontend" /D "%FRONTEND%" cmd /k npm run dev

echo.
echo  ----------------------------------------
echo   Backend   http://localhost:8000
echo   Frontend  http://localhost:5173
echo   Admin UI  http://localhost:8000/admin/
echo  ----------------------------------------
echo.
echo  Two windows have opened. Press any key to
echo  close this launcher (servers keep running).
echo.
pause >nul
