# Team Task Manager

A full-stack web application for managing team tasks and projects with user authentication, team collaboration, and task tracking.

## 🚀 Live Demo

- **Frontend**: https://team-task-frontend-wk08.onrender.com
- **Backend API**: https://team-task-manager-backend-ja2c.onrender.com

## 📋 Tech Stack

### Frontend
- React + Vite
- Tailwind CSS
- Axios (HTTP client)
- React Context API (state management)
- Passport.js integration for authentication

### Backend
- Node.js + Express
- PostgreSQL
- Passport.js (authentication)
- Express Session (session management)
- Joi (validation)

## 🛠️ Local Setup

### Prerequisites
- Node.js (v18+)
- PostgreSQL
- Git

### Backend Setup

1. **Navigate to backend directory:**
   ```bash
   cd backend
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Set up environment variables:**
   Create a `.env` file in the `backend/` directory:
   ```env
   NODE_ENV=development
   PORT=5000
   DATABASE_URL=postgresql://USERNAME:PASSWORD@localhost:5432/team_task_manager
   SESSION_SECRET=your-long-random-secret-string-here
   CLIENT_URL=http://localhost:5173
   ```

   **To generate a SESSION_SECRET:**
   ```bash
   node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"
   ```

4. **Set up PostgreSQL database:**
   ```bash
   psql -U postgres
   CREATE DATABASE team_task_manager;
   \c team_task_manager
   \i schema.sql
   \q
   ```

5. **Start the backend:**
   ```bash
   npm run dev
   ```
   Backend runs on `http://localhost:5000`

### Frontend Setup

1. **Navigate to frontend directory:**
   ```bash
   cd frontend
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Environment files (already configured):**
   - `.env.local` - Used for local development (points to `http://localhost:5000`)
   - `.env.production` - Used for production builds (points to backend on Render)

4. **Start the development server:**
   ```bash
   npm run dev
   ```
   Frontend runs on `http://localhost:5173`

## 📁 Project Structure

```
team-task-manager/
├── backend/
│   ├── src/
│   │   ├── index.js              # Express app setup
│   │   ├── config/
│   │   │   ├── db.js             # PostgreSQL connection
│   │   │   └── passport.js       # Passport auth config
│   │   ├── middleware/
│   │   │   └── authMiddleware.js # Auth checks
│   │   ├── routes/
│   │   │   ├── auth.js           # Auth endpoints
│   │   │   ├── teams.js          # Team endpoints
│   │   │   └── tasks.js          # Task endpoints
│   │   └── validators/
│   │       ├── authValidator.js
│   │       └── taskValidator.js
│   ├── Dockerfile                # Docker config for Render
│   ├── package.json
│   ├── schema.sql                # Database schema
│   └── .env                      # Environment variables (local)
│
├── frontend/
│   ├── src/
│   │   ├── main.jsx              # React entry point
│   │   ├── App.jsx               # Main component
│   │   ├── api/
│   │   │   └── axiosInstance.js  # Axios config
│   │   ├── context/
│   │   │   └── AuthContext.jsx   # Auth state
│   │   ├── components/
│   │   │   ├── Navbar.jsx
│   │   │   ├── TaskList.jsx
│   │   │   ├── TaskCard.jsx
│   │   │   ├── TaskModal.jsx
│   │   │   ├── TeamsSidebar.jsx
│   │   │   ├── AddMemberModal.jsx
│   │   │   └── ProtectedRoute.jsx
│   │   └── pages/
│   │       ├── LoginPage.jsx
│   │       ├── RegisterPage.jsx
│   │       └── DashboardPage.jsx
│   ├── vite.config.js            # Vite config with dev proxy
│   ├── index.html
│   ├── package.json
│   ├── .env.local                # Dev environment (localhost:5000)
│   └── .env.production           # Prod environment (Render backend)
│
└── README.md
```

## 🔐 Authentication Flow

1. User registers/logs in on the frontend
2. Passport.js validates credentials against PostgreSQL
3. Express session creates a secure, HTTP-only cookie (`connect.sid`)
4. Axios automatically includes the session cookie with all requests (`withCredentials: true`)
5. Backend middleware checks session for protected routes

## 🌐 Deployment on Render

### Frontend (Static Site)
- Connected to GitHub repository
- Automatically deploys on `git push`
- Uses `.env.production` for production API URL
- **Redeploy needed:** Only if changing code or environment variables

### Backend (Web Service)
- Connected to GitHub repository
- Runs on Docker (uses `Dockerfile`)
- Environment variables set in Render dashboard
- **Redeploy needed:** Only if changing code or environment variables

## 📝 Making Changes

### After Code Changes
1. **Push to GitHub:**
   ```bash
   git add .
   git commit -m "Your message"
   git push
   ```

2. **Render will automatically redeploy:**
   - Frontend: Automatically detects changes and rebuilds
   - Backend: Automatically detects changes and rebuilds the Docker image

### After Environment Variable Changes
1. Update environment in Render dashboard
2. Click **Manual Deploy** in Render service settings (no code push needed)

## ⚙️ Environment Variables Reference

### Backend (.env)
| Variable | Description | Example |
|----------|-------------|---------|
| `NODE_ENV` | Development or production | `development` or `production` |
| `PORT` | Server port | `5000` |
| `DATABASE_URL` | PostgreSQL connection string | `postgresql://user:pass@localhost:5432/db` |
| `SESSION_SECRET` | Session encryption secret | Long random string (64+ chars) |
| `CLIENT_URL` | Frontend URL (for CORS) | `http://localhost:5173` |

### Frontend (.env.production)
| Variable | Description | Example |
|----------|-------------|---------|
| `VITE_API_URL` | Backend API URL | `https://team-task-manager-backend-ja2c.onrender.com` |

## 🚀 API Endpoints

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login user
- `POST /api/auth/logout` - Logout user
- `GET /api/auth/me` - Get current user

### Teams
- `GET /api/teams` - List user's teams
- `POST /api/teams` - Create new team
- `PUT /api/teams/:id` - Update team
- `DELETE /api/teams/:id` - Delete team
- `POST /api/teams/:id/members` - Add team member
- `DELETE /api/teams/:id/members/:memberId` - Remove team member

### Tasks
- `GET /api/tasks` - List tasks
- `POST /api/tasks` - Create task
- `PUT /api/tasks/:id` - Update task
- `DELETE /api/tasks/:id` - Delete task

## 🐛 Troubleshooting

### Frontend can't connect to backend
- Check that `VITE_API_URL` is set correctly in Render environment
- Verify backend is running and accessible
- Check CORS settings in backend

### Database connection errors
- Verify `DATABASE_URL` is correct
- Ensure PostgreSQL is running
- Check database exists and schema is initialized

### Session/Cookie issues
- Ensure `withCredentials: true` in axiosInstance.js
- Check `sameSite` and `secure` cookie settings in backend
- Verify `CLIENT_URL` in backend matches frontend domain

## 📦 Building for Production

### Frontend
```bash
cd frontend
npm run build
```
Outputs to `frontend/dist/`

### Backend
Uses Docker (see `backend/Dockerfile`)

## 👥 Contributing

1. Clone the repository
2. Create a feature branch
3. Make changes
4. Test locally
5. Push to GitHub
6. Changes auto-deploy to Render

---

**Happy coding! 🎉**
