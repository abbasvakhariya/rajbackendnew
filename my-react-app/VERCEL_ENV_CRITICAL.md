# ⚠️ CRITICAL: Fix "localhost:5000" Connection Error

## The Problem

Your frontend is trying to connect to `http://localhost:5000` instead of your Render backend. This is because the **Vercel environment variable is not set**.

**Error you're seeing:**
```
POST http://localhost:5000/api/auth/request-login-otp net::ERR_CONNECTION_REFUSED
```

---

## ✅ THE FIX (5 Minutes)

### Step 1: Go to Vercel Dashboard

1. Visit: **https://vercel.com/dashboard**
2. Click on your project: **rajwindow** (or your project name)

### Step 2: Add Environment Variable

1. Click **Settings** (in the top menu)
2. Click **Environment Variables** (in the left sidebar)
3. Click **Add New** button
4. Fill in:
   - **Key**: `VITE_API_URL`
   - **Value**: `https://windowmanagementsystem.onrender.com/api`
   - **Environments**: Check ALL three:
     - ✅ Production
     - ✅ Preview  
     - ✅ Development
5. Click **Save**

### Step 3: Redeploy

**IMPORTANT**: You MUST redeploy after adding the environment variable!

1. Go to **Deployments** tab (top menu)
2. Find your latest deployment
3. Click the **3 dots** (⋯) on the right
4. Click **Redeploy**
5. Wait 2-3 minutes for deployment to complete

---

## 🔍 Verify It's Fixed

After redeploying, open your site and check the browser console (F12):

### ✅ Success (What you should see):
```
🌐 API Configuration: {
  Environment Variable: "https://windowmanagementsystem.onrender.com/api",
  Using API URL: "https://windowmanagementsystem.onrender.com/api",
  Mode: "production"
}
```

### ❌ Still Broken (What you might see):
```
🌐 API Configuration: {
  Environment Variable: "NOT SET",
  Using API URL: "https://windowmanagementsystem.onrender.com/api",
  Mode: "production"
}
⚠️ VITE_API_URL not set in Vercel. Using fallback URL.
```

**Even if you see the warning, the fallback should work now!** But you should still set the variable properly.

---

## 📸 Visual Guide

### Where to Find Settings:
```
Vercel Dashboard → Your Project → Settings → Environment Variables
```

### What to Add:
```
┌─────────────────────────────────────────┐
│ Key: VITE_API_URL                       │
│ Value: https://windowmanagementsystem... │
│ Environments: ☑ Production              │
│             ☑ Preview                   │
│             ☑ Development               │
│ [Save]                                   │
└─────────────────────────────────────────┘
```

---

## 🚨 Common Mistakes

### ❌ Wrong: Not redeploying
- Adding the variable is not enough!
- You MUST click "Redeploy" after adding it

### ❌ Wrong: Wrong variable name
- Must be: `VITE_API_URL` (with `VITE_` prefix)
- NOT: `API_URL` or `REACT_APP_API_URL`

### ❌ Wrong: Wrong value
- Must be: `https://windowmanagementsystem.onrender.com/api`
- NOT: `http://localhost:5000/api`
- NOT: `https://windowmanagementsystem.onrender.com` (missing `/api`)

### ❌ Wrong: Only Production selected
- Select ALL environments (Production, Preview, Development)

---

## 🔧 Why This Happens

Vite (your build tool) needs environment variables at **BUILD TIME**. If the variable isn't set when Vercel builds your app, it won't be in the final bundle.

That's why:
1. You must set it in Vercel BEFORE building
2. You must redeploy after setting it

---

## ✅ Quick Checklist

- [ ] Go to Vercel Dashboard
- [ ] Settings → Environment Variables
- [ ] Add `VITE_API_URL` = `https://windowmanagementsystem.onrender.com/api`
- [ ] Select ALL environments
- [ ] Save
- [ ] Go to Deployments
- [ ] Click ⋯ on latest deployment
- [ ] Click Redeploy
- [ ] Wait for deployment
- [ ] Test your app
- [ ] Check browser console for API URL

---

## 🆘 Still Not Working?

### Check 1: Is the variable actually set?
1. Go to Vercel → Settings → Environment Variables
2. Verify `VITE_API_URL` is listed
3. Click on it to see the value

### Check 2: Did you redeploy?
1. Go to Deployments
2. Check the latest deployment timestamp
3. It should be AFTER you added the variable

### Check 3: Check build logs
1. Go to Deployments → Latest → View Build Logs
2. Look for any errors about environment variables

### Check 4: Clear browser cache
1. Hard refresh: `Ctrl + Shift + R` (Windows) or `Cmd + Shift + R` (Mac)
2. Or clear cache completely

---

## 💡 Pro Tip

After setting the variable and redeploying, you can verify in the browser console:

```javascript
// This should show the Render URL
console.log('API URL:', import.meta.env.VITE_API_URL || 'https://windowmanagementsystem.onrender.com/api');
```

---

**The fix is simple: Set the environment variable in Vercel and redeploy!** 🚀

