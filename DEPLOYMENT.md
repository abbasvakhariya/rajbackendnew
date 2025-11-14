# Backend Deployment Guide (Render)

## Current Deployment
- **URL**: https://rajwindow.onrender.com
- **Repository**: https://github.com/abbasvakhariya/rajbackendnew

## Render Setup Instructions

### 1. Create New Web Service
1. Go to https://render.com
2. Click "New +" → "Web Service"
3. Connect your GitHub repository: `abbasvakhariya/rajbackendnew`
4. Select the repository

### 2. Configure Service
- **Name**: `rajwindow` (or your preferred name)
- **Environment**: `Node`
- **Region**: Choose closest to your users
- **Branch**: `main`
- **Root Directory**: (leave empty)
- **Build Command**: `npm install`
- **Start Command**: `npm start`

### 3. Environment Variables
Add these in Render dashboard → Environment tab:

```
MONGODB_URI=mongodb+srv://abbas:abbas123@abbas.tdhnt9r.mongodb.net/windows-management-system?retryWrites=true&w=majority&appName=abbas
JWT_SECRET=your-super-secret-jwt-key-change-this-in-production
JWT_EXPIRE=7d
PORT=5000
NODE_ENV=production
```

### 4. MongoDB Atlas Configuration
1. Go to MongoDB Atlas → Network Access
2. Add IP Address: `0.0.0.0/0` (allows all IPs) OR add Render's IP ranges
3. Wait 1-2 minutes for changes to propagate

### 5. Deploy
1. Click "Create Web Service"
2. Render will automatically build and deploy
3. Wait for deployment to complete
4. Your API will be available at: `https://rajwindow.onrender.com`

## API Endpoints

- **Health Check**: `https://rajwindow.onrender.com/api/health`
- **Auth**: `https://rajwindow.onrender.com/api/auth/*`
- **Users**: `https://rajwindow.onrender.com/api/users/*`
- **Customers**: `https://rajwindow.onrender.com/api/customers/*`
- **Products**: `https://rajwindow.onrender.com/api/products/*`
- And more...

## Important Notes

### Free Tier Limitations
- Service sleeps after 15 minutes of inactivity
- First request after sleep takes 30-60 seconds
- Consider upgrading for production use

### CORS Configuration
The backend is configured to allow requests from:
- `https://windowsmangement.vercel.app`
- `http://localhost:5173` (local development)
- `http://localhost:5174` (local development)

### Monitoring
- Check Render dashboard for logs
- Monitor service health
- Set up alerts for downtime

## Troubleshooting

### Service won't start
- Check build logs in Render dashboard
- Verify all environment variables are set
- Ensure `package.json` has correct start script

### MongoDB connection fails
- Verify IP whitelist in MongoDB Atlas
- Check connection string format
- Ensure MongoDB cluster is running

### CORS errors
- Verify frontend URL is in CORS whitelist
- Check browser console for specific errors
- Ensure credentials are handled correctly

