import React from 'react';

const TrackingTable = ({ trackingData }) => (
  <table>
    <thead>
      <tr>
        <th>Asset</th>
        <th>Latitude</th>
        <th>Longitude</th>
      </tr>
    </thead>
    <tbody>
      {trackingData.map(r => (
        <tr key={r.assetId}>
          <td>{r.assetId}</td>
          <td>{r.latitude ?? 'N/A'}</td>
          <td>{r.longitude ?? 'N/A'}</td>
        </tr>
      ))}
    </tbody>
  </table>
);

export default TrackingTable;