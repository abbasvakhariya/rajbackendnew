# 🔍 Debug Login & Registration Issues

## What I Just Fixed

I've added:
- ✅ Better error handling with try/catch blocks
- ✅ Detailed console logging for API requests
- ✅ Clear error messages for users
- ✅ Network error detection

---

## 🧪 How to Debug

### Step 1: Open Browser Console

1. Open your site: `https://rajwindow.vercel.app`
2. Press **F12** to open DevTools
3. Go to **Console** tab
4. Clear the console (right-click → Clear console)

### Step 2: Try Registration/Login

1. Fill in the registration form
2. Click "Register"
3. **Watch the console** - you should see:

```
🌐 API Configuration: {
  Environment Variable: "https://windowmanagementsystem.onrender.com/api",
  Using API URL: "https://windowmanagementsystem.onrender.com/api"
}
🌐 API Request: POST https://windowmanagementsystem.onrender.com/api/auth/register
📡 API Response: 200 OK for /auth/register
✅ API Success: /auth/register
```

### Step 3: Check for Errors

**If you see errors, look for these patterns:**

#### Error 1: Network Error
```
❌ Network Error: Cannot connect to server.
Backend URL: https://windowmanagementsystem.onrender.com/api
```

**Cause**: Backend is not responding (might be sleeping)

**Fix**:
1. Visit: `https://windowmanagementsystem.onrender.com/api/health`
2. Wait 30-60 seconds (free tier spin-up time)
3. Try again

#### Error 2: Wrong API URL
```
🌐 API Request: POST http://localhost:5000/api/auth/register
```

**Cause**: Environment variable not set or not applied

**Fix**:
1. Go to Vercel → Settings → Environment Variables
2. Verify `VITE_API_URL` is set correctly
3. **Redeploy** the frontend

#### Error 3: CORS Error
```
Access to fetch at '...' from origin '...' has been blocked by CORS policy
```

**Cause**: Backend CORS not allowing your domain

**Fix**: Backend already configured, but check Render logs

#### Error 4: 500 Server Error
```
📡 API Response: 500 Internal Server Error
❌ API Error Response: { message: "..." }
```

**Cause**: Backend error (check Render logs)

**Fix**: Check Render dashboard → Logs

---

## 🔍 What to Look For

### ✅ Good Signs:
- Console shows: `🌐 API Request: POST https://windowmanagementsystem.onrender.com/api/auth/register`
- Console shows: `📡 API Response: 200 OK`
- Console shows: `✅ API Success`
- No red errors in console

### ❌ Bad Signs:
- Console shows: `localhost:5000` (wrong URL)
- Console shows: `❌ Network Error`
- Console shows: `Failed to fetch`
- Red errors in console
- No API request logs at all

---

## 🧪 Test Backend Directly

### Test 1: Health Check
Open in browser:
```
https://windowmanagementsystem.onrender.com/api/health
```

**Expected**: `{"status":"OK","message":"Server is running"}`

**If timeout**: Backend is sleeping, wait 30-60 seconds

### Test 2: Registration Endpoint
Open browser console and run:
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

**Expected**: Success response or error message

### Test 3: Check API URL
In browser console:
```javascript
console.log('API URL:', import.meta.env.VITE_API_URL || 'https://windowmanagementsystem.onrender.com/api');
```

**Expected**: `https://windowmanagementsystem.onrender.com/api`

**If shows `undefined` or `localhost`**: Environment variable not set

---

## 🐛 Common Issues & Fixes

### Issue 1: "Registering..." button stuck

**Symptoms**: Button shows "Registering..." but never completes

**Debug**:
1. Open console (F12)
2. Look for error messages
3. Check Network tab → see if request was made

**Common Causes**:
- Backend not responding (sleeping)
- Network error
- CORS error

**Fix**: Check console for specific error

### Issue 2: No error message shown

**Symptoms**: Form submits but nothing happens

**Debug**:
1. Check console for errors
2. Check if error is being caught
3. Verify error state is being set

**Fix**: I've added try/catch blocks - errors should now be shown

### Issue 3: Backend returns error

**Symptoms**: Console shows API response but with error

**Debug**:
1. Check the error message in console
2. Check Render logs for backend errors
3. Verify backend is running

**Fix**: Check specific error message

---

## 📋 Debugging Checklist

- [ ] Open browser console (F12)
- [ ] Clear console
- [ ] Try registration/login
- [ ] Check for API request logs
- [ ] Check for error messages
- [ ] Verify API URL is correct (not localhost)
- [ ] Test backend health endpoint
- [ ] Check Network tab for failed requests
- [ ] Check Render logs for backend errors
- [ ] Verify environment variable is set in Vercel
- [ ] Verify frontend was redeployed after setting env var

---

## 📞 Next Steps

After the new deployment:

1. **Wait for Vercel to deploy** (2-3 minutes)
2. **Open your site**: `https://rajwindow.vercel.app`
3. **Open console** (F12)
4. **Try registration/login**
5. **Check console logs** - you'll see detailed information about what's happening
6. **Share the console logs** if still having issues

The new logging will show exactly what's happening and where it's failing!

---

## 🎯 What the Logs Will Tell You

The new console logs will show:
- ✅ Which API URL is being used
- ✅ What request is being made
- ✅ What response is received
- ✅ Any errors that occur
- ✅ Network connection status

This will help identify the exact problem!

