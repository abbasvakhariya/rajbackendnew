# Windows Management System - Backend API

## 🚀 Deployment URLs

- **Frontend**: https://windowsmangement.vercel.app/
- **Backend**: https://rajwindow.onrender.com
- **API Base URL**: https://rajwindow.onrender.com/api

## 📋 Environment Variables Required

Set these in your Render dashboard (Environment tab):

```
MONGODB_URI=mongodb+srv://abbas:abbas123@abbas.tdhnt9r.mongodb.net/windows-management-system?retryWrites=true&w=majority&appName=abbas
JWT_SECRET=your-super-secret-jwt-key-change-this-in-production
JWT_EXPIRE=7d
PORT=5000
NODE_ENV=production
FRONTEND_URL=https://windowsmangement.vercel.app
```

## 🔧 Setup Instructions

1. **Install Dependencies**
```bash
npm install
```

2. **Configure Environment Variables**
   - For local: Create `.env` file (see `.env.example`)
   - For Render: Set in Render dashboard → Environment tab

3. **Start Server**
```bash
# Development
npm run dev

# Production
npm start
```

## 📡 API Endpoints

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login with email and password
- `POST /api/auth/logout` - Logout
- `GET /api/auth/me` - Get current user

### Customers
- `GET /api/customers` - Get all customers
- `POST /api/customers` - Create customer
- `PUT /api/customers/:id` - Update customer
- `DELETE /api/customers/:id` - Delete customer

### Products
- `GET /api/products` - Get all products
- `POST /api/products` - Create product
- `PUT /api/products/:id` - Update product
- `DELETE /api/products/:id` - Delete product

### Rates & Settings
- `GET /api/rates` - Get rate configuration
- `PUT /api/rates` - Update rate configuration
- `GET /api/tool-settings` - Get tool settings
- `PUT /api/tool-settings` - Update tool settings
- `GET /api/settings` - Get user settings
- `PUT /api/settings` - Update user settings

### Windows
- `GET /api/windows` - Get all windows
- `POST /api/windows` - Create window
- `PUT /api/windows/:id` - Update window
- `DELETE /api/windows/:id` - Delete window

### Admin
- `GET /api/admin/stats` - Get dashboard stats
- `GET /api/admin/users` - Get all users
- `GET /api/admin/users/:id` - Get user details
- `PUT /api/admin/users/:id` - Update user
- `DELETE /api/admin/users/:id` - Delete user

## 🔐 Admin Setup

To create admin user with lifetime access:
```bash
npm run setup-admin
```

This will set `abbasvakhariya00@gmail.com` as admin with lifetime subscription.

## 🌐 CORS Configuration

The backend is configured to allow requests from:
- `https://windowsmangement.vercel.app` (Production)
- `http://localhost:5173` (Local development)
- `http://localhost:5174` (Local development)

## 📚 Documentation

See `DEPLOYMENT.md` for detailed deployment instructions.
