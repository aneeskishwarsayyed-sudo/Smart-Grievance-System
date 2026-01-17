import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import api from "../api/api";
import LogoutButton from "../components/LogoutButton";

function UserDashboard() {
  const navigate = useNavigate();
  const [complaints, setComplaints] = useState([]);

  useEffect(() => {
    fetchComplaints();
  }, []);

  const fetchComplaints = async () => {
    try {
      const userId = localStorage.getItem("userId");
      const res = await api.get(`/complaints/user/${userId}`);
      setComplaints(res.data);
    } catch (err) {
      console.error("Error fetching complaints:", err);
    }
  };

  const getStatusColor = (status) => {
    switch(status) {
      case "OPEN": return "#FF9800";
      case "ASSIGNED": return "#2196F3";
      case "RESOLVED": return "#4CAF50";
      default: return "#9E9E9E";
    }
  };

  return (
    <div style={styles.mainContainer}>
      {/* Header */}
      <div style={styles.header}>
        <div>
          <h1 style={styles.title}>My Dashboard</h1>
          <p style={styles.subtitle}>Manage your complaints and requests</p>
        </div>
        <LogoutButton />
      </div>

      {/* Main Content */}
      <div style={styles.contentContainer}>
        {/* Left: Quick Actions */}
        <div style={styles.actionsPanel}>
          <h3 style={styles.panelTitle}>Quick Actions</h3>
          
          <button
            style={styles.actionBtn}
            onClick={() => navigate("/user/complaint")}
          >
            <span style={styles.actionIcon}>➕</span>
            <div>
              <p style={styles.actionBtnTitle}>Add Complaint</p>
              <p style={styles.actionBtnDesc}>Submit a new complaint</p>
            </div>
          </button>

          <button
            style={styles.actionBtn}
            onClick={() => navigate("/user/requests")}
          >
            <span style={styles.actionIcon}>📬</span>
            <div>
              <p style={styles.actionBtnTitle}>Employee Requests</p>
              <p style={styles.actionBtnDesc}>View your requests</p>
            </div>
          </button>

          <button
            style={styles.actionBtn}
            onClick={() => {}}
          >
            <span style={styles.actionIcon}>📊</span>
            <div>
              <p style={styles.actionBtnTitle}>View Report</p>
              <p style={styles.actionBtnDesc}>Check detailed report</p>
            </div>
          </button>
        </div>

        {/* Right: Recent Complaints */}
        <div style={styles.complaintsList}>
          <h3 style={styles.panelTitle}>Recent Complaints</h3>
          
          {complaints.length === 0 ? (
            <div style={styles.emptyState}>
              <p style={styles.emptyIcon}>📋</p>
              <p style={styles.emptyText}>No complaints submitted yet</p>
              <button
                style={styles.emptyActionBtn}
                onClick={() => navigate("/user/complaint")}
              >
                Submit Your First Complaint
              </button>
            </div>
          ) : (
            <div style={styles.complaintItems}>
              {complaints.slice(0, 5).map((complaint, index) => (
                <div key={index} style={styles.complaintCard}>
                  <div style={styles.complaintHeader}>
                    <h4 style={styles.complaintTitle}>{complaint.title}</h4>
                    <span style={{
                      ...styles.statusBadge,
                      backgroundColor: getStatusColor(complaint.status),
                      color: "white"
                    }}>
                      {complaint.status}
                    </span>
                  </div>
                  <p style={styles.complaintDesc}>{complaint.description.substring(0, 100)}...</p>
                  <div style={styles.complaintMeta}>
                    <span style={styles.complaintDate}>
                      {new Date(complaint.createdAt).toLocaleDateString()}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

const styles = {
  mainContainer: {
    backgroundColor: "#F5F5F5",
    minHeight: "100vh",
    padding: "20px"
  },
  header: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: "30px",
    backgroundColor: "white",
    padding: "20px",
    borderRadius: "10px",
    boxShadow: "0 2px 4px rgba(0,0,0,0.1)"
  },
  title: {
    fontSize: "28px",
    margin: "0",
    color: "#333"
  },
  subtitle: {
    fontSize: "14px",
    color: "#666",
    margin: "5px 0 0 0"
  },
  statsContainer: {
    display: "none"
  },
  contentContainer: {
    display: "grid",
    gridTemplateColumns: "1fr 2fr",
    gap: "20px"
  },
  actionsPanel: {
    backgroundColor: "white",
    borderRadius: "10px",
    padding: "20px",
    boxShadow: "0 2px 4px rgba(0,0,0,0.1)"
  },
  panelTitle: {
    margin: "0 0 20px 0",
    fontSize: "18px",
    fontWeight: "700",
    color: "#333",
    borderBottom: "2px solid #E67E22",
    paddingBottom: "10px"
  },
  actionBtn: {
    width: "100%",
    display: "flex",
    alignItems: "center",
    gap: "15px",
    padding: "15px",
    marginBottom: "10px",
    backgroundColor: "#FAFAFA",
    border: "1px solid #E0E0E0",
    borderRadius: "8px",
    cursor: "pointer",
    transition: "all 0.3s ease",
    textAlign: "left"
  },
  actionIcon: {
    fontSize: "24px",
    flexShrink: 0
  },
  actionBtnTitle: {
    fontSize: "14px",
    fontWeight: "600",
    color: "#333",
    margin: "0"
  },
  actionBtnDesc: {
    fontSize: "12px",
    color: "#999",
    margin: "4px 0 0 0"
  },
  complaintsList: {
    backgroundColor: "white",
    borderRadius: "10px",
    padding: "20px",
    boxShadow: "0 2px 4px rgba(0,0,0,0.1)"
  },
  emptyState: {
    textAlign: "center",
    padding: "40px 20px",
    color: "#999"
  },
  emptyIcon: {
    fontSize: "48px",
    margin: "0"
  },
  emptyText: {
    fontSize: "16px",
    margin: "10px 0",
    color: "#666"
  },
  emptyActionBtn: {
    padding: "10px 20px",
    backgroundColor: "#E67E22",
    color: "white",
    border: "none",
    borderRadius: "6px",
    cursor: "pointer",
    fontSize: "14px",
    fontWeight: "600",
    marginTop: "10px"
  },
  complaintItems: {
    display: "flex",
    flexDirection: "column",
    gap: "12px",
    maxHeight: "500px",
    overflowY: "auto"
  },
  complaintCard: {
    padding: "15px",
    backgroundColor: "#FAFAFA",
    borderLeft: "4px solid #E67E22",
    borderRadius: "8px",
    transition: "all 0.3s ease",
    cursor: "pointer"
  },
  complaintHeader: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "start",
    marginBottom: "8px"
  },
  complaintTitle: {
    margin: "0",
    fontSize: "14px",
    fontWeight: "600",
    color: "#333",
    flex: 1
  },
  statusBadge: {
    padding: "4px 10px",
    borderRadius: "12px",
    fontSize: "12px",
    fontWeight: "600",
    marginLeft: "10px",
    whiteSpace: "nowrap"
  },
  complaintDesc: {
    fontSize: "12px",
    color: "#666",
    margin: "8px 0",
    lineHeight: "1.4"
  },
  complaintMeta: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center"
  },
  complaintDate: {
    fontSize: "11px",
    color: "#999"
  }
};

export default UserDashboard;
