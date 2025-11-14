# 🔧 Quick Fix: Frontend Not Connecting to Backend

## ✅ You've Done This Correctly:
- Environment variable `VITE_API_URL` is set to `https://windowmanagementsystem.onrender.com/api`
- Variable is set for all environments

## ⚠️ CRITICAL: You Must Redeploy!

**Environment variables only take effect after redeployment!**

### Step 1: Redeploy in Vercel

1. Go to **Deployments** tab (top menu in Vercel)
2. Find your latest deployment
3. Click the **3 dots** (⋯) on the right side
4. Click **Redeploy**
5. Wait 2-3 minutes for deployment to complete

### Step 2: Verify Backend is Running

Test if your backend is accessible:

1. Open browser and go to: `https://windowmanagementsystem.onrender.com/api/health`
2. You should see: `{"status":"OK","message":"Server is running"}`

**If you see an error or timeout:**
- Backend might be spun down (free tier sleeps after 15 min inactivity)
- Wait 30-60 seconds and try again
- First request after sleep takes longer

### Step 3: Test After Redeploy

After redeploying, open your site (`https://rajwindow.vercel.app`) and:

1. Open Browser Console (F12)
2. Look for this message:
   ```
   🌐 API Configuration: {
     Environment Variable: "https://windowmanagementsystem.onrender.com/api",
     Using API URL: "https://windowmanagementsystem.onrender.com/api",
     Mode: "production"
   }
   ```

3. Try to register or login
4. Check Network tab - requests should go to `windowmanagementsystem.onrender.com`, NOT `localhost:5000`

---

## 🐛 Still Not Working? Troubleshooting

### Issue 1: Still seeing localhost:5000

**Cause**: Old build is cached or environment variable not applied

**Fix**:
1. Clear browser cache: `Ctrl + Shift + Delete` → Clear cache
2. Hard refresh: `Ctrl + F5` (Windows) or `Cmd + Shift + R` (Mac)
3. Check Vercel deployment logs to confirm variable is being used

### Issue 2: Backend connection refused

**Cause**: Backend is spun down (free tier)

**Fix**:
1. Visit backend health endpoint: `https://windowmanagementsystem.onrender.com/api/health`
2. Wait 30-60 seconds for it to wake up
3. Try again

### Issue 3: CORS error

**Cause**: Backend CORS not allowing your domain

**Fix**: Backend already configured to allow `*.vercel.app` domains. If still seeing CORS:
1. Check backend logs in Render
2. Verify CORS configuration in `backend/server.js`

### Issue 4: Environment variable not in build

**Cause**: Variable wasn't set before build

**Fix**:
1. Go to Vercel → Settings → Environment Variables
2. Verify `VITE_API_URL` is there
3. **Redeploy** (this is critical!)

---

## ✅ Quick Checklist

- [ ] Environment variable `VITE_API_URL` is set in Vercel
- [ ] Variable value is: `https://windowmanagementsystem.onrender.com/api`
- [ ] Variable is set for all environments
- [ ] **Redeployed after setting variable** ← MOST IMPORTANT!
- [ ] Backend is accessible: `https://windowmanagementsystem.onrender.com/api/health`
- [ ] Cleared browser cache
- [ ] Checked browser console for API URL
- [ ] Tested registration/login

---

## 🧪 Test Commands

### Test Backend Health (in browser console):
```javascript
fetch('https://windowmanagementsystem.onrender.com/api/health')
  .then(r => r.json())
  .then(console.log)
  .catch(console.error)
```

### Test API URL in Frontend (in browser console):
```javascript
console.log('API URL:', import.meta.env.VITE_API_URL || 'https://windowmanagementsystem.onrender.com/api');
```

### Test Registration (in browser console):
```javascript
fetch('https://windowmanagementsystem.onrender.com/api/auth/register', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    email: 'test@example.com',
    password: 'test123',
    fullName: 'Test User'
  })
})
.then(r => r.json())
.then(console.log)
.catch(console.error)
```

---

## 📞 Still Need Help?

1. **Check Vercel Build Logs**: 
   - Deployments → Latest → View Build Logs
   - Look for environment variable usage

2. **Check Render Backend Logs**:
   - Render Dashboard → Your Service → Logs
   - Look for incoming requests

3. **Check Browser Console**:
   - F12 → Console tab
   - Look for errors and API configuration messages

---

**Remember: The most common issue is forgetting to redeploy after setting the environment variable!** 🚀

