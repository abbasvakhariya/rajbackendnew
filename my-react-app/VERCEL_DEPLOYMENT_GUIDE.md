# Vercel Deployment Guide - Complete Step by Step

## 🚀 Deploy Your Frontend to Vercel

Your backend is already deployed on Render at: `https://windowmanagementsystem.onrender.com`

Now let's deploy your frontend to Vercel!

---

## Step 1: Prepare Your Repository

### Option A: Deploy from GitHub (Recommended)

1. **Push your frontend to GitHub** (if not already):
   ```bash
   cd my-react-app
   git init  # if not already a git repo
   git add .
   git commit -m "Initial commit - Window Management System Frontend"
   ```

2. **Create a new GitHub repository**:
   - Go to https://github.com/new
   - Name it: `window-frontend` (or any name you prefer)
   - Don't initialize with README
   - Click "Create repository"

3. **Push to GitHub**:
   ```bash
   git remote add origin https://github.com/abbasvakhariya/window-frontend.git
   git branch -M main
   git push -u origin main
   ```

### Option B: Deploy from Local Folder

You can also deploy directly from your local folder using Vercel CLI.

---

## Step 2: Sign Up / Sign In to Vercel

1. Go to [https://vercel.com](https://vercel.com)
2. Click **"Sign Up"** or **"Log In"**
3. **Sign in with GitHub** (recommended for easy repository access)

---

## Step 3: Create New Project

1. Once logged in, click **"Add New..."** → **"Project"**
2. You'll see your GitHub repositories
3. **Import** your frontend repository (`window-frontend` or the one you created)
   - If you don't see it, click **"Adjust GitHub App Permissions"** and grant access

---

## Step 4: Configure Project Settings

### Framework Preset:
- **Framework Preset**: `Vite` (should auto-detect)
- If not detected, select **"Other"** and we'll configure manually

### Root Directory:
- **Root Directory**: `./` (leave as is, or set to `my-react-app` if your repo has it in a subfolder)

### Build Settings:
- **Build Command**: `npm run build` (auto-detected)
- **Output Directory**: `dist` (auto-detected)
- **Install Command**: `npm install` (auto-detected)

### Environment Variables:
Click **"Environment Variables"** and add:

#### Required Variable:

**VITE_API_URL**
- **Value**: `https://windowmanagementsystem.onrender.com/api`
- **Environment**: Select all (Production, Preview, Development)

#### Optional (if you have other env vars):
Add any other environment variables your app needs.

---

## Step 5: Deploy

1. Review all settings
2. Click **"Deploy"**
3. Wait for build to complete (usually 1-3 minutes)
4. Vercel will automatically:
   - Install dependencies
   - Build your app
   - Deploy to production

---

## Step 6: Get Your Deployment URL

After deployment, you'll get:
- **Production URL**: `https://your-project-name.vercel.app`
- **Preview URLs**: For each branch/PR

**Your frontend will be live at**: `https://your-project-name.vercel.app`

---

## Step 7: Update Backend CORS (If Needed)

Your backend CORS already allows `https://rajwindow.vercel.app`, but if you get a different URL:

1. Go to Render Dashboard → Your Backend Service
2. Add your new Vercel URL to environment variables (if using env-based CORS)
3. Or update `backend/server.js` and redeploy

The backend already has this in `allowedOrigins`:
```javascript
'https://rajwindow.vercel.app'
```

If your Vercel URL is different, you may need to update it.

---

## Step 8: Test Your Deployment

### Test Frontend:
1. Visit your Vercel URL
2. Try logging in
3. Test all features

### Test API Connection:
Open browser console and run:
```javascript
fetch('https://windowmanagementsystem.onrender.com/api/health')
  .then(r => r.json())
  .then(console.log)
```

Should return: `{status: "OK", message: "Server is running"}`

---

## Step 9: Custom Domain (Optional)

If you want to use a custom domain:

1. Go to Vercel Dashboard → Your Project → Settings → Domains
2. Add your domain
3. Follow DNS configuration instructions
4. Update backend CORS to include your custom domain

---

## Step 10: Automatic Deployments

Vercel automatically deploys:
- ✅ Every push to `main` branch → Production
- ✅ Every push to other branches → Preview deployment
- ✅ Every Pull Request → Preview deployment

---

## Configuration Files

### vercel.json (Already Created)

Your project already has a `vercel.json` file. It should look like:

```json
{
  "buildCommand": "npm run build",
  "outputDirectory": "dist",
  "framework": "vite",
  "rewrites": [
    {
      "source": "/(.*)",
      "destination": "/index.html"
    }
  ]
}
```

This ensures React Router works correctly with client-side routing.

---

## Environment Variables in Vercel

### Setting Environment Variables:

1. Go to **Project Settings** → **Environment Variables**
2. Add variables:
   - `VITE_API_URL` = `https://windowmanagementsystem.onrender.com/api`
3. Select environments: **Production**, **Preview**, **Development**
4. Click **"Save"**
5. **Redeploy** for changes to take effect

---

## Troubleshooting

### Build Fails:
- Check build logs in Vercel dashboard
- Verify `package.json` has correct scripts
- Ensure all dependencies are listed

### API Not Connecting:
- Verify `VITE_API_URL` environment variable is set
- Check browser console for CORS errors
- Verify backend is running and accessible

### Routing Issues (404 on refresh):
- Ensure `vercel.json` has the rewrite rule
- Check that `outputDirectory` is `dist`

### CORS Errors:
- Verify backend CORS includes your Vercel URL
- Check backend logs in Render
- Ensure credentials are included in requests

---

## Quick Checklist

- [ ] Frontend code pushed to GitHub
- [ ] Vercel account created
- [ ] Project imported from GitHub
- [ ] Build settings configured
- [ ] Environment variable `VITE_API_URL` set
- [ ] Project deployed successfully
- [ ] Frontend URL tested
- [ ] API connection verified
- [ ] Login tested
- [ ] Admin panel accessible

---

## Your Deployment URLs

### Backend (Render):
- **URL**: https://windowmanagementsystem.onrender.com
- **API**: https://windowmanagementsystem.onrender.com/api

### Frontend (Vercel):
- **URL**: https://your-project-name.vercel.app
- (Update this after deployment)

---

## Updating Your Deployment

### Automatic:
- Just push to GitHub → Vercel auto-deploys

### Manual:
1. Go to Vercel Dashboard
2. Click **"Redeploy"** on your project
3. Or trigger from GitHub

---

## Support

- **Vercel Docs**: https://vercel.com/docs
- **Vercel Status**: https://www.vercel-status.com
- **Vercel Community**: https://github.com/vercel/vercel/discussions

---

## Next Steps After Deployment

1. ✅ Test all features
2. ✅ Create admin user (if not done)
3. ✅ Test admin panel
4. ✅ Test user registration/login
5. ✅ Test subscription flow
6. ✅ Monitor both Render and Vercel dashboards

---

🎉 **Your app will be live on Vercel!**

Good luck with your deployment! 🚀

