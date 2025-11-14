# Vercel Environment Variable Setup

## ⚠️ CRITICAL: Fix "Failed to fetch" / Connection Refused Error

Your frontend is trying to connect to `localhost:5000` instead of your Render backend. This is because the environment variable is not set correctly in Vercel.

---

## Quick Fix (5 minutes)

### Step 1: Go to Vercel Dashboard

1. Visit: https://vercel.com/dashboard
2. Click on your project: **rajwindow** (or your project name)
3. Go to **Settings** → **Environment Variables**

### Step 2: Add/Update Environment Variable

**Add this environment variable:**

| Name | Value |
|------|-------|
| `VITE_API_URL` | `https://windowmanagementsystem.onrender.com/api` |

**Important:**
- ✅ Name must be exactly: `VITE_API_URL`
- ✅ Value must be exactly: `https://windowmanagementsystem.onrender.com/api`
- ✅ Select **Production**, **Preview**, and **Development** environments
- ✅ Click **Save**

### Step 3: Redeploy

After adding the environment variable:

1. Go to **Deployments** tab
2. Click the **3 dots** (⋯) on the latest deployment
3. Click **Redeploy**
4. Wait for deployment to complete (2-3 minutes)

---

## Verify It's Working

### Method 1: Check in Browser Console

1. Open your deployed site: `https://rajwindow.vercel.app`
2. Open Browser Console (F12)
3. Run this command:
```javascript
console.log('API URL:', import.meta.env.VITE_API_URL || 'https://windowmanagementsystem.onrender.com/api');
```

**Expected Output:**
```
API URL: https://windowmanagementsystem.onrender.com/api
```

**If you see `localhost:5000` or `undefined`**: The environment variable is not set correctly.

### Method 2: Check Network Tab

1. Open Browser Console (F12) → **Network** tab
2. Try to register or login
3. Look for the API request
4. **Request URL should be**: `https://windowmanagementsystem.onrender.com/api/auth/register`
5. **NOT**: `http://localhost:5000/api/auth/register`

---

## Common Mistakes

### ❌ Wrong: Setting to localhost
```
VITE_API_URL = http://localhost:5000/api
```
**Problem**: This only works locally, not on Vercel.

### ❌ Wrong: Missing `/api` at the end
```
VITE_API_URL = https://windowmanagementsystem.onrender.com
```
**Problem**: All API routes need `/api` prefix.

### ❌ Wrong: Using `REACT_APP_` prefix
```
REACT_APP_API_URL = https://windowmanagementsystem.onrender.com/api
```
**Problem**: Vite uses `VITE_` prefix, not `REACT_APP_`.

### ✅ Correct:
```
VITE_API_URL = https://windowmanagementsystem.onrender.com/api
```

---

## Step-by-Step Screenshots Guide

### 1. Navigate to Settings
```
Vercel Dashboard → Your Project → Settings → Environment Variables
```

### 2. Add New Variable
- Click **Add New**
- Name: `VITE_API_URL`
- Value: `https://windowmanagementsystem.onrender.com/api`
- Environments: Select all (Production, Preview, Development)
- Click **Save**

### 3. Redeploy
```
Deployments → Latest Deployment → ⋯ → Redeploy
```

---

## Troubleshooting

### Issue: Still seeing localhost after redeploy

**Solution:**
1. Clear browser cache (Ctrl+Shift+Delete)
2. Hard refresh (Ctrl+F5)
3. Check if environment variable is set correctly
4. Verify the deployment logs show the variable is being used

### Issue: Environment variable not showing in build

**Solution:**
1. Make sure variable name starts with `VITE_`
2. Redeploy after adding the variable
3. Check build logs in Vercel

### Issue: Still getting connection refused

**Solution:**
1. Verify backend is running: Visit `https://windowmanagementsystem.onrender.com/api/health`
2. Check CORS is configured correctly in backend
3. Check browser console for exact error message

---

## Current Configuration

Your `api.js` file is already configured correctly:
```javascript
const API_URL = import.meta.env.VITE_API_URL || 'https://windowmanagementsystem.onrender.com/api';
```

This means:
- ✅ If `VITE_API_URL` is set in Vercel → Uses that
- ✅ If not set → Falls back to Render URL
- ❌ But if it's set to `localhost:5000` → Will use that (WRONG!)

**So you MUST set it correctly in Vercel!**

---

## After Fixing

Once you've:
1. ✅ Set `VITE_API_URL` in Vercel
2. ✅ Redeployed
3. ✅ Verified it's working

Your registration and login should work perfectly! 🎉

---

## Quick Checklist

- [ ] Go to Vercel Dashboard
- [ ] Settings → Environment Variables
- [ ] Add `VITE_API_URL` = `https://windowmanagementsystem.onrender.com/api`
- [ ] Select all environments
- [ ] Save
- [ ] Redeploy
- [ ] Test registration/login
- [ ] Verify API calls go to Render, not localhost

---

**The fix is simple: Just set the environment variable in Vercel and redeploy!**

