@echo off
REM Get current time in HH:MM:SS format
for /f "tokens=1-3 delims=:,." %%a in ("%time%") do set currentTime=%%a:%%b:%%c

REM Navigate to the module directory
echo %currentTime% - [BOT] Starting...
cd module/

REM Update npm to the latest version
echo %currentTime% - [BOT] Updating npm...
call npm install -g npm

REM Install specific versions of packages and dependencies
echo %currentTime% - [BOT] Installing packages...
call npm install chalk@2.4.1
call npm install steam-user
call npm install steamcommunity
call npm install fs
call npm install readline
call npm install readline-sync
call npm install axios
call npm install crypto
call npm install express body-parser
call npm install natural
call npm install string-similarity
call npm install moment
call npm install node-notifier

REM Update installed packages to the latest compatible versions
echo %currentTime% - [BOT] Updating packages...
call npm update

REM Start the steam_app.js script
echo %currentTime% - [BOT] Iniciating SHB...
REM Clear the console
cls
node steam_app.js

REM Pause the script to review output
pause