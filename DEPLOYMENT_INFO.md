# Deployment Information

## 🚀 Backend Deployment Status: LIVE

### Backend URLs

**Primary URL**: https://windowmanagementsystem.onrender.com

**API Base URL**: https://windowmanagementsystem.onrender.com/api

**Health Check**: https://windowmanagementsystem.onrender.com/api/health

### Frontend URLs

**Production Frontend**: https://rajwindow.vercel.app

### Quick Links

- **Health Check**: [https://windowmanagementsystem.onrender.com/api/health](https://windowmanagementsystem.onrender.com/api/health)
- **API Documentation**: [https://windowmanagementsystem.onrender.com/api](https://windowmanagementsystem.onrender.com/api)

---

## Environment Configuration

### Frontend (.env)
```env
VITE_API_URL=https://windowmanagementsystem.onrender.com/api
```

### Backend (Render Environment Variables)
- ✅ NODE_ENV = production
- ✅ PORT = 5000
- ✅ MONGODB_URI = (configured)
- ✅ JWT_SECRET = (configured)
- ✅ EMAIL_USER = abbasvakhariya00@gmail.com
- ✅ FRONTEND_URL = https://rajwindow.vercel.app

---

## Deployment Date
**Deployed**: November 11, 2025

**Status**: ✅ Active and Running

**MongoDB**: ✅ Connected

---

## Testing Endpoints

### Health Check
```bash
GET https://windowmanagementsystem.onrender.com/api/health
```

### Test Registration
```bash
POST https://windowmanagementsystem.onrender.com/api/auth/register
Content-Type: application/json

{
  "email": "test@example.com",
  "password": "password123",
  "fullName": "Test User"
}
```

### Test Login OTP
```bash
POST https://windowmanagementsystem.onrender.com/api/auth/request-login-otp
Content-Type: application/json

{
  "email": "abbasvakhariya00@gmail.com"
}
```

---

## Admin Access

**Admin Email**: abbasvakhariya00@gmail.com

**Admin Panel**: Accessible only to the admin email above

**Create Admin User** (if needed):
```bash
# In Render Shell:
node scripts/setupAdmin.js abbasvakhariya00@gmail.com admin123 "Admin User"
```

---

## CORS Configuration

Allowed Origins:
- ✅ http://localhost:5173 (local development)
- ✅ http://localhost:3000 (local development)
- ✅ https://rajwindow.vercel.app (production frontend)
- ✅ https://windowmanagementsystem.onrender.com (backend)

---

## Notes

- Service may spin down after 15 minutes of inactivity (free tier)
- First request after spin-down may take 30-60 seconds
- All environment variables are configured in Render dashboard
- MongoDB connection is active and working

---

## Support

- **Render Dashboard**: https://dashboard.render.com
- **Render Logs**: Available in Render Dashboard → Your Service → Logs
- **GitHub Repository**: https://github.com/abbasvakhariya/windowbackend

