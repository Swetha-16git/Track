import React from "react";

const TrackingTable = ({ trackingData }) => (
  <table>
    <thead>
      <tr>
        <th>Asset ID</th>
        <th>Latitude</th>
        <th>Longitude</th>
      </tr>
    </thead>
    <tbody>
      {trackingData.map((r, idx) => (
        <tr key={`${r.assetId ?? "asset"}-${idx}`}>
          <td>{r.assetId ?? "N/A"}</td>
          <td>{r.latitude ?? "N/A"}</td>
          <td>{r.longitude ?? "N/A"}</td>
        </tr>
      ))}
    </tbody>
  </table>
);

export default TrackingTable;