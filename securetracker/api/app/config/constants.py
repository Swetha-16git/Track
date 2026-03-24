"""
Application Constants
"""

# App Info
APP_NAME = "Secure Tracker"
APP_VERSION = "1.0.0"
API_PREFIX = "/api/v1"

# User Roles
ROLE_ADMIN = "admin"
ROLE_VIEWER = "viewer"

# MFA Methods
MFA_METHOD_PASSWORD = "password"
MFA_METHOD_TOTP = "totp"
MFA_METHOD_SMS = "sms"
MFA_METHOD_EMAIL = "email"
MFA_METHOD_FINGERPRINT = "fingerprint"
MFA_METHOD_FACEID = "faceid"
MFA_METHOD_AD = "active_directory"

# Construction Asset Types
ASSET_TYPE_EXCAVATOR = "excavator"
ASSET_TYPE_BACKHOE_LOADER = "backhoe_loader"
ASSET_TYPE_BULLDOZER = "bulldozer"
ASSET_TYPE_WHEEL_LOADER = "wheel_loader"
ASSET_TYPE_DUMP_TRUCK = "dump_truck"
ASSET_TYPE_CONCRETE_MIXER = "concrete_mixer"
ASSET_TYPE_TOWER_CRANE = "tower_crane"
ASSET_TYPE_MOBILE_CRANE = "mobile_crane"
ASSET_TYPE_CRAWLER_CRANE = "crawler_crane"
ASSET_TYPE_FORKLIFT = "forklift"
ASSET_TYPE_GRADER = "grader"
ASSET_TYPE_ROLLER = "roller"
ASSET_TYPE_PAVER = "paver"
ASSET_TYPE_COMPACTOR = "compactor"
ASSET_TYPE_TELEHANDLER = "telehandler"
ASSET_TYPE_OTHER = "other"

# Status (keep as is)
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

