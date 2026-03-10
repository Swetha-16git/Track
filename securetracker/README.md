# Secure Tracker API

A secure vehicle tracking application with Multi-Factor Authentication (MFA).

## Features

- **Multi-Factor Authentication (MFA)**
  - TOTP (Time-based OTP)
  - SMS OTP
  - Email OTP
  - Face ID
  - Fingerprint (Biometric)
  - Active Directory Integration

- **Vehicle Asset Management**
  - Asset onboarding (cars, bikes, trucks, etc.)
  - Organization-based access control
  - Real-time tracking

- **RESTful API**
  - JWT-based authentication
  - Role-based access control
  - PostgreSQL database

## Requirements

- Python 3.9+
- PostgreSQL 14+
- Node.js 18+ (for React frontend)

## Setup

### 1. Database Setup

Create a PostgreSQL database:

```sql
CREATE DATABASE securetracker;
```

### 2. Environment Variables

Copy `.env.example` to `.env` and update the values:

```bash
cp .env.example .env
```

Required environment variables:
- `DATABASE_URL` - PostgreSQL connection string
- `SECRET_KEY` - JWT secret key (min 32 characters)

### 3. Install Python Dependencies

```bash
cd securetracker
pip install -r requirements.txt
```

### 4. Initialize Database

```bash
python -c "from app.database.db_connection import init_db; init_db()"
```

### 5. Run the API Server

```bash
cd securetracker/api
uvicorn app.main:app --host 0.0.0.0 --port 8000 --reload
```

The API will be available at `http://localhost:8000`

### 6. API Documentation

FastAPI provides automatic API documentation:
- Swagger UI: `http://localhost:8000/docs`
- ReDoc: `http://localhost:8000/redoc`

## API Endpoints

### Authentication
- `POST /auth/login` - Login with credentials
- `POST /auth/refresh` - Refresh access token
- `POST /auth/mfa/init` - Initialize MFA
- `POST /auth/mfa/verify` - Verify MFA code
- `POST /auth/mfa/send` - Send MFA code
- `POST /auth/logout` - Logout
- `POST /auth/password/change` - Change password

### Users
- `GET /users/` - Get all users
- `GET /users/{user_id}` - Get user by ID
- `POST /users/` - Create user
- `PUT /users/{user_id}` - Update user
- `DELETE /users/{user_id}` - Delete user
- `GET /users/me` - Get current user

### Assets
- `GET /assets/` - Get all assets
- `GET /assets/{asset_id}` - Get asset by ID
- `POST /assets/` - Create asset
- `PUT /assets/{asset_id}` - Update asset
- `DELETE /assets/{asset_id}` - Delete asset

### Tracking
- `GET /tracking/asset/{asset_id}` - Get tracking data
- `GET /tracking/asset/{asset_id}/latest` - Get latest tracking
- `POST /tracking/` - Create tracking data
- `GET /tracking/history/{asset_id}` - Get tracking history

### Roles
- `GET /roles/` - Get available roles
- `GET /roles/permissions` - Get available permissions
- `GET /roles/user/{user_id}` - Get user's role
- `PUT /roles/user/{user_id}` - Update user's role

## MFA Configuration

### TOTP (Google Authenticator, Authy)
1. Call `POST /auth/mfa/init` with `mfa_type: "totp"`
2. Scan the QR code with your authenticator app
3. Call `POST /auth/mfa/verify` with the code

### SMS OTP
1. Call `POST /auth/mfa/init` with `mfa_type: "sms"` and phone number
2. Call `POST /auth/mfa/verify` with the received code

### Email OTP
1. Call `POST /auth/mfa/init` with `mfa_type: "email"`
2. Call `POST /auth/mfa/verify` with the received code

## Project Structure

```
securetracker/
├── api/
│   └── app/
│       ├── config/         # Configuration
│       ├── database/        # Database operations
│       ├── models/          # SQLAlchemy models
│       ├── routers/         # API endpoints
│       ├── security/        # Auth & security
│       ├── services/        # Business logic
│       └── utils/           # Utilities
├── reactapp/               # React frontend
├── requirements.txt       # Python dependencies
└── .env.example           # Environment template
```

## License

MIT
