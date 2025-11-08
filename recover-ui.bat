@echo off
echo ========================================
echo UI Recovery Script
echo ========================================
echo.

echo Step 1: Checking merge commit parents...
git log --no-pager a5b663d^2 --oneline -10 > ui-parent.txt
echo Saved to ui-parent.txt

echo.
echo Step 2: Creating backup branch from your UI...
git checkout -b ui-recovery-backup a5b663d^2
echo Created branch: ui-recovery-backup

echo.
echo Step 3: Check if your UI is here...
echo Open your browser and check if the UI looks good
echo.
pause

echo.
echo Step 4: If UI looks good, merge back to main...
git checkout main
git merge ui-recovery-backup -m "Recover UI improvements"

echo.
echo Step 5: Push to remote...
git push origin main

echo.
echo ========================================
echo Recovery complete!
echo ========================================
pause
