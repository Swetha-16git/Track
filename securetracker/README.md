# Secure Tracker - Vehicle Asset Tracking System

A secure web-based vehicle tracking application with Multi-Factor Authentication (MFA).

## Features

- **Multi-Factor Authentication (MFA)**
  - Password-based authentication
  - TOTP (Time-based One-Time Password)
  - SMS OTP
  - Biometric authentication (Face ID, Fingerprint)
  - Active Directory integration

- **Asset Management**
  - Onboard vehicle assets (cars, bikes, trucks)
  - Asset tracking and monitoring
  - Organization-based access control

- **Live Tracking**
  - Real-time location tracking
  - Historical tracking data
  - Interactive map view

- **Role-Based Access Control**
  - Admin, Manager, User roles
  - Organization-based permissions

## Tech Stack

### Backend
- Python (FastAPI)
- JWT Authentication
- SQLite Database

### Frontend
- React 19
- React Router
- Axios
- Leaflet (Maps)

## Project Structure

```
securetracker/
├── api/                    # Python FastAPI backend
│   └── app/
│       ├── config/         # Configuration files
│       ├── database/       # Database layer
│       ├── models/         # Data models
│       ├── routers/        # API routes
│       ├── security/       # Auth & security
│       ├── services/       # Business logic
│       └── utils/          # Utilities
├── reactapp/              # React frontend
│   └── src/
│       ├── components/     # UI components
│       ├── context/       # React Context
│       ├── pages/         # Page components
│       ├── routes/        # Routing
│       └── services/     # API services
└── requirements.txt       # Python dependencies
```

## Setup Instructions

### Prerequisites

- Python 3.8+
- Node.js 18+
- npm or yarn

### Backend Setup

1. Navigate to the project directory:
   ```bash
   cd securetracker
   ```

2. Create a virtual environment:
   ```bash
   python -m venv venv
   ```

3. Activate the virtual environment:
   - Windows: `venv\Scripts\activate`
   - Linux/Mac: `source venv/bin/activate`

4. Install dependencies:
   ```bash
   pip install -r requirements.txt
   ```

5. Run the backend server:
   ```bash
   cd api
   python -m uvicorn app.main:app --reload
   ```

   The API will be available at `http://localhost:8000`

### Frontend Setup

1. Navigate to the React app directory:
   ```bash
   cd securetracker/reactapp
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Start the development server:
   ```bash
   npm start
   ```

   The app will be available at `http://localhost:3000`

## API Endpoints

### Authentication
- `POST /api/v1/auth/login` - User login
- `POST /api/v1/auth/signup` - User registration
- `POST /api/v1/auth/verify-mfa` - Verify MFA code
- `POST /api/v1/auth/logout` - User logout
- `GET /api/v1/auth/me` - Get current user

### Assets
- `GET /api/v1/assets/` - Get all assets
- `POST /api/v1/assets/` - Create new asset
- `GET /api/v1/assets/{id}` - Get asset by ID
- `PUT /api/v1/assets/{id}` - Update asset
- `DELETE /api/v1/assets/{id}` - Delete asset

### Tracking
- `GET /api/v1/tracking/locations` - Get all latest locations
- `GET /api/v1/tracking/asset/{id}` - Get tracking history for asset

## Environment Variables

### Backend (.env)
```
DATABASE_URL=sqlite:///./securetracker.db
SECRET_KEY=your-secret-key
JWT_ALGORITHM=HS256
ACCESS_TOKEN_EXPIRE_MINUTES=30
```

### Frontend (.env)
```
REACT_APP_API_URL=http://localhost:8000/api/v1
```

## Default Users

After initial setup, you can create a user through the signup endpoint or use the default admin credentials (to be configured).

## Security Features

- JWT token-based authentication
- Password hashing with bcrypt
- MFA support for enhanced security
- Role-based access control
- CORS configuration
- Input validation

## License

MIT License

