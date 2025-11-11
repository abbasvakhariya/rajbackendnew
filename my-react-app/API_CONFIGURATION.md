# API Configuration

## Backend API URL

Your frontend is configured to use the Render backend:

**Production API URL**: `https://windowmanagementsystem.onrender.com/api`

**Local Development**: `http://localhost:5000/api` (when running locally)

---

## Configuration

The API URL is set in `src/utils/api.js`:

```javascript
const API_URL = import.meta.env.VITE_API_URL || 'https://windowmanagementsystem.onrender.com/api';
```

---

## Environment Variables

### For Vercel Deployment:

Add this environment variable in Vercel Dashboard:
- **Key**: `VITE_API_URL`
- **Value**: `https://windowmanagementsystem.onrender.com/api`

### For Local Development:

Create `.env.local` file:
```env
VITE_API_URL=http://localhost:5000/api
```

---

## Testing

Test the API connection:
```javascript
// In browser console:
fetch('https://windowmanagementsystem.onrender.com/api/health')
  .then(r => r.json())
  .then(console.log)
```

Expected response:
```json
{
  "status": "OK",
  "message": "Server is running"
}
```

---

## Backend URLs

- **Base URL**: https://windowmanagementsystem.onrender.com
- **API Base**: https://windowmanagementsystem.onrender.com/api
- **Health Check**: https://windowmanagementsystem.onrender.com/api/health

---

## Notes

- The frontend will automatically use the Render URL in production
- For local development, start the backend locally and it will use localhost
- CORS is configured to allow requests from your frontend domain

