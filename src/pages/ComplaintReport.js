import { useEffect, useState } from "react";
import api from "../api/api";

function ComplaintReport() {
  const [complaints, setComplaints] = useState([]);

  useEffect(() => {
    api.get("/admin/complaints/report")
      .then(res => setComplaints(res.data));
  }, []);

  return (
    <div className="container">
      <div className="card" style={{ width: "90%" }}>
        <h2 style={{ textAlign: "center" }}>Complaint Report</h2>
        <p>Total Complaints: {complaints.length}</p>

        <table border="1" width="100%" cellPadding="10">
          <thead>
            <tr>
              <th>ID</th>
              <th>Title</th>
              <th>Status</th>
              <th>Raised By</th>
              <th>Assigned To</th>
            </tr>
          </thead>
          <tbody>
            {complaints.map(c => (
              <tr key={c.id}>
                <td>{c.id}</td>
                <td>{c.title}</td>
                <td>{c.status}</td>
                <td>{c.user?.name}</td>
                <td>{c.employee?.name || "-"}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default ComplaintReport;
