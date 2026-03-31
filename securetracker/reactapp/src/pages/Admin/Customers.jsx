export default function Customers() {
  const customers = [
    { code: "LT001", name: "L&T", status: "Active" },
    { code: "TP002", name: "Tata Projects", status: "Active" }
  ];

  return (
    <div>
      <h2>Customers</h2>
      <table border="1" cellPadding="10">
        <thead>
          <tr>
            <th>Client Code</th>
            <th>Client Name</th>
            <th>Status</th>
          </tr>
        </thead>
        <tbody>
          {customers.map(c => (
            <tr key={c.code}>
              <td>{c.code}</td>
              <td>{c.name}</td>
              <td>{c.status}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}