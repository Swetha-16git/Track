# Client Onboarding Implementation TODO

## Backend (securetracker/api/app/)
- [x] 1. Create `services/organisation_service.py` - CRUD methods for Organisation, admin-only, optional raw SQL setup on create
- [x] 2. Create `routers/organisation_router.py` - /api/organisations endpoints (GET, POST, etc.)
- [ ] 3. Edit `main.py` - include_router organisation_router

## Frontend Services (securetracker/reactapp/src/services/)
- [x] 4. Create `organisationService.js` - getOrganisations(), createOrganisation()

## Frontend UI (securetracker/reactapp/src/)
- [ ] 5. Edit `components/Auth/Layout/Sidebar/Sidebar.jsx` - Add admin menu: Dashboard, Client Onboarding
- [ ] 6. Edit `pages/Admin/AdminDashboard.jsx` - Fetch/display real org stats (users/assets count)
- [ ] 7. Edit `pages/Admin/Customers.jsx` - Real org list table
- [ ] 8. Edit `pages/Admin/CustomerOnboarding.jsx` - Full form, submit to API, success feedback

## Final
- [ ] Test: Backend restart, frontend npm start, admin login → nav → create org → check DB
- [ ] attempt_completion

Updated as steps complete.
