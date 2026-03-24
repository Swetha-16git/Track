# Role-Based Dashboards After MFA - Implementation Steps

## Approved Plan Summary
- **Admin**: `/admin-dashboard` → Asset Onboarding (full CRUD), Live Tracking, Reports
- **Viewer**: `/viewer-dashboard` → Assets (read-only list), Live Tracking  
- Post-MFA: Real API role check → role-based redirect (no mocks)
- Real backend data/services (no mock values)
- Permissions enforced (admin: add/edit/delete; viewer: read-only)

## Step-by-Step Implementation (In Order)

### Step 1: Fix Auth Flow (Real API, Token Alignment)
- [ ] Update `src/context/AuthContext.jsx`: Use real `authService.verifyMFA()` API in `verifyMFA()`
- [ ] Align localStorage keys: Use 'access_token' everywhere (remove 'assets_token', 'pending_*')
- [ ] Update `src/services/authService.js`: Ensure token storage consistent
- [ ] Test: Backend `/auth/verify-mfa` → frontend gets real `user.role`

### Step 2: Post-MFA Role Redirect
- [ ] Update `src/components/Auth/MFA/MFA.jsx`: After verify → if admin → `/admin-dashboard`, else `/viewer-dashboard`

### Step 3: Create New Dashboard Pages (Real Data)
- [ ] Create `src/pages/AdminDashboard.jsx`: Tabs/sections → AssetOnboarding (CRUD), LiveTracking, Reports
- [ ] Create `src/pages/ViewerDashboard.jsx`: Assets list (read-only), LiveTracking  
- [ ] Create `src/pages/Reports.jsx`: Real reports from `/api/reports/` or assets/tracking data

### Step 4: Update Routing & Navigation
- [ ] Update `src/routes/AppRoutes.jsx`: Add `/admin-dashboard`, `/viewer-dashboard`, `/reports` routes (permission-gated)
- [ ] Update `src/components/Auth/Layout/Sidebar/Sidebar.jsx`: Role-specific menu items
- [ ] Update `Dashboard.jsx` → generic or redirect based on role

### Step 5: Backend Reports (If Needed)
- [ ] Backend: Add `/api/routers/reports_router.py` + service (aggregate assets/tracking)
- [ ] Frontend: `src/services/reportsService.js` for reports data

### Step 6: Testing & Polish
- [ ] Test full flow: Login → MFA → role dashboard → CRUD permissions
- [ ] Viewer: Read-only assets list, no edit/delete buttons
- [ ] Admin: Full CRUD, reports access
- [ ] Update Navbar quick actions role-aware

## Progress Tracking
**Current: Step 0 - Planning Complete**
**Next: Step 1 - Auth Flow Fix** (after confirmation)

*Updated: [timestamp]*

