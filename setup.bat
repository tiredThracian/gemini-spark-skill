@echo off
setlocal enabledelayedexpansion

echo ==========================================================
echo       Thracian Skills Setup Tool
echo ==========================================================
echo.

where node >nul 2>nul
if %errorlevel% neq 0 (
    echo [ERROR] Node.js is not installed!
    echo Please install Node.js from https://nodejs.org/ first.
    echo.
    exit /b 1
)

set "SKILLS_SOURCE_DIR=%~dp0skills"
set "GLOBAL_SKILLS_DIR=%USERPROFILE%\.gemini\config\skills"

if not exist "%GLOBAL_SKILLS_DIR%" mkdir "%GLOBAL_SKILLS_DIR%"

set "TARGET_SKILL=%~1"

if /i "%TARGET_SKILL%"=="list" goto :ListSkills
if "%TARGET_SKILL%"=="" goto :InstallAll
goto :InstallSingle

:ListSkills
echo Available Skills in Thracian Skills Repository:
echo.
for /d %%D in ("%SKILLS_SOURCE_DIR%\*") do (
    echo   - %%~nxD
)
echo.
echo Usage:
echo   setup.bat               : Installs ALL skills
echo   setup.bat [skill_name]  : Installs a specific skill (e.g. setup.bat gemini-spark)
echo   setup.bat list          : Lists available skills
echo.
exit /b 0

:InstallAll
echo [INFO] Installing ALL skills...
for /d %%D in ("%SKILLS_SOURCE_DIR%\*") do (
    call :InstallSkill "%%~nxD"
)
goto :Finish

:InstallSingle
if not exist "%SKILLS_SOURCE_DIR%\%TARGET_SKILL%" (
    echo [ERROR] Skill '%TARGET_SKILL%' not found!
    echo Run 'setup.bat list' to view available skills.
    exit /b 1
)
echo [INFO] Installing single skill: '%TARGET_SKILL%'...
call :InstallSkill "%TARGET_SKILL%"
goto :Finish

:InstallSkill
set "SKILL_NAME=%~1"
set "SRC_PATH=%SKILLS_SOURCE_DIR%\%SKILL_NAME%"
set "DEST_PATH=%GLOBAL_SKILLS_DIR%\%SKILL_NAME%"

echo.
echo ----------------------------------------------------------
echo Installing: %SKILL_NAME%
echo Destination: %DEST_PATH%
echo ----------------------------------------------------------

if not exist "%DEST_PATH%" mkdir "%DEST_PATH%"

echo \node_modules\ > "%temp%\exclude_skills.txt"
echo \chrome-profile\ >> "%temp%\exclude_skills.txt"
echo \.git\ >> "%temp%\exclude_skills.txt"
echo last-chat-url.txt >> "%temp%\exclude_skills.txt"
echo last-chat-list.json >> "%temp%\exclude_skills.txt"

xcopy /E /I /Y /EXCLUDE:%temp%\exclude_skills.txt "%SRC_PATH%\*" "%DEST_PATH%" >nul
del "%temp%\exclude_skills.txt" 2>nul

if exist "%DEST_PATH%\scripts\package.json" (
    echo [%SKILL_NAME%] Installing npm dependencies...
    cd /d "%DEST_PATH%\scripts"
    call npm install --no-audit --no-fund
    if exist "%DEST_PATH%\scripts\index.js" (
        echo [%SKILL_NAME%] Verifying Playwright Chromium browser...
        call npx playwright install chromium
    )
)

echo [OK] %SKILL_NAME% successfully installed!
exit /b 0

:Finish
echo.
echo ==========================================================
echo [SUCCESS] Thracian Skills installation completed!
echo ==========================================================
echo.
exit /b 0
