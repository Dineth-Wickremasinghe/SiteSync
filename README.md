# SiteSync — Construction Site Management System

A full-stack mobile application for managing construction site operations, built as a group assignment for **SE2020 Web and Mobile Technologies** (Year 2, Semester 2, 2026) at SLIIT.

---

## Team

| Member | Module |
|---|---|
| All members | User Management & Authentication |
| Member 1 | Worker Management |
| Member 2 | Project Management |
| Member 3 | Equipment Management |
| Member 4 | Daily Site Reports |
| Member 5 | Incident Management |
| Member 6 | Notice Board |

---

## Tech Stack

**Frontend**
- React Native (Expo)
- React Navigation (Native Stack + Bottom Tabs)
- Axios

**Backend**
- Node.js + Express.js
- MongoDB Atlas
- Cloudinary (file/image storage)
- JWT Authentication
- Multer + multer-storage-cloudinary

**Deployment**
- Backend: Microsoft Azure App Service
- Database: MongoDB Atlas

---

## Project Structure

```
SiteSync/
├── backend/
│   ├── config/
│   │   └── db.js
│   ├── controllers/
│   ├── middleware/
│   │   ├── authMiddleware.js
│   │   └── uploadMiddleware.js
│   ├── models/
│   ├── routes/
│   ├── server.js
│   └── package.json
└── frontend/
    ├── navigation/
    │   └── AppNavigator.js
    ├── screens/
    │   ├── auth/
    │   ├── workers/
    │   ├── projects/
    │   ├── equipment/
    │   ├── reports/
    │   ├── incidents/
    │   ├── notices/
    │   └── ProfileScreen.js
    ├── services/
    │   └── api.js
    ├── App.js
    └── package.json
```

---

## Modules

### Authentication
- Register and login with JWT tokens
- Passwords hashed with bcrypt
- Role-based access: Admin, Supervisor, Worker
- `protect` middleware verifies JWT on protected routes
- `authorizeRoles` middleware checks user role

### Worker Management
- Full CRUD for site workers
- Fields: name, phone, trade, status, ID photo
- Trades: Mason, Electrician, Plumber, General
- Status: Active / Inactive

### Project Management
- Full CRUD for construction projects
- Fields: project name, location, client name, status, blueprint image
- Status: Active / On Hold / Completed
- Shows creator name via `populate('createdBy')`
- Detail screen with full project info

### Equipment Management
- Full CRUD for site equipment
- Fields: name, type, condition, quantity, equipment image
- Types: Heavy / Tool / Material
- Condition: Good / Fair / Poor

### Daily Site Reports
- Full CRUD for daily reports
- Fields: project name, report date, work done, worker count, report photo

### Incident Management
- Full CRUD for site incidents
- Fields: title, description, severity, status, incident photo
- Severity: Low / Medium / High
- Status: Open / Resolved

### Notice Board
- Full CRUD for site notices
- Fields: title, message, category, posted by, notice image
- Categories: Safety / Schedule / General

---

## API Endpoints

All routes are prefixed with `/api`.

| Method | Endpoint | Description | Auth |
|---|---|---|---|
| POST | `/auth/register` | Register new user | No |
| POST | `/auth/login` | Login and get token | No |
| GET | `/auth/profile` | Get current user profile | Yes |
| GET | `/workers` | Get all workers | Yes |
| POST | `/workers` | Add new worker | Yes |
| PUT | `/workers/:id` | Update worker | Yes |
| DELETE | `/workers/:id` | Delete worker | Yes |
| GET | `/projects` | Get all projects | Yes |
| POST | `/projects` | Create project | Yes |
| GET | `/projects/:id` | Get project by ID | Yes |
| PUT | `/projects/:id` | Update project | Yes |
| DELETE | `/projects/:id` | Delete project | Yes |
| GET | `/equipment` | Get all equipment | Yes |
| POST | `/equipment` | Add equipment | Yes |
| PUT | `/equipment/:id` | Update equipment | Yes |
| DELETE | `/equipment/:id` | Delete equipment | Yes |
| GET | `/reports` | Get all reports | Yes |
| POST | `/reports` | Create report | Yes |
| PUT | `/reports/:id` | Update report | Yes |
| DELETE | `/reports/:id` | Delete report | Yes |
| GET | `/incidents` | Get all incidents | Yes |
| POST | `/incidents` | Report incident | Yes |
| PUT | `/incidents/:id` | Update incident | Yes |
| DELETE | `/incidents/:id` | Delete incident | Yes |
| GET | `/notices` | Get all notices | Yes |
| POST | `/notices` | Post notice | Yes |
| PUT | `/notices/:id` | Update notice | Yes |
| DELETE | `/notices/:id` | Delete notice | Yes |

---

## Getting Started

### Prerequisites
- Node.js 22+
- Expo CLI
- MongoDB Atlas account
- Cloudinary account

### Backend Setup

1. Clone the repository
```bash
git clone https://github.com/your-username/SiteSync.git
cd SiteSync/backend
```

2. Install dependencies
```bash
npm install
```

3. Create a `.env` file in the `backend` folder
```
MONGODB_URI=your_mongodb_atlas_connection_string
JWT_SECRET=your_jwt_secret
CLOUDINARY_CLOUD_NAME=your_cloudinary_cloud_name
CLOUDINARY_API_KEY=your_cloudinary_api_key
CLOUDINARY_API_SECRET=your_cloudinary_api_secret
PORT=5000
```

4. Start the backend server
```bash
npm start
```

The server runs on `http://localhost:5000`

### Frontend Setup

1. Navigate to the frontend folder
```bash
cd SiteSync/frontend
```

2. Install dependencies
```bash
npm install
```

3. Update the base URL in `services/api.js`
```javascript
baseURL: 'http://YOUR_LOCAL_IP:5000/api'
```
> Use your machine's local IP address (e.g. `192.168.1.x`), not `localhost`, so the app can connect from a physical device or emulator.

4. Start Expo
```bash
npx expo start
```

---

## Environment Variables

Never commit your `.env` file to GitHub. Each team member must create their own `.env` file locally using the variables listed above.

If you are connecting from a different machine, make sure your IP address is whitelisted in MongoDB Atlas under **Network Access**. For development, setting it to `0.0.0.0/0` (Allow Access from Anywhere) is recommended.

---

## Branches

| Branch | Purpose |
|---|---|
| `main` | Stable integrated code |
| `auth` | Authentication module |
| `workers` | Worker management module |
| `projects` | Project management module |
| `equipment` | Equipment management module |
| `reports` | Daily site reports module |
| `incidents` | Incident management module |
| `notices` | Notice board module |

---

## Deployment

The backend is deployed on **Microsoft Azure App Service**.

Live API base URL:
```
https://your-azure-app.azurewebsites.net/api
```

Deployments are triggered automatically via GitHub Actions on every push to the `main` branch.

---
