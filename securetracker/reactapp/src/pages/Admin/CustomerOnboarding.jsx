import React, { useState } from "react";
import organisationService from "../../services/organisationService";

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
    <div style={{ maxWidth: 420 }}>
      <h2>Customer Onboarding</h2>

      <input
        name="client_code"
        placeholder="Client Code (e.g. LT)"
        value={form.client_code}
        onChange={handleChange}
      />
      <br />
      <br />

      <input
        name="client_name"
        placeholder="Client Name (e.g. L&T)"
        value={form.client_name}
        onChange={handleChange}
      />
      <br />
      <br />

      <input
        name="contact_email"
        placeholder="Contact Email"
        value={form.contact_email}
        onChange={handleChange}
      />
      <br />
      <br />

      <button onClick={handleCreateCustomer} disabled={loading}>
        {loading ? "Creating..." : "Create Customer"}
      </button>

      {message && (
        <p style={{ marginTop: 12 }}>
          {message}
        </p>
      )}
    </div>
  );
}