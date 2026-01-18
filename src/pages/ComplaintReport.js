import { useEffect, useState } from "react";
import api from "../api/api";

function ComplaintReport() {
  const [complaints, setComplaints] = useState([]);

  useEffect(() => {
    api.get("/admin/complaints")
      .then(res => {
        console.log("Complaints:", res.data);
        setComplaints(res.data);
      })
      .catch(err => console.error(err));
  }, []);

  return (
    <div className="container">
      <div className="card" style={{ width: "90%", margin: "auto" }}>
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
            {complaints.length === 0 ? (
              <tr>
                <td colSpan="5" style={{ textAlign: "center" }}>
                  No complaints found
                </td>
              </tr>
            ) : (
              complaints.map(c => (
                <tr key={c.id}>
                  <td>{c.id}</td>
                  <td>{c.title}</td>
                  <td>{c.status}</td>
                  <td>{c.user?.email}</td>
                  <td>{c.employee?.email || "-"}</td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default ComplaintReport;
