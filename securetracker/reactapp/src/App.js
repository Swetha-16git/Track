import React from 'react';
import { BrowserRouter as Router } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import AppRoutes from './routes/AppRoutes';
import './App.css';

const RoleLayout = ({ children }) => {
  const { user } = useAuth();
  const roleClass = user?.role?.toLowerCase() === 'admin' ? 'admin-mode' : 'viewer-mode';

  return (
    <div className={`app-container ${roleClass}`}>
      {children}
    </div>
  );
};

function App() {
  return (
    <Router>
      <AuthProvider>
        <RoleLayout>
          <AppRoutes />
        </RoleLayout>
      </AuthProvider>
    </Router>
  );
}

export default App;
