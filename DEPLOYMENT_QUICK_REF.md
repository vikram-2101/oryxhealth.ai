# 🚀 Quick Deployment Reference

## Backend (Render)
1. Go to https://dashboard.render.com/
2. New + → Web Service
3. Connect GitHub repo: `vikram-2101/oryxhealth.ai`
4. Settings:
   - Root Directory: `backend`
   - Build: `npm install`
   - Start: `npm start`
5. Environment Variables:
   ```
   MONGODB_URI=mongodb+srv://vk8969338090_db_user:wO1UhBrlbjaWIYLW@cluster0.b8glit3.mongodb.net/oxyhealth?retryWrites=true&w=majority&appName=Cluster0
   JWT_SECRET=oxyhealth-super-secret-jwt-key-change-in-production-2024
   NODE_ENV=production
   PORT=5000
   ```
6. Deploy → Wait 5-10 min
7. Copy your backend URL: `https://your-app.onrender.com`
8. Seed database: Shell → `npm run seed`

## Frontend (Vercel)
1. Go to https://vercel.com/dashboard
2. Add New → Project
3. Import: `vikram-2101/oryxhealth.ai`
4. Settings:
   - Framework: Vite
   - Root Directory: `frontend`
   - Build: `npm run build`
   - Output: `dist`
5. Environment Variable:
   ```
   VITE_API_URL=https://your-backend-url.onrender.com/api
   ```
6. Deploy → Wait 2-5 min
7. Your app: `https://your-app.vercel.app`

## MongoDB Atlas
1. Network Access → Add IP → Allow from Anywhere (0.0.0.0/0)
2. Database Access → Verify user exists
3. Connection string includes database name: `/oxyhealth?`

## Test
- Backend: `https://your-backend.onrender.com/api/health`
- Frontend: Login with `admin@oxyhealth.ai` / `admin123`

## Important
- Update `VITE_API_URL` in Vercel after backend is deployed
- Change JWT_SECRET to something more secure
- Redeploy frontend after updating env vars
