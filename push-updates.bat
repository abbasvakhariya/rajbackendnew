@echo off
echo ============================================
echo  Pushing Mobile Responsive Updates to GitHub
echo ============================================
echo.

echo Step 1: Adding all changes...
git add .
if errorlevel 1 (
    echo ERROR: Failed to add files. Make sure Git is installed.
    echo.
    echo Install Git from: https://git-scm.com/download/win
    pause
    exit /b 1
)
echo ✓ Files staged successfully
echo.

echo Step 2: Creating commit...
git commit -m "Add mobile responsive design with flexible layouts and best UX practices"
if errorlevel 1 (
    echo Note: No changes to commit or commit failed
)
echo.

echo Step 3: Pushing to GitHub...
git push origin main
if errorlevel 1 (
    echo.
    echo If this is the first push or you get an error, try:
    echo    git push -u origin main --force
    echo.
    pause
    exit /b 1
)
echo.

echo ============================================
echo  ✓ Successfully pushed to GitHub!
echo ============================================
echo.
pause

