import React from "react";
import { useParams } from "react-router-dom";

export default function ClientAssetOnboard() {
  const { clientCode } = useParams();
  return (
    <div>
      <h2>Asset Onboard</h2>
      <p>Client: <b>{clientCode}</b></p>
      <p>(Next: asset onboarding form)</p>
    </div>
  );
}