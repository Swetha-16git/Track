import React from "react";
import { useParams } from "react-router-dom";

export default function ClientUsers() {
  const { clientCode } = useParams();
  return (
    <div>
      <h2>Users</h2>
      <p>Client: <b>{clientCode}</b></p>
      <p>(Next: show users list + add user form)</p>
    </div>
  );
}