# SiteSync — Construction Site Management System

A full stack mobile application for managing construction site operations including worker management, project tracking, equipment inventory, daily reports, incident reporting and site announcements.


---

## Tech Stack

| Layer | Technology |
|---|---|
| Mobile Frontend | React Native (Expo) |
| Backend | Node.js + Express.js |
| Database | MongoDB Atlas |
| Authentication | JWT + bcryptjs |
| File Storage | Cloudinary |
| Hosting | Azure |

---

## Team & Modules

| Member | Module | Branch |
|---|---|---|
| Group | User Authentication & Management | `auth` |
| Member 1 | Worker Management | `workers` |
| Member 2 | Project Management | `projects` |
| Member 3 | Equipment Management | `equipment` |
| Member 4 | Daily Site Reports | `reports` |
| Member 5 | Incident Management | `incidents` |
| Member 6 | Notice Board | `notices` |

---

## Project Structure

```
SiteSync/
├── backend/
│   ├── config/
│   │   └── db.js
│   ├── controllers/
│   │   ├── authController.js
│   │   ├── workerController.js
│   │   ├── projectController.js
│   │   ├── equipmentController.js
│   │   ├── reportController.js
│   │   ├── incidentController.js
│   │   └── noticeController.js
│   ├── middleware/
│   │   ├── authMiddleware.js
│   │   └── uploadMiddleware.js
│   ├── models/
│   │   ├── User.js
│   │   ├── Worker.js
│   │   ├── Project.js
│   │   ├── Equipment.js
│   │   ├── Report.js
│   │   ├── Incident.js
│   │   └── Notice.js
│   ├── routes/
│   │   ├── authRoutes.js
│   │   ├── workerRoutes.js
│   │   ├── projectRoutes.js
│   │   ├── equipmentRoutes.js
│   │   ├── reportRoutes.js
│   │   ├── incidentRoutes.js
│   │   └── noticeRoutes.js
│   ├── server.js
│   └── .env
└── frontend/
    ├── navigation/
    │   └── AppNavigator.js
    ├── screens/
    │   ├── auth/
    │   │   ├── LoginScreen.js
    │   │   └── RegisterScreen.js
    │   ├── workers/
    │   │   ├── WorkerListScreen.js
    │   │   └── WorkerFormScreen.js
    │   ├── projects/
    │   ├── equipment/
    │   ├── reports/
    │   ├── incidents/
    │   └── notices/
    ├── services/
    │   └── api.js
    └── App.js
```

---

## Getting Started

### Prerequisites

- Node.js (LTS version)
- Expo Go app on your phone
- MongoDB Atlas account
- Cloudinary account

### 1. Clone the repository

```bash
git clone https://github.com/yourusername/SiteSync.git
cd SiteSync
```

### 2. Backend setup

```bash
cd backend
npm install
```

Create a `.env` file inside the `backend` folder:

```
MONGO_URI=your_mongodb_atlas_connection_string
JWT_SECRET=your_jwt_secret_key
CLOUDINARY_NAME=your_cloudinary_name
CLOUDINARY_API_KEY=your_cloudinary_api_key
CLOUDINARY_API_SECRET=your_cloudinary_api_secret
PORT=5000
```

Start the backend:

```bash
npm run dev
```

You should see:
```
Server running on port 5000
MongoDB connected: ...
```

### 3. Frontend setup

```bash
cd frontend
npm install
```

Open `frontend/services/api.js` and update the base URL with your computer's local IP address:

```javascript
const api = axios.create({
  baseURL: 'http://YOUR_LOCAL_IP:5000/api'
})
```

To find your IP on Windows run `ipconfig` and look for IPv4 Address under Wi-Fi.

Start the frontend:

```bash
npx expo start
```

Scan the QR code with **Expo Go** on your phone.

---

## API Endpoints

### Authentication
| Method | Endpoint | Protected | Description |
|---|---|---|---|
| POST | /api/auth/register | No | Register new user |
| POST | /api/auth/login | No | Login and get JWT token |
| GET | /api/auth/profile | Yes | Get own profile |
| PUT | /api/auth/profile | Yes | Update own profile |

### Workers
| Method | Endpoint | Protected | Description |
|---|---|---|---|
| POST | /api/workers | Yes | Add worker |
| GET | /api/workers | Yes | Get all workers |
| GET | /api/workers/:id | Yes | Get one worker |
| PUT | /api/workers/:id | Yes | Update worker |
| DELETE | /api/workers/:id | Yes | Delete worker |

### Projects
| Method | Endpoint | Protected | Description |
|---|---|---|---|
| POST | /api/projects | Yes | Create project |
| GET | /api/projects | Yes | Get all projects |
| GET | /api/projects/:id | Yes | Get one project |
| PUT | /api/projects/:id | Yes | Update project |
| DELETE | /api/projects/:id | Yes | Delete project |

### Equipment
| Method | Endpoint | Protected | Description |
|---|---|---|---|
| POST | /api/equipment | Yes | Add equipment |
| GET | /api/equipment | Yes | Get all equipment |
| GET | /api/equipment/:id | Yes | Get one item |
| PUT | /api/equipment/:id | Yes | Update item |
| DELETE | /api/equipment/:id | Yes | Delete item |

### Reports
| Method | Endpoint | Protected | Description |
|---|---|---|---|
| POST | /api/reports | Yes | Submit report |
| GET | /api/reports | Yes | Get all reports |
| GET | /api/reports/:id | Yes | Get one report |
| PUT | /api/reports/:id | Yes | Update report |
| DELETE | /api/reports/:id | Yes | Delete report |

### Incidents
| Method | Endpoint | Protected | Description |
|---|---|---|---|
| POST | /api/incidents | Yes | Report incident |
| GET | /api/incidents | Yes | Get all incidents |
| GET | /api/incidents/:id | Yes | Get one incident |
| PUT | /api/incidents/:id | Yes | Update incident |
| DELETE | /api/incidents/:id | Yes | Delete incident |

### Notices
| Method | Endpoint | Protected | Description |
|---|---|---|---|
| POST | /api/notices | Yes | Post notice |
| GET | /api/notices | Yes | Get all notices |
| GET | /api/notices/:id | Yes | Get one notice |
| PUT | /api/notices/:id | Yes | Update notice |
| DELETE | /api/notices/:id | Yes | Delete notice |

---

## User Roles

| Role | Access |
|---|---|
| Admin | Full access to all modules |
| Worker | View only on most modules |

---

## Git Workflow

Each member works on their own branch and never pushes directly to `main`.

```bash
# Switch to your branch
git checkout workers

# After making changes
git add .
git commit -m "your message here"
git push origin workers
```

Only merge to `main` at the end of each week after testing.

---

## Environment Variables

| Variable | Description |
|---|---|
| MONGO_URI | MongoDB Atlas connection string |
| JWT_SECRET | Secret key for JWT token signing |
| CLOUDINARY_NAME | Cloudinary cloud name |
| CLOUDINARY_API_KEY | Cloudinary API key |
| CLOUDINARY_API_SECRET | Cloudinary API secret |
| PORT | Backend port (default 5000) |

Never commit the `.env` file to GitHub. It is listed in `.gitignore`.

---


