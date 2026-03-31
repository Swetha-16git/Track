import React from "react";
import { useParams } from "react-router-dom";

export default function ClientRoles() {
  const { clientCode } = useParams();
  return (
    <div>
      <h2>Roles</h2>
      <p>Client: <b>{clientCode}</b></p>
      <p>(Next: show roles + assign permissions)</p>
    </div>
  );
}
