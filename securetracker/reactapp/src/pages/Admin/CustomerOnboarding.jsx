import React, { useState } from "react";
import organisationService from "../../services/organisationService";
import "./AdminDashboard.css"; // uses shared modal styles

export default function CustomerOnboarding() {
  const [form, setForm] = useState({
    client_code: "",
    client_name: "",
    contact_email: "",
  });

  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  const handleChange = (e) => {
    setForm({
      ...form,
      [e.target.name]: e.target.value,
    });
  };

  const handleCreateCustomer = async () => {
    setMessage("");

    if (!form.client_code || !form.client_name || !form.contact_email) {
      setMessage("❌ Please fill all fields");
      return;
    }

    try {
      setLoading(true);

      const response = await organisationService.provisionClient({
        client_code: form.client_code.trim(),
        client_name: form.client_name.trim(),
        contact_email: form.contact_email.trim(),
      });

      setMessage(`✅ Client onboarded successfully. DB: ${response.db_name}`);

      // reset form
      setForm({
        client_code: "",
        client_name: "",
        contact_email: "",
      });
    } catch (err) {
      setMessage("❌ Failed to create client. Check logs.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="onboard-modal">
      <h2 className="onboard-title">Customer Onboarding</h2>

      <div className="onboard-field">
        <label>Client Code</label>
        <input
          name="client_code"
          placeholder="e.g. LT"
          value={form.client_code}
          onChange={handleChange}
        />
      </div>

      <div className="onboard-field">
        <label>Client Name</label>
        <input
          name="client_name"
          placeholder="e.g. L&T"
          value={form.client_name}
          onChange={handleChange}
        />
      </div>

      <div className="onboard-field">
        <label>Contact Email</label>
        <input
          name="contact_email"
          placeholder="admin@client.com"
          value={form.contact_email}
          onChange={handleChange}
        />
      </div>

      {message && <p className="onboard-msg">{message}</p>}

      <div className="onboard-actions">
        <button
          className="btn-primary"
          onClick={handleCreateCustomer}
          disabled={loading}
        >
          {loading ? "Creating..." : "Create Customer"}
        </button>
      </div>
    </div>
  );
}