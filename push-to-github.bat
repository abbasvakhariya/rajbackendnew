@echo off
echo Initializing Git repository...
git init

echo Adding files...
git add .

echo Creating commit...
git commit -m "Initial commit: Window Management System with costing calculator"

echo Adding remote repository...
git remote add origin https://github.com/abbasvakhariya/windowsmangement.git

echo Setting branch to main...
git branch -M main

echo Pushing to GitHub...
echo Note: You may need to enter your GitHub credentials
git push -u origin main

pause

