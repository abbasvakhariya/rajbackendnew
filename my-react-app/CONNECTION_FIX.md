# 🔗 Frontend-Backend Connection Fix

## Issue: Frontend and Backend Not Connected

If your Vercel frontend can't connect to your Render backend, follow these steps:

---

## ✅ Step 1: Verify Backend is Running

Test your backend health endpoint:
```
https://windowmanagementsystem.onrender.com/api/health
```

Should return: `{"status":"OK","message":"Server is running"}`

---

## ✅ Step 2: Set Environment Variable in Vercel

**This is the most important step!**

1. Go to **Vercel Dashboard** → Your Project
2. Click **Settings** → **Environment Variables**
3. Add this variable:
   - **Key**: `VITE_API_URL`
   - **Value**: `https://windowmanagementsystem.onrender.com/api`
   - **Environments**: Select **Production**, **Preview**, and **Development**
4. Click **Save**
5. **Redeploy** your project (important!)

### How to Redeploy:
- Go to **Deployments** tab
- Click the **3 dots** (⋯) on latest deployment
- Click **Redeploy**

---

## ✅ Step 3: Verify CORS is Updated

The backend CORS has been updated to allow **ALL Vercel domains** (*.vercel.app).

This means any Vercel deployment will work automatically.

---

## ✅ Step 4: Test the Connection

### Test from Browser Console:

1. Open your Vercel frontend URL
2. Open browser console (F12)
3. Run this:
```javascript
fetch('https://windowmanagementsystem.onrender.com/api/health')
  .then(r => r.json())
  .then(console.log)
  .catch(console.error)
```

**Expected Result**: `{status: "OK", message: "Server is running"}`

### Test from Your App:

1. Try to register a new user
2. Try to login
3. Check browser console for any errors

---

## ✅ Step 5: Check Common Issues

### Issue 1: CORS Error
**Error**: `Access to fetch at '...' from origin '...' has been blocked by CORS policy`

**Solution**: 
- Backend CORS is already fixed to allow all Vercel domains
- Make sure you redeployed the backend after the CORS update

### Issue 2: 404 Not Found
**Error**: `Failed to fetch` or `404 Not Found`

**Solution**:
- Verify backend URL is correct: `https://windowmanagementsystem.onrender.com/api`
- Check if backend service is running (might be spun down on free tier)
- Wait 30-60 seconds and try again (first request after spin-down is slow)

### Issue 3: Environment Variable Not Working
**Error**: API calls going to wrong URL

**Solution**:
- Verify `VITE_API_URL` is set in Vercel
- **Redeploy** after adding environment variable
- Check Vercel build logs to see if env var is being used

---

## ✅ Step 6: Verify API URL in Code

The frontend code is already configured correctly:

```javascript
// src/utils/api.js
const API_URL = import.meta.env.VITE_API_URL || 'https://windowmanagementsystem.onrender.com/api';
```

This means:
- If `VITE_API_URL` is set in Vercel → Uses that
- If not set → Falls back to Render URL

---

## Quick Fix Checklist

- [ ] Backend is running (test health endpoint)
- [ ] `VITE_API_URL` environment variable is set in Vercel
- [ ] Project redeployed after setting env var
- [ ] Backend CORS updated (allows *.vercel.app)
- [ ] Backend redeployed with CORS fix
- [ ] Tested connection from browser console
- [ ] No CORS errors in browser console
- [ ] Login/registration working

---

## Still Not Working?

### Check Vercel Build Logs:
1. Go to Vercel Dashboard → Your Project → Deployments
2. Click on latest deployment
3. Check **Build Logs** for any errors
4. Check **Runtime Logs** for runtime errors

### Check Render Logs:
1. Go to Render Dashboard → Your Backend Service
2. Click **Logs** tab
3. Look for CORS errors or connection issues

### Test Backend Directly:
```bash
# Test health endpoint
curl https://windowmanagementsystem.onrender.com/api/health

# Test with CORS headers
curl -H "Origin: https://your-vercel-url.vercel.app" \
     -H "Access-Control-Request-Method: POST" \
     -H "Access-Control-Request-Headers: Content-Type" \
     -X OPTIONS \
     https://windowmanagementsystem.onrender.com/api/health
```

---

## Your URLs

**Backend API**: `https://windowmanagementsystem.onrender.com/api`

**Frontend**: `https://your-vercel-url.vercel.app` (your actual Vercel URL)

---

## After Fixing

Once connected:
1. ✅ Test user registration
2. ✅ Test login with OTP
3. ✅ Test admin panel access
4. ✅ Test all API endpoints

---

**The main issue is usually the environment variable not being set in Vercel or not redeploying after setting it!**

Make sure to **redeploy** after adding the environment variable! 🔄

