import React from "react";
import { useParams } from "react-router-dom";

export default function ClientAssetMovement() {
  const { clientCode } = useParams();
  return (
    <div>
      <h2>Asset Movement</h2>
      <p>Client: <b>{clientCode}</b></p>
      <p>(Next: movement/live tracking view)</p>
    </div>
  );
}
