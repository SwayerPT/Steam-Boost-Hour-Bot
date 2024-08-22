@echo off
REM Update npm to the latest version
echo Updating npm...
call npm install -g npm

REM Install specific versions of packages and dependencies
echo Installing packages...
call npm install chalk@2.4.1
call npm install steam-user
call npm install steamcommunity
call npm install fs
call npm install readline-sync
call npm install axios

REM Update installed packages to the latest compatible versions
echo Updating packages...
call npm update

REM Pause the script to review output
pause
