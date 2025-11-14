# Troubleshooting Guide

## Error: "User not found" / 404 Error

### What This Error Means:

This error occurs when:
1. **Invalid Token**: The token in your browser's localStorage is invalid or expired
2. **User Deleted**: The user account was deleted from the database
3. **Token Mismatch**: The token was created with a different JWT_SECRET
4. **Backend Not Connected**: The frontend can't reach the backend

---

## Quick Fixes

### Fix 1: Clear Browser Storage (Most Common)

The token might be invalid. Clear it:

1. **Open Browser Console** (F12)
2. **Run this command**:
```javascript
localStorage.clear();
location.reload();
```

3. **Try logging in again**

### Fix 2: Check Backend is Running

Test if backend is accessible:

1. **Open browser console** (F12)
2. **Run this**:
```javascript
fetch('https://windowmanagementsystem.onrender.com/api/health')
  .then(r => r.json())
  .then(console.log)
  .catch(console.error)
```

**Expected**: `{status: "OK", message: "Server is running"}`

**If it fails**: Backend might be spun down (free tier). Wait 30-60 seconds and try again.

### Fix 3: Verify Environment Variable

Make sure Vercel has the environment variable set:

1. Go to **Vercel Dashboard** → Your Project
2. **Settings** → **Environment Variables**
3. Check if `VITE_API_URL` is set to: `https://windowmanagementsystem.onrender.com/api`
4. If not set, add it and **redeploy**

### Fix 4: Check API URL in Code

The frontend should be using:
```javascript
const API_URL = 'https://windowmanagementsystem.onrender.com/api';
```

Verify this in browser console:
```javascript
// Check what API URL is being used
console.log(import.meta.env.VITE_API_URL || 'https://windowmanagementsystem.onrender.com/api');
```

---

## Step-by-Step Debugging

### Step 1: Check Browser Console

Open browser console (F12) and look for:
- Red error messages
- Network tab → Check failed requests
- See what URL is being called

### Step 2: Check Network Requests

1. Open **Network tab** in browser console
2. Try to login or refresh page
3. Look for requests to `/api/auth/me`
4. Check:
   - **Status Code**: Should be 200 (not 404 or 401)
   - **Request URL**: Should be `https://windowmanagementsystem.onrender.com/api/auth/me`
   - **Response**: Should have user data

### Step 3: Test Backend Directly

Test the backend endpoint directly:

```bash
# In browser console or terminal:
fetch('https://windowmanagementsystem.onrender.com/api/health', {
  method: 'GET',
  headers: {
    'Content-Type': 'application/json'
  }
})
.then(r => r.json())
.then(console.log)
```

### Step 4: Test with Token

If you have a token, test it:

```javascript
// In browser console:
const token = localStorage.getItem('token');
if (token) {
  fetch('https://windowmanagementsystem.onrender.com/api/auth/me', {
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
      'x-device-id': localStorage.getItem('deviceId') || 'test-device'
    }
  })
  .then(r => r.json())
  .then(console.log)
  .catch(console.error);
} else {
  console.log('No token found');
}
```

---

## Common Issues and Solutions

### Issue 1: "Failed to fetch"
**Cause**: Backend is not accessible or CORS error

**Solution**:
- Check if backend is running (test `/api/health`)
- Verify CORS allows your Vercel domain
- Check browser console for CORS errors

### Issue 2: "User not found"
**Cause**: Token is invalid or user doesn't exist

**Solution**:
- Clear localStorage: `localStorage.clear()`
- Login again with valid credentials
- Verify user exists in database

### Issue 3: 404 on `/api/auth/me`
**Cause**: Endpoint doesn't exist or wrong URL

**Solution**:
- Verify backend is deployed
- Check if route exists in `backend/routes/auth.js`
- Test health endpoint first

### Issue 4: CORS Error
**Cause**: Backend doesn't allow your frontend domain

**Solution**:
- Backend CORS is already fixed to allow all `*.vercel.app` domains
- Make sure backend is redeployed with latest code
- Check Render logs for CORS errors

---

## Manual Token Cleanup

If you're stuck, manually clear everything:

```javascript
// Run in browser console:
localStorage.removeItem('token');
localStorage.removeItem('deviceId');
sessionStorage.clear();
location.reload();
```

Then login fresh.

---

## Verify Everything is Working

### Test Checklist:

1. **Backend Health**:
   ```javascript
   fetch('https://windowmanagementsystem.onrender.com/api/health')
     .then(r => r.json())
     .then(d => console.log('Backend:', d))
   ```

2. **Frontend API URL**:
   ```javascript
   console.log('API URL:', import.meta.env.VITE_API_URL || 'https://windowmanagementsystem.onrender.com/api');
   ```

3. **Login Flow**:
   - Request OTP
   - Enter OTP
   - Should get token and user data

4. **Token Storage**:
   ```javascript
   console.log('Token:', localStorage.getItem('token'));
   console.log('Device ID:', localStorage.getItem('deviceId'));
   ```

---

## Still Not Working?

### Check Render Logs:
1. Go to Render Dashboard
2. Your Backend Service → **Logs**
3. Look for errors when you try to login

### Check Vercel Logs:
1. Go to Vercel Dashboard
2. Your Project → **Deployments**
3. Click latest deployment → **Logs**
4. Check for build or runtime errors

### Common Causes:
- Backend spun down (free tier) - wait and retry
- Environment variable not set in Vercel
- Token expired or invalid
- User account doesn't exist
- CORS misconfiguration

---

## Quick Reset

If nothing works, do a complete reset:

1. **Clear browser storage**:
   ```javascript
   localStorage.clear();
   sessionStorage.clear();
   location.reload();
   ```

2. **Verify backend is running**:
   - Visit: `https://windowmanagementsystem.onrender.com/api/health`

3. **Login fresh**:
   - Request new OTP
   - Login with OTP
   - Should work now

---

**The most common fix is clearing localStorage and logging in again!**

