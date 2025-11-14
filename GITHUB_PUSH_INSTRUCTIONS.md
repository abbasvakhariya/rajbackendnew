# Instructions to Push Code to GitHub

## Step 1: Install Git (if not installed)
1. Download Git from: https://git-scm.com/download/win
2. Install it with default settings
3. Restart your terminal/command prompt

## Step 2: Initialize Git Repository
Open PowerShell or Command Prompt in your project directory and run:

```bash
cd "C:\Users\CTN\OneDrive\Desktop\window mangement system"
git init
```

## Step 3: Create .gitignore file
Create a `.gitignore` file in the root directory with:

```
node_modules/
dist/
.env
*.log
.DS_Store
```

## Step 4: Add files and commit
```bash
git add .
git commit -m "Initial commit: Window Management System"
```

## Step 5: Add remote repository
```bash
git remote add origin https://github.com/abbasvakhariya/windowsmangement.git
```

## Step 6: Push to GitHub
```bash
git branch -M main
git push -u origin main
```

## Alternative: If you need to authenticate
If GitHub asks for authentication:
- Use a Personal Access Token instead of password
- Generate token at: https://github.com/settings/tokens
- Select "repo" scope
- Use the token as password when prompted

## Note
Make sure you're logged into GitHub and have write access to the repository.

