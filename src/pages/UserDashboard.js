import { useState, useEffect } from "react";
import api from "../api/api";
import { useNavigate } from "react-router-dom";
import LogoutButton from "../components/LogoutButton";

function UserDashboard() {
  const navigate = useNavigate();
  const [userComplaints, setUserComplaints] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [showRoleRequestModal, setShowRoleRequestModal] = useState(false);
  const [existingRoleRequest, setExistingRoleRequest] = useState(null);
  const [activeTab, setActiveTab] = useState("complaints");

  // ✅ ADDED
  const [selectedLevel, setSelectedLevel] = useState("BEGINNER");

  const userId = localStorage.getItem("userId");
  const role = localStorage.getItem("role");

  useEffect(() => {
    if (role !== "USER") {
      navigate("/");
    } else {
      fetchUserComplaints();
      checkRoleRequest();
    }
  }, [role, navigate]);

  const fetchUserComplaints = async () => {
    try {
      const res = await api.get(`/complaints/user/${userId}`);
      setUserComplaints(res.data);
    } catch {
      setError("Failed to fetch complaints");
    } finally {
      setLoading(false);
    }
  };

  const checkRoleRequest = async () => {
    try {
      const res = await api.get(`/employee-request/pending/${userId}`);
      setExistingRoleRequest(res.data);
    } catch {
      setExistingRoleRequest(null);
    }
  };

  // ✅ CHANGED (send selected level)
  const submitRoleRequest = async () => {
    try {
      await api.post(`/employee-request/${userId}`, {
        requestedRole: "EMPLOYEE",
        level: selectedLevel,
      });
      alert("Employee role request submitted");
      setShowRoleRequestModal(false);
      checkRoleRequest();
    } catch {
      alert("Failed to submit role request");
    }
  };

  if (loading) {
    return (
      <div style={styles.container}>
        <p>Loading...</p>
      </div>
    );
  }

  const pendingComplaints = userComplaints.filter(
    (c) => c.status !== "RESOLVED"
  );
  const resolvedComplaints = userComplaints.filter(
    (c) => c.status === "RESOLVED"
  );

  return (
    <div style={styles.container}>
      <div style={styles.header}>
        <div>
          <h1 style={styles.title}>My Dashboard</h1>
          <p style={styles.subtitle}>Track Your Complaints</p>
        </div>
        <LogoutButton />
      </div>

      <div style={styles.content}>
        {error && <div style={styles.error}>{error}</div>}

        <div style={styles.headerButtons}>
          <button
            onClick={() => navigate("/complaint")}
            style={{ ...styles.button, backgroundColor: "#4caf50" }}
          >
            + File New Complaint
          </button>

          <button
            onClick={() => setShowRoleRequestModal(true)}
            style={{
              ...styles.button,
              backgroundColor:
                existingRoleRequest?.status === "PENDING"
                  ? "#9e9e9e"
                  : "#2196f3",
            }}
            disabled={existingRoleRequest?.status === "PENDING"}
          >
            Request Employee Role
          </button>
        </div>

        {existingRoleRequest && (
          <div
            style={{
              ...styles.section,
              borderLeft: "4px solid orange",
            }}
          >
            <h3>Employee Role Request</h3>
            <p>
              <strong>Status:</strong>{" "}
              <span style={styles.statusBadge}>
                {existingRoleRequest.status}
              </span>
            </p>
            <p>
              <strong>Request ID:</strong> {existingRoleRequest.id}
            </p>
            <p>
              <strong>Level:</strong> {existingRoleRequest.level}
            </p>
          </div>
        )}

        {showRoleRequestModal && (
          <div style={styles.modal}>
            <div style={styles.modalContent}>
              <h2>Request Employee Role</h2>
              <p>Submit request to become an employee</p>

              {/* ✅ ADDED LEVEL SELECTOR */}
              <label style={{ marginTop: "15px", display: "block" }}>
                Select Level
              </label>
              <select
                value={selectedLevel}
                onChange={(e) => setSelectedLevel(e.target.value)}
                style={{
                  width: "100%",
                  padding: "10px",
                  marginTop: "8px",
                  marginBottom: "15px",
                  borderRadius: "4px",
                  border: "1px solid #ccc",
                }}
              >
                <option value="BEGINNER">Beginner</option>
                <option value="MANAGER">Manager</option>
                <option value="SENIOR">Senior Manager</option>
              </select>

              <div style={styles.modalActions}>
                <button
                  onClick={submitRoleRequest}
                  style={{ ...styles.button, backgroundColor: "#4caf50" }}
                >
                  Submit Request
                </button>
                <button
                  onClick={() => setShowRoleRequestModal(false)}
                  style={{ ...styles.button, backgroundColor: "#9e9e9e" }}
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        )}

        <div style={styles.tabsContainer}>
          <button
            onClick={() => setActiveTab("complaints")}
            style={{
              ...styles.tab,
              backgroundColor:
                activeTab === "complaints" ? "#2196f3" : "#f0f0f0",
              color: activeTab === "complaints" ? "white" : "black",
            }}
          >
            Active Complaints ({pendingComplaints.length})
          </button>

          <button
            onClick={() => setActiveTab("resolved")}
            style={{
              ...styles.tab,
              backgroundColor:
                activeTab === "resolved" ? "#2196f3" : "#f0f0f0",
              color: activeTab === "resolved" ? "white" : "black",
            }}
          >
            Resolved ({resolvedComplaints.length})
          </button>
        </div>
      </div>
    </div>
  );
}

const styles = {
  container: {
    minHeight: "100vh",
    backgroundColor: "#f5f5f5",
  },
  header: {
    display: "flex",
    justifyContent: "space-between",
    padding: "20px 40px",
    backgroundColor: "#fff",
  },
  title: { fontSize: "32px" },
  subtitle: { color: "#666" },
  content: { padding: "0 40px" },
  button: {
    padding: "10px 20px",
    border: "none",
    borderRadius: "4px",
    color: "white",
    cursor: "pointer",
  },
  headerButtons: {
    display: "flex",
    gap: "10px",
    marginBottom: "20px",
  },
  section: {
    backgroundColor: "white",
    padding: "20px",
    borderRadius: "8px",
    marginBottom: "20px",
  },
  statusBadge: {
    backgroundColor: "orange",
    color: "white",
    padding: "4px 8px",
    borderRadius: "12px",
    fontSize: "12px",
    fontWeight: "bold",
  },
  tabsContainer: {
    display: "flex",
    gap: "10px",
  },
  tab: {
    padding: "10px 20px",
    border: "none",
    borderRadius: "4px",
    cursor: "pointer",
  },
  modal: {
    position: "fixed",
    inset: 0,
    backgroundColor: "rgba(0,0,0,0.5)",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
  },
  modalContent: {
    backgroundColor: "white",
    padding: "30px",
    borderRadius: "8px",
    width: "400px",
  },
  modalActions: {
    display: "flex",
    gap: "10px",
    marginTop: "20px",
  },
};

export default UserDashboard;
