# ✅ Connection Verification Checklist

## Backend Status: ✅ DEPLOYED

Your backend is successfully deployed on Render:
- **URL**: `https://windowmanagementsystem.onrender.com`
- **Status**: Running
- **Build**: Successful
- **Node.js**: v22.16.0

---

## Frontend Status: ⚠️ NEEDS REDEPLOY

Your environment variable is set in Vercel:
- ✅ `VITE_API_URL` = `https://windowmanagementsystem.onrender.com/api`
- ✅ Set for all environments

**But you MUST redeploy for it to take effect!**

---

## 🔧 Final Steps to Connect

### Step 1: Redeploy Frontend in Vercel

1. Go to: **https://vercel.com/dashboard**
2. Select your project: **rajwindow**
3. Go to **Deployments** tab
4. Click **3 dots** (⋯) on latest deployment
5. Click **Redeploy**
6. Wait 2-3 minutes

### Step 2: Test Backend Connection

Open in browser: `https://windowmanagementsystem.onrender.com/api/health`

**Expected Response:**
```json
{
  "status": "OK",
  "message": "Server is running"
}
```

**If it times out:**
- Backend might be sleeping (free tier)
- Wait 30-60 seconds and try again
- First request after sleep takes longer

### Step 3: Test Frontend Connection

After redeploying frontend:

1. Open: `https://rajwindow.vercel.app`
2. Open Browser Console (F12)
3. Look for:
   ```
   🌐 API Configuration: {
     Environment Variable: "https://windowmanagementsystem.onrender.com/api",
     Using API URL: "https://windowmanagementsystem.onrender.com/api",
     Mode: "production"
   }
   ```
4. Try to register or login
5. Check Network tab - should see requests to `windowmanagementsystem.onrender.com`

---

## 🧪 Quick Test Commands

### Test Backend (in browser console):
```javascript
fetch('https://windowmanagementsystem.onrender.com/api/health')
  .then(r => r.json())
  .then(console.log)
  .catch(console.error)
```

### Test Frontend API URL (in browser console):
```javascript
console.log('API URL:', import.meta.env.VITE_API_URL || 'https://windowmanagementsystem.onrender.com/api');
```

### Test Registration Endpoint:
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

## ✅ Complete Checklist

### Backend (Render):
- [x] Service deployed successfully
- [x] Build completed without errors
- [x] Server is running
- [x] MongoDB connected
- [x] CORS configured for Vercel domains

### Frontend (Vercel):
- [x] Environment variable `VITE_API_URL` is set
- [x] Variable value is correct
- [ ] **Redeployed after setting variable** ← DO THIS NOW!
- [ ] Tested registration/login
- [ ] Verified API calls go to Render backend

---

## 🎯 What to Do Right Now

1. **Redeploy frontend in Vercel** (most important!)
2. **Test backend health**: Visit `https://windowmanagementsystem.onrender.com/api/health`
3. **Test frontend**: Open `https://rajwindow.vercel.app` and try to register
4. **Check console**: Verify API URL is correct

---

## 🐛 Troubleshooting

### Still seeing localhost:5000?
- Clear browser cache: `Ctrl + Shift + Delete`
- Hard refresh: `Ctrl + F5`
- Verify redeployment completed

### Backend not responding?
- Wait 30-60 seconds (free tier spin-up time)
- Check Render logs for errors
- Verify MongoDB connection

### CORS errors?
- Backend already configured for `*.vercel.app`
- Check browser console for exact error
- Verify request origin in Network tab

---

## 🎉 Success Indicators

You'll know it's working when:
- ✅ Browser console shows Render API URL (not localhost)
- ✅ Registration/login works without errors
- ✅ Network tab shows requests to `windowmanagementsystem.onrender.com`
- ✅ No CORS errors in console
- ✅ Backend health check returns OK

---

**Everything is set up correctly! Just redeploy the frontend and you're good to go!** 🚀

