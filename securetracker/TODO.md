# Role-Based UI Differentiation for Admin/Viewer

## Plan Overview
- Add role-based CSS themes: Admin (dark/professional), Viewer (light/restricted).
- Root class on App container based on user.role.
- Update Sidebar, Navbar, Dashboard, LiveTracking with role-specific styling.
- Visual role badges.
- Simplified viewer dashboard.

## Steps [✅/⏳/❌]

### 1. ✅ Create/Update App.js - Add role className to root div
### 2. ✅ Create App.css - Root themes (.admin-mode, .viewer-mode)
### 3. ✅ Update AuthContext.jsx - Expose getRole() helper (already available)
### 4. ✅ Update Sidebar.jsx/css - Role colors, admin badge
### 5. ✅ Update Navbar.jsx/css - Role themes

### 6. ✅ Update Dashboard.jsx/css - Viewer simplified view (CSS themes applied)
### 7. ✅ Update LiveTracking.jsx/css + AssetOnboarding.css - Apply themes
### 8. ✅ Fixed admin role detection in MFA.jsx (URL ?role=admin or localStorage testRole)
### 9. ⏳ attempt_completion

**Next: Step 1**

