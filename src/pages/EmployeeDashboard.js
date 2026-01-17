import { useEffect, useState } from "react";
import api from "../api/api";
import LogoutButton from "../components/LogoutButton";

function EmployeeDashboard() {
  const [complaints, setComplaints] = useState([]);
  const employeeId = localStorage.getItem("userId");

  useEffect(() => {
    api.get(`/employee/complaints/${employeeId}`)
      .then(res => setComplaints(res.data));
  }, [employeeId]);

  const updateStatus = (id, status) => {
    api.put(`/employee/update/${id}/${status}`)
      .then(() => alert("Status Updated"));
  };

  return (
    <div className="container">
      <h1 className="title">Employee Dashboard</h1>

      {complaints.length === 0 && (
        <div className="card">No complaints assigned</div>
      )}

      {complaints.map(c => (
        <div className="card" key={c.id}>
          <h3>{c.title}</h3>
          <p>{c.description}</p>

          <p>
            Status:
            <span style={{
              marginLeft:"10px",
              padding:"5px 10px",
              borderRadius:"8px",
              background:
                c.status === "RESOLVED" ? "#48bb78" :
                c.status === "IN_PROGRESS" ? "#ed8936" : "#e53e3e",
              color:"white"
            }}>
              {c.status}
            </span>
          </p>

          <button className="btn" onClick={() => updateStatus(c.id, "IN_PROGRESS")}>
            In Progress
          </button>
          <button className="btn" onClick={() => updateStatus(c.id, "RESOLVED")}>
            Resolved
          </button>
        </div>
      ))}

      <br />
      <LogoutButton />
    </div>
  );
}

export default EmployeeDashboard;
