# 🚀 Quick Vercel Deployment Guide

## Your Backend is Live!
**Backend URL**: https://windowmanagementsystem.onrender.com/api

## Deploy Frontend to Vercel - 3 Simple Steps

### Step 1: Push to GitHub
```bash
cd my-react-app
git add .
git commit -m "Prepare for Vercel deployment"
git push origin main
```

### Step 2: Deploy on Vercel

1. **Go to**: https://vercel.com
2. **Sign in** with GitHub
3. **Click**: "Add New..." → "Project"
4. **Import** your repository
5. **Configure**:
   - Framework: Vite (auto-detected)
   - Build Command: `npm run build`
   - Output Directory: `dist`
6. **Add Environment Variable**:
   - Key: `VITE_API_URL`
   - Value: `https://windowmanagementsystem.onrender.com/api`
7. **Click**: "Deploy"

### Step 3: Test

Your app will be live at: `https://your-project-name.vercel.app`

Test the connection:
```javascript
// In browser console:
fetch('https://windowmanagementsystem.onrender.com/api/health')
  .then(r => r.json())
  .then(console.log)
```

---

## That's It! 🎉

Your full-stack app is now deployed:
- ✅ Backend: Render
- ✅ Frontend: Vercel
- ✅ Database: MongoDB Atlas

---

## Need Help?

See `VERCEL_DEPLOYMENT_GUIDE.md` for detailed instructions.

