# Deployment Guide - Render

This guide explains how to deploy the e-commerce backend API to Render.

## Prerequisites
- GitHub account with the backend repository pushed
- Render account (https://render.com)
- Supabase project with database configured

## Step 1: Prepare Your Repository

1. Create a `.gitignore` file if not exists:
```
node_modules/
.env
.env.local
.DS_Store
*.log
```

2. Ensure `package.json` has correct start script:
```json
"scripts": {
  "start": "node server.js",
  "dev": "nodemon server.js"
}
```

3. Commit and push to GitHub:
```bash
git add .
git commit -m "Initial commit: e-commerce backend"
git push origin main
```

## Step 2: Create Render Web Service

1. Log in to [Render Dashboard](https://dashboard.render.com)
2. Click **"New +"** → **"Web Service"**
3. Connect your GitHub repository
4. Select the backend repository

## Step 3: Configure Deployment Settings

**Basic Information:**
- **Name**: `ecommerce-backend` (or your preferred name)
- **Environment**: Node
- **Region**: Select closest to your users (e.g., us-east-1)
- **Branch**: main
- **Build Command**: `npm install`
- **Start Command**: `npm start`

**Advanced Settings:**
- **Instance Type**: Free or Starter (depending on traffic)
- **Auto-Deploy**: Enable (automatically redeploy on git push)

## Step 4: Set Environment Variables

1. In Render dashboard, go to your Web Service
2. Click **"Environment"** tab
3. Add the following environment variables:

```
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_KEY=your-anon-key-here
SUPABASE_SERVICE_KEY=your-service-role-key-here
JWT_SECRET=your-very-secret-key-change-this-in-production
PORT=3000
NODE_ENV=production
FRONTEND_URL=https://your-frontend-domain.com
```

**⚠️ IMPORTANT**: 
- Never commit `.env` to GitHub
- Use strong, unique JWT_SECRET for production
- Replace FRONTEND_URL with your actual frontend URL

## Step 5: Deploy

1. Click **"Deploy"** button
2. Monitor the deployment logs
3. Once deployed, you'll see your service URL (e.g., `https://ecommerce-backend.onrender.com`)

## Step 6: Verify Deployment

Test your API with the health check endpoint:
```bash
curl https://your-service-name.onrender.com/api/health
```

Expected response:
```json
{
  "success": true,
  "message": "Server is running",
  "data": null
}
```

## Step 7: Update Frontend Configuration

In your frontend application, update the API base URL:
```javascript
// Example in React
const API_BASE_URL = 'https://your-service-name.onrender.com/api';

// Use it in fetch calls
fetch(`${API_BASE_URL}/products`)
```

## Post-Deployment Checklist

- [ ] Environment variables are securely set
- [ ] FRONTEND_URL matches your frontend domain
- [ ] Database schema is created in Supabase
- [ ] Health check endpoint returns 200 OK
- [ ] Can successfully register a new user
- [ ] Can successfully login and receive JWT token
- [ ] CORS is working (frontend can make requests)
- [ ] All API endpoints are responding correctly

## Troubleshooting

### Service won't deploy
- Check build logs for errors
- Ensure `package.json` exists and is valid
- Verify all dependencies are specified
- Check if start command is correct

### Environment variables not loading
- Ensure variables are set in Render dashboard (not in .env file)
- Redeploy after adding variables
- Check that no extra spaces are in variable values

### Database connection errors
- Verify Supabase URL and keys are correct
- Ensure Supabase database schema is created
- Check that IP whitelist allows Render's IP (usually unrestricted in development)

### CORS errors from frontend
- Update FRONTEND_URL environment variable
- Ensure server.js has correct CORS configuration
- Redeploy after changing CORS settings

### JWT token errors
- Ensure JWT_SECRET is set and same across all instances
- Check token expiration (24 hours by default)
- Verify token is sent with `Authorization: Bearer <token>` header

## Monitoring

1. In Render dashboard, monitor:
   - **Metrics**: CPU, Memory, Network usage
   - **Logs**: Real-time application logs
   - **Events**: Deployment history

2. Set up alerts for:
   - Failed deployments
   - High resource usage
   - Service crashes

## Scaling

If you need to upgrade from Free tier:
1. Go to your service settings
2. Change **Instance Type** to Starter or higher
3. Render will automatically handle the upgrade

## Useful Links

- [Render Documentation](https://render.com/docs)
- [Supabase Documentation](https://supabase.io/docs)
- [Express.js Documentation](https://expressjs.com/)
- [Environment Variables in Render](https://render.com/docs/environment-variables)

## Support

If you encounter issues:
1. Check Render's service status
2. Review deployment logs in Render dashboard
3. Check Supabase status and logs
4. Verify all environment variables are correct
