import { useState, useEffect } from "react";
import api from "../api/api";
import { useNavigate } from "react-router-dom";
import LogoutButton from "../components/LogoutButton";
import NotificationBell from "../components/NotificationBell"; // ✅ Added

function AdminDashboard() {
  const navigate = useNavigate();
  const [complaints, setComplaints] = useState([]);
  const [employees, setEmployees] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [selectedComplaint, setSelectedComplaint] = useState(null);
  const [showAssignModal, setShowAssignModal] = useState(false);
  const [assignedEmployee, setAssignedEmployee] = useState("");
  const [activeTab, setActiveTab] = useState("pending");
  const [roleRequests, setRoleRequests] = useState([]);
  const [showRoleRequests, setShowRoleRequests] = useState(false);

  const role = localStorage.getItem("role");

  useEffect(() => {
    if (role !== "ADMIN") {
      navigate("/");
    } else {
      fetchComplaints();
      fetchEmployees();
      fetchRoleRequests();
    }
  }, [role, navigate]);

  const fetchComplaints = async () => {
    try {
      const res = await api.get("/admin/complaints/all", {
        headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
      });
      setComplaints(res.data);
    } catch (err) {
      setError("Failed to fetch complaints.");
    } finally {
      setLoading(false);
    }
  };

  const fetchEmployees = async () => {
    try {
      const res = await api.get("/admin/employees", {
        headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
      });
      setEmployees(res.data);
    } catch (err) {
      console.error("Failed to fetch employees:", err);
    }
  };

  const fetchRoleRequests = async () => {
    try {
      const res = await api.get("/admin/role-requests", {
        headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
      });
      setRoleRequests(res.data);
    } catch (err) {
      console.error("Failed to fetch role requests:", err);
    }
  };

  const assignComplaint = async () => {
    if (!assignedEmployee) {
      alert("Please select an employee");
      return;
    }
    try {
      await api.post(
        `/admin/complaints/${selectedComplaint.id}/assign/${assignedEmployee}`,
        {},
        { headers: { Authorization: `Bearer ${localStorage.getItem("token")}` } }
      );
      setShowAssignModal(false);
      setAssignedEmployee("");
      setSelectedComplaint(null);
      fetchComplaints();
    } catch (err) {
      alert("Failed to assign complaint");
    }
  };

  // ✅ New Escalation Function
  const escalateComplaint = async (complaintId) => {
    try {
      await api.put(`/admin/complaints/${complaintId}/status`, 
        { status: "ESCALATED", note: "Admin manually escalated this issue for urgent attention." },
        { headers: { Authorization: `Bearer ${localStorage.getItem("token")}` } }
      );
      fetchComplaints();
      alert("Complaint Escalated!");
    } catch (err) {
      alert("Failed to escalate");
    }
  };

  const markResolved = async (complaintId) => {
    try {
      await api.put(
        `/admin/complaints/${complaintId}/status`,
        { status: "RESOLVED", note: "Resolved by Administrator." },
        { headers: { Authorization: `Bearer ${localStorage.getItem("token")}` } }
      );
      fetchComplaints();
    } catch (err) {
      alert("Failed to update status");
    }
  };

  const approveRoleRequest = async (requestId) => {
    try {
      await api.post(`/admin/role-requests/${requestId}/approve`, {}, {
        headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
      });
      fetchRoleRequests();
      fetchEmployees();
    } catch (err) {
      alert("Failed to approve");
    }
  };

  const rejectRoleRequest = async (requestId) => {
    try {
      await api.post(`/admin/role-requests/${requestId}/reject`, {}, {
        headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
      });
      fetchRoleRequests();
    } catch (err) {
      alert("Failed to reject");
    }
  };

  const getFilteredComplaints = () => {
    return complaints.filter((c) => {
      const status = c.status ? c.status.toUpperCase() : "";
      switch (activeTab) {
        case "pending": return status === "PENDING" || status === "OPEN"; 
        case "assigned": return status === "ASSIGNED";
        case "in-progress": return status === "IN_PROGRESS";
        case "escalated": return status === "ESCALATED";
        case "resolved": return status === "RESOLVED";
        default: return true;
      }
    });
  };

  const getStatusColor = (status) => {
    switch (status?.toUpperCase()) {
      case "OPEN":
      case "PENDING": return "#ff9800";
      case "ASSIGNED": return "#2196f3";
      case "IN_PROGRESS": return "#1976d2";
      case "RESOLVED": return "#4caf50";
      case "ESCALATED": return "#f44336";
      default: return "#9e9e9e";
    }
  };

  if (loading) return <div style={styles.container}><p>Loading...</p></div>;

  const filteredComplaints = getFilteredComplaints();

  return (
    <div style={styles.container}>
      <div style={styles.header}>
        <div>
          <h1 style={styles.title}>Admin Dashboard</h1>
          <p style={styles.subtitle}>Manage Complaints & Role Requests</p>
        </div>
        <div style={styles.headerRight}>
          <NotificationBell /> {/* ✅ Added Bell Icon */}
          <LogoutButton />
        </div>
      </div>

      <div style={styles.content}>
        {error && <div style={styles.error}>{error}</div>}

        <div style={styles.headerButtons}>
          <button
            onClick={() => setShowRoleRequests(!showRoleRequests)}
            style={{ ...styles.button, backgroundColor: showRoleRequests ? "#f44336" : "#2196f3" }}
          >
            {showRoleRequests ? "Hide" : "Show"} Role Requests ({roleRequests.length})
          </button>
        </div>

        {showRoleRequests && (
          <div style={styles.section}>
            <h2>Role Requests</h2>
            {roleRequests.length === 0 ? <p>No pending role requests</p> : (
              <div style={styles.requestsGrid}>
                {roleRequests.map((request) => (
                  <div key={request.id} style={styles.requestCard}>
                    <div style={styles.requestHeader}>
                      <h3>User: {request.user?.name || `ID: ${request.userId}`}</h3>
                      <span style={{ ...styles.badge, backgroundColor: "#ff9800" }}>{request.status}</span>
                    </div>
                    <p><strong>Reason:</strong> {request.reason}</p>
                    <div style={styles.requestActions}>
                      <button onClick={() => approveRoleRequest(request.id)} style={{ ...styles.button, ...styles.approveBtn }}>Approve</button>
                      <button onClick={() => rejectRoleRequest(request.id)} style={{ ...styles.button, ...styles.rejectBtn }}>Reject</button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        <div style={styles.tabsContainer}>
          {["pending", "assigned", "in-progress", "escalated", "resolved"].map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              style={{
                ...styles.tab,
                backgroundColor: activeTab === tab ? "#2196f3" : "#f0f0f0",
                color: activeTab === tab ? "white" : "black",
              }}
            >
              {tab.charAt(0).toUpperCase() + tab.slice(1).replace("-", " ")}
            </button>
          ))}
        </div>
          
        <div style={styles.section}>
          {filteredComplaints.length === 0 ? <p>No complaints in this category</p> : (
            <div style={styles.complaintsGrid}>
              {filteredComplaints.map((complaint) => (
                <div key={complaint.id} style={styles.complaintCard}>
                  <div style={styles.cardHeader}>
                    <div>
                      <h3>{complaint.title}</h3>
                      <p style={styles.userId}>By: {complaint.user?.name || "Anonymous"}</p>
                    </div>
                    <span style={{ ...styles.statusBadge, backgroundColor: getStatusColor(complaint.status) }}>
                      {complaint.status}
                    </span>
                  </div>
                  <p style={styles.description}>{complaint.description}</p>
                  
                  {/* ✅ Show Notes from Employee */}
                  {complaint.notes && (
                    <div style={styles.notesBox}>
                      <strong>Update Note:</strong>
                      <p style={{margin: "5px 0 0 0", fontStyle: "italic"}}>{complaint.notes}</p>
                    </div>
                  )}

                  {complaint.status === "ESCALATED" && (
                    <div style={styles.escalationAlert}>⚠️ This complaint has been Escalated</div>
                  )}

                  <div style={styles.cardFooter}>
                    <small>Created: {complaint.createdAt ? new Date(complaint.createdAt).toLocaleDateString() : "N/A"}</small>
                    {complaint.employee && (
                      <small style={styles.assignedTo}>Assigned to: {complaint.employee.name}</small>
                    )}
                  </div>

                  <div style={styles.cardActions}>
                    {(complaint.status === "PENDING" || complaint.status === "OPEN") && (
                      <button onClick={() => { setSelectedComplaint(complaint); setShowAssignModal(true); }} style={{ ...styles.button, ...styles.assignBtn }}>Assign</button>
                    )}
                    {/* ✅ Added Escalation Button */}
                    {(complaint.status === "ASSIGNED" || complaint.status === "IN_PROGRESS") && (
                      <button onClick={() => escalateComplaint(complaint.id)} style={{ ...styles.button, ...styles.escalateBtn }}>Escalate</button>
                    )}
                    {(complaint.status === "ASSIGNED" || complaint.status === "IN_PROGRESS" || complaint.status === "ESCALATED") && (
                      <button onClick={() => markResolved(complaint.id)} style={{ ...styles.button, ...styles.resolveBtn }}>Mark Resolved</button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {showAssignModal && selectedComplaint && (
          <div style={styles.modal}>
            <div style={styles.modalContent}>
              <h2>Assign Complaint</h2>
              <p style={styles.modalTitle}>{selectedComplaint.title}</p>
              <label style={styles.label}>Select Employee:</label>
              <select value={assignedEmployee} onChange={(e) => setAssignedEmployee(e.target.value)} style={styles.select}>
                <option value="">-- Select Employee --</option>
                {employees.map((emp) => (
                  <option key={emp.id} value={emp.id}>{emp.name} ({emp.role})</option>
                ))}
              </select>
              <div style={styles.modalActions}>
                <button onClick={assignComplaint} style={{ ...styles.button, ...styles.assignBtn }}>Confirm Assign</button>
                <button onClick={() => { setShowAssignModal(false); setSelectedComplaint(null); }} style={{ ...styles.button, ...styles.cancelBtn }}>Cancel</button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

const styles = {
  container: { minHeight: "100vh", backgroundColor: "#f5f5f5" },
  header: { display: "flex", justifyContent: "space-between", alignItems: "center", padding: "20px 40px", backgroundColor: "#fff", boxShadow: "0 2px 4px rgba(0,0,0,0.1)", marginBottom: "20px" },
  headerRight: { display: "flex", alignItems: "center", gap: "25px" }, // Space between Bell and Logout
  title: { fontSize: "32px", margin: "0", color: "#333" },
  subtitle: { fontSize: "14px", color: "#666", margin: "5px 0 0 0" },
  content: { padding: "0 40px", maxWidth: "1400px", margin: "0 auto" },
  error: { backgroundColor: "#ffebee", color: "#c62828", padding: "12px", borderRadius: "4px", marginBottom: "20px" },
  headerButtons: { marginBottom: "20px", display: "flex", gap: "10px" },
  button: { padding: "10px 20px", border: "none", borderRadius: "4px", cursor: "pointer", fontSize: "14px", fontWeight: "500", color: "white", transition: "all 0.3s ease" },
  approveBtn: { backgroundColor: "#4caf50" },
  rejectBtn: { backgroundColor: "#f44336" },
  assignBtn: { backgroundColor: "#2196f3" },
  resolveBtn: { backgroundColor: "#4caf50" },
  escalateBtn: { backgroundColor: "#ff9800" }, // Orange for escalation
  cancelBtn: { backgroundColor: "#9e9e9e" },
  section: { backgroundColor: "white", padding: "20px", borderRadius: "8px", marginBottom: "20px", boxShadow: "0 2px 4px rgba(0,0,0,0.1)" },
  requestsGrid: { display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))", gap: "15px", marginTop: "15px" },
  requestCard: { border: "1px solid #e0e0e0", borderRadius: "8px", padding: "15px", backgroundColor: "#fafafa" },
  requestHeader: { display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "10px" },
  requestActions: { display: "flex", gap: "10px", marginTop: "10px" },
  badge: { padding: "4px 8px", borderRadius: "12px", color: "white", fontSize: "12px", fontWeight: "bold" },
  tabsContainer: { display: "flex", gap: "10px", marginBottom: "20px", flexWrap: "wrap" },
  tab: { padding: "10px 20px", border: "none", borderRadius: "4px", cursor: "pointer", fontSize: "14px", fontWeight: "500", transition: "all 0.3s ease" },
  complaintsGrid: { display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(350px, 1fr))", gap: "20px" },
  complaintCard: { border: "1px solid #e0e0e0", borderRadius: "8px", padding: "20px", backgroundColor: "white", boxShadow: "0 2px 8px rgba(0,0,0,0.1)", transition: "all 0.3s ease" },
  cardHeader: { display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "12px", borderBottom: "1px solid #eee", paddingBottom: "10px" },
  userId: { fontSize: "12px", color: "#666", margin: "4px 0 0 0" },
  statusBadge: { padding: "6px 12px", borderRadius: "20px", color: "white", fontSize: "12px", fontWeight: "bold" },
  description: { fontSize: "14px", color: "#555", marginBottom: "10px", lineHeight: "1.5" },
  notesBox: { backgroundColor: "#f9f9f9", padding: "10px", borderRadius: "4px", fontSize: "13px", borderLeft: "4px solid #2196f3", marginBottom: "10px" },
  escalationAlert: { backgroundColor: "#fff3cd", color: "#856404", padding: "10px", borderRadius: "4px", marginBottom: "10px", fontSize: "13px", fontWeight: "500" },
  cardFooter: { display: "flex", justifyContent: "space-between", alignItems: "center", fontSize: "12px", color: "#999", marginBottom: "15px" },
  assignedTo: { backgroundColor: "#e3f2fd", padding: "4px 8px", borderRadius: "3px" },
  cardActions: { display: "flex", gap: "10px" },
  modal: { position: "fixed", top: 0, left: 0, right: 0, bottom: 0, backgroundColor: "rgba(0,0,0,0.5)", display: "flex", justifyContent: "center", alignItems: "center", zIndex: 1000 },
  modalContent: { backgroundColor: "white", padding: "30px", borderRadius: "8px", boxShadow: "0 4px 6px rgba(0,0,0,0.1)", width: "90%", maxWidth: "400px" },
  modalTitle: { fontSize: "16px", color: "#666", marginBottom: "20px", fontWeight: "500" },
  label: { display: "block", marginBottom: "8px", fontWeight: "500", color: "#333" },
  select: { width: "100%", padding: "10px", marginBottom: "20px", border: "1px solid #ddd", borderRadius: "4px", fontSize: "14px", boxSizing: "border-box" },
  modalActions: { display: "flex", gap: "10px" },
};

export default AdminDashboard;