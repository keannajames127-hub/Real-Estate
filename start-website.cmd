@echo off
setlocal
title Danish Home Properties - local website

rem ---------------------------------------------------------------------------
rem  Double-click this file to start the Danish Home Properties website on this
rem  PC. It needs nothing from Trae - just this file and the project folder.
rem
rem  Node.js lives inside the Trae tools folder and is not on the system PATH,
rem  so it is added for this window only. Nothing on your PC is modified.
rem ---------------------------------------------------------------------------

set "NODE_DIR=C:\Users\DELL\.trae\local-tools\node"
set "PATH=%NODE_DIR%;%PATH%"
set "SITE=http://localhost:3000"

rem Always run from the folder this script sits in.
cd /d "%~dp0"

rem Do not let two dev servers write to the same .next directory.
powershell -NoProfile -Command "$root = (Get-Location).Path; $running = Get-CimInstance Win32_Process | Where-Object { $_.Name -eq 'node.exe' -and $_.CommandLine -and $_.CommandLine.Contains($root) }; if ($running) { exit 1 }"
if errorlevel 1 (
  echo   ERROR: This website is already running.
  echo   Close its existing black window, then run this file again.
  echo.
  pause
  exit /b 1
)

rem .next contains generated build files and can be safely recreated.
if exist ".next" rmdir /s /q ".next"

echo.
echo   ==================================================
echo     Danish Home Properties - starting the website
echo   ==================================================
echo.

if not exist "%NODE_DIR%\node.exe" (
  echo   ERROR: Node.js was not found at
  echo          %NODE_DIR%
  echo.
  echo   That folder may have been removed or renamed.
  echo   Open the project in Trae and run "npm install" there instead.
  echo.
  pause
  exit /b 1
)

if not exist "node_modules" (
  echo   First run: installing dependencies. This can take a few minutes...
  echo.
  call npm install
  if errorlevel 1 goto failed
  echo.
)

echo   Website:      %SITE%
echo   Admin panel:  %SITE%/admin
echo.
echo   Keep THIS WINDOW OPEN while you use the website.
echo   To stop the website: close this window, or press Ctrl+C.
echo.
echo   Starting up - your browser will open by itself in a few seconds...
echo.

rem Open the browser only after the site returns HTTP 200.
start "" /b powershell -NoProfile -WindowStyle Hidden -Command ^
  "for ($i = 0; $i -lt 90; $i++) { try { $r = Invoke-WebRequest -Uri '%SITE%' -UseBasicParsing -TimeoutSec 2; if ($r.StatusCode -eq 200) { Start-Process '%SITE%'; exit 0 } } catch {}; Start-Sleep -Seconds 1 }; Write-Host 'Website did not return HTTP 200; check the server window.'"

call npm run dev -- --port 3000

echo.
echo   The website has stopped.
pause
exit /b 0

:failed
echo.
echo   Something went wrong. Scroll up to read the message above.
echo.
pause
exit /b 1
