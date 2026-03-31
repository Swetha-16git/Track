import React from "react";
import "./AdminDashboard.css"; // keep your existing css import
import "./AdminAnnouncements.css";

const AdminAnnouncements = () => {
  return (
    <div className="admin-page">

      <div className="announcements-container">
        <div className="announcements-header">
          <h2>Announcements</h2>
          <span className="announcements-subtitle">
            Latest updates and notifications
          </span>
        </div>

        <div className="announcement-card maintenance">
          <div className="announcement-badge">Maintenance</div>
          <div className="announcement-content">
            <h4>Planned Maintenance</h4>
            <p>
              System maintenance scheduled at <strong>11:00 PM</strong>.
            </p>
            <span className="announcement-time">Today</span>
          </div>
        </div>

        <div className="announcement-card client">
          <div className="announcement-badge">Client</div>
          <div className="announcement-content">
            <h4>New Client Added</h4>
            <p>Tata Projects successfully onboarded.</p>
            <span className="announcement-time">Yesterday</span>
          </div>
        </div>

        <div className="announcement-card policy">
          <div className="announcement-badge">Policy</div>
          <div className="announcement-content">
            <h4>Policy Update</h4>
            <p>Admin access rules have been updated.</p>
            <span className="announcement-time">This week</span>
          </div>
        </div>
      </div>

    </div>
  );
};

export default AdminAnnouncements;