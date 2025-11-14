# Window Management System - Backend API

## Setup Instructions

1. **Install Dependencies**
```bash
npm install
```

2. **Configure Environment Variables**
Create a `.env` file in the backend directory with:
```
PORT=5000
NODE_ENV=development
MONGODB_URI=your-mongodb-connection-string
JWT_SECRET=your-secret-key
JWT_EXPIRE=7d
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=your-email@gmail.com
EMAIL_PASS=your-app-password
PAYPAL_MODE=sandbox
PAYPAL_CLIENT_ID=your-paypal-client-id
PAYPAL_CLIENT_SECRET=your-paypal-client-secret
FRONTEND_URL=http://localhost:5173
ADMIN_EMAIL=admin@windowmanagement.com
ADMIN_PASSWORD=admin123
```

3. **Create Admin User**
Run this once to create admin user:
```bash
node scripts/createAdmin.js
```

4. **Start Server**
```bash
# Development
npm run dev

# Production
npm start
```

## API Endpoints

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/verify-email` - Verify email with OTP
- `POST /api/auth/request-login-otp` - Request login OTP
- `POST /api/auth/login` - Login with OTP
- `POST /api/auth/logout` - Logout
- `GET /api/auth/me` - Get current user

### Subscription
- `GET /api/subscription/plans` - Get subscription plans
- `GET /api/subscription/current` - Get current subscription
- `POST /api/subscription/create-payment` - Create PayPal payment
- `POST /api/subscription/execute-payment` - Execute payment
- `POST /api/subscription/cancel` - Cancel subscription

### Settings
- `GET /api/settings` - Get user settings
- `PUT /api/settings` - Update user settings

### Windows
- `GET /api/windows` - Get all windows
- `POST /api/windows` - Create window
- `PUT /api/windows/:id` - Update window
- `DELETE /api/windows/:id` - Delete window

### Admin
- `GET /api/admin/users` - Get all users
- `GET /api/admin/users/:id` - Get user details
- `PUT /api/admin/users/:id` - Update user
- `DELETE /api/admin/users/:id` - Delete user
- `GET /api/admin/stats` - Get dashboard stats
- `GET /api/admin/subscriptions` - Get all subscriptions

## Deployment on Render

1. Connect your GitHub repository
2. Set environment variables in Render dashboard
3. Build command: `npm install`
4. Start command: `npm start`
5. Add MongoDB connection string to environment variables

