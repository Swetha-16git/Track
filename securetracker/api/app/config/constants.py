"""
Application Constants
"""

# App Info
APP_NAME = "Secure Tracker"
APP_VERSION = "1.0.0"
API_PREFIX = "/api/v1"

# User Roles
ROLE_ADMIN = "admin"
ROLE_MANAGER = "manager"
ROLE_USER = "user"
ROLE_VIEWER = "viewer"

# MFA Methods
MFA_METHOD_PASSWORD = "password"
MFA_METHOD_TOTP = "totp"
MFA_METHOD_SMS = "sms"
MFA_METHOD_EMAIL = "email"
MFA_METHOD_FINGERPRINT = "fingerprint"
MFA_METHOD_FACEID = "faceid"
MFA_METHOD_AD = "active_directory"

# Asset Types
ASSET_TYPE_CAR = "car"
ASSET_TYPE_BIKE = "bike"
ASSET_TYPE_TRUCK = "truck"
ASSET_TYPE_MOTORCYCLE = "motorcycle"
ASSET_TYPE_OTHER = "other"

# Asset Status
ASSET_STATUS_ACTIVE = "active"
ASSET_STATUS_INACTIVE = "inactive"
ASSET_STATUS_MAINTENANCE = "maintenance"
ASSET_STATUS_STOLEN = "stolen"

# Tracking Status
TRACKING_STATUS_ONLINE = "online"
TRACKING_STATUS_OFFLINE = "offline"
TRACKING_STATUS_IDLE = "idle"

# API Messages
MSG_LOGIN_SUCCESS = "Login successful"
MSG_LOGIN_FAILED = "Invalid credentials"
MSG_MFA_REQUIRED = "MFA verification required"
MSG_MFA_SUCCESS = "MFA verification successful"
MSG_MFA_FAILED = "MFA verification failed"
MSG_TOKEN_EXPIRED = "Token has expired"
MSG_TOKEN_INVALID = "Invalid token"
MSG_ACCESS_DENIED = "Access denied"
MSG_USER_CREATED = "User created successfully"
MSG_USER_UPDATED = "User updated successfully"
MSG_USER_DELETED = "User deleted successfully"
MSG_ASSET_CREATED = "Asset created successfully"
MSG_ASSET_UPDATED = "Asset updated successfully"
MSG_ASSET_DELETED = "Asset deleted successfully"

# Pagination
DEFAULT_PAGE_SIZE = 20
MAX_PAGE_SIZE = 100

# Password Requirements
PASSWORD_MIN_LENGTH = 8
PASSWORD_MAX_LENGTH = 128

