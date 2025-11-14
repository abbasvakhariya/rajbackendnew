# Deploy to Vercel - Window Management System

## Method 1: Deploy via Vercel CLI (Recommended)

### Step 1: Install Vercel CLI
```bash
npm install -g vercel
```

### Step 2: Navigate to your React app directory
```bash
cd my-react-app
```

### Step 3: Login to Vercel
```bash
vercel login
```

### Step 4: Deploy
```bash
vercel
```

Follow the prompts:
- Set up and deploy? **Yes**
- Which scope? (Select your account)
- Link to existing project? **No**
- What's your project's name? (e.g., `window-management-system`)
- In which directory is your code located? **./**

### Step 5: Deploy to Production
```bash
vercel --prod
```

---

## Method 2: Deploy via GitHub Integration (Recommended for Continuous Deployment)

### Step 1: Push your code to GitHub
(You've already done this)

### Step 2: Go to Vercel Dashboard
1. Visit https://vercel.com
2. Sign up/Login with your GitHub account
3. Click "Add New Project"

### Step 3: Import your GitHub repository
1. Select your repository: `windowsmangement`
2. Vercel will auto-detect it's a Vite project
3. Configure project settings:
   - **Framework Preset**: Vite
   - **Root Directory**: `my-react-app`
   - **Build Command**: `npm run build`
   - **Output Directory**: `dist`
   - **Install Command**: `npm install`

### Step 4: Deploy
Click "Deploy" and wait for the build to complete.

---

## Method 3: Deploy via Vercel Dashboard (Quick Start)

1. Go to https://vercel.com
2. Click "Add New Project"
3. If you haven't connected GitHub, click "Import Git Repository"
4. Connect your GitHub account
5. Select the `windowsmangement` repository
6. Configure:
   - **Root Directory**: `my-react-app`
   - **Framework**: Vite (auto-detected)
7. Click "Deploy"

---

## Important Configuration

### Root Directory
Since your React app is in the `my-react-app` folder, you need to set:
- **Root Directory**: `my-react-app`

### Build Settings (Auto-detected for Vite)
- Build Command: `npm run build`
- Output Directory: `dist`
- Install Command: `npm install`

---

## Environment Variables (if needed)
If you add any environment variables later, add them in:
- Vercel Dashboard → Project → Settings → Environment Variables

---

## Custom Domain (Optional)
After deployment:
1. Go to Project Settings → Domains
2. Add your custom domain

---

## Troubleshooting

### Build fails?
- Check that `npm run build` works locally
- Ensure all dependencies are in `package.json`
- Check the build logs in Vercel dashboard

### 404 errors?
- Make sure `vercel.json` is configured correctly
- Check that the output directory is `dist`

### Can't find the app?
- Check that Root Directory is set to `my-react-app`


