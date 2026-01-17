import { useEffect, useState } from "react";
import api from "../api/api";
import { useNavigate } from "react-router-dom";
import LogoutButton from "../components/LogoutButton";

function AdminDashboard() {
  const [complaints, setComplaints] = useState([]);
  const [filteredComplaints, setFilteredComplaints] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState("ALL");
  const [selectedComplaint, setSelectedComplaint] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    api.get("/admin/complaints")
      .then(res => setComplaints(res.data))
      .catch(err => console.error(err));
  }, []);

  useEffect(() => {
    let filtered = complaints;

    if (filterStatus !== "ALL") {
      filtered = filtered.filter(c => c.status === filterStatus);
    }

    if (searchTerm) {
      filtered = filtered.filter(c =>
        c.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        c.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
        c.user?.name.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    setFilteredComplaints(filtered);
  }, [searchTerm, filterStatus, complaints]);

  const updateStatus = (id, status) => {
    api.put(`/admin/complaints/${id}/status?status=${status}`)
      .then(() => {
        setComplaints(prev =>
          prev.map(c => c.id === id ? { ...c, status } : c)
        );
        if (selectedComplaint?.id === id) {
          setSelectedComplaint(prev => ({ ...prev, status }));
        }
      })
      .catch(err => alert("Error updating status: " + err.response?.data));
  };

  const getStatusColor = (status) => {
    switch(status) {
      case "OPEN": return "#e0e0e0";
      case "ASSIGNED": return "#e0e0e0";
      case "RESOLVED": return "#e0e0e0";
      default: return "#e0e0e0";
    }
  };

  return (
    <div style={styles.mainContainer}>
      {/* Header */}
      <div style={styles.header}>
        <div>
          <h1 style={styles.title}>Admin Dashboard</h1>
          <p style={styles.subtitle}>Manage All Complaints</p>
        </div>
        <LogoutButton />
      </div>

      {/* Stats */}
      <div style={styles.statsContainer}>
        <div style={styles.statCard}>
          <div style={styles.statNumber}>{complaints.length}</div>
          <div style={styles.statLabel}>Total Complaints</div>
        </div>
        <div style={styles.statCard}>
          <div style={styles.statNumber}>{complaints.filter(c => c.status === "OPEN").length}</div>
          <div style={styles.statLabel}>Open</div>
        </div>
        <div style={styles.statCard}>
          <div style={styles.statNumber}>{complaints.filter(c => c.status === "ASSIGNED").length}</div>
          <div style={styles.statLabel}>Assigned</div>
        </div>
        <div style={styles.statCard}>
          <div style={styles.statNumber}>{complaints.filter(c => c.status === "RESOLVED").length}</div>
          <div style={styles.statLabel}>Resolved</div>
        </div>
      </div>

      <div style={styles.contentContainer}>
        {/* Left: List of Complaints */}
        <div style={styles.listContainer}>
          <div style={styles.filtersContainer}>
            <input
              type="text"
              placeholder="Search complaints..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              style={styles.searchInput}
            />
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              style={styles.filterSelect}
            >
              <option value="ALL">All Status</option>
              <option value="OPEN">Open</option>
              <option value="ASSIGNED">Assigned</option>
              <option value="RESOLVED">Resolved</option>
            </select>
          </div>

          <div style={styles.complaintsList}>
            {filteredComplaints.length === 0 ? (
              <div style={styles.emptyState}>No complaints found</div>
            ) : (
              filteredComplaints.map(c => (
                <div
                  key={c.id}
                  style={{
                    ...styles.complaintItem,
                    backgroundColor: selectedComplaint?.id === c.id ? "#f0f0f0" : "white"
                  }}
                  onClick={() => setSelectedComplaint(c)}
                >
                  <div style={styles.complaintItemHeader}>
                    <h4 style={styles.complaintTitle}>{c.title}</h4>
                    <span style={{
                      ...styles.statusBadge,
                      backgroundColor: getStatusColor(c.status)
                    }}>
                      {c.status}
                    </span>
                  </div>
                  <p style={styles.complaintUser}>From: {c.user?.name}</p>
                  <p style={styles.complaintDate}>
                    {new Date(c.createdAt).toLocaleDateString()}
                  </p>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Right: Complaint Details */}
        <div style={styles.detailsContainer}>
        {selectedComplaint ? (
            <div style={styles.detailsCard}>
              <h2 style={styles.reportTitle}>Complaint Details</h2>
              
              <div style={styles.reportInfo}>
                <p><strong>Report Generated:</strong> {new Date().toLocaleDateString()}</p>
              </div>

              {/* Main Complaint Info Table */}
              <table style={styles.mainTable}>
                <tbody>
                  <tr>
                    <td style={styles.labelCell}><strong>ID:</strong></td>
                    <td style={styles.valueCell}>{selectedComplaint.id}</td>
                  </tr>
                  <tr>
                    <td style={styles.labelCell}><strong>Title:</strong></td>
                    <td style={styles.valueCell}>{selectedComplaint.title}</td>
                  </tr>
                  <tr>
                    <td style={styles.labelCell}><strong>Description:</strong></td>
                    <td style={styles.valueCell}>{selectedComplaint.description}</td>
                  </tr>
                  <tr>
                    <td style={styles.labelCell}><strong>Status:</strong></td>
                    <td style={styles.valueCell}>
                      <span style={{
                        ...styles.statusBadge,
                        backgroundColor: getStatusColor(selectedComplaint.status),
                        fontSize: "14px",
                        padding: "6px 12px"
                      }}>
                        {selectedComplaint.status}
                      </span>
                    </td>
                  </tr>
                  <tr>
                    <td style={styles.labelCell}><strong>Raised By:</strong></td>
                    <td style={styles.valueCell}>{selectedComplaint.user?.name}</td>
                  </tr>
                  <tr>
                    <td style={styles.labelCell}><strong>Email:</strong></td>
                    <td style={styles.valueCell}>{selectedComplaint.user?.email}</td>
                  </tr>
                  <tr>
                    <td style={styles.labelCell}><strong>Date Submitted:</strong></td>
                    <td style={styles.valueCell}>
                      {new Date(selectedComplaint.createdAt).toLocaleString()}
                    </td>
                  </tr>
                  <tr>
                    <td style={styles.labelCell}><strong>Assigned To:</strong></td>
                    <td style={styles.valueCell}>{selectedComplaint.employee?.name || "Not Assigned"}</td>
                  </tr>
                </tbody>
              </table>

              {/* Action Buttons */}
              <div style={styles.actionsContainer}>
                <h3 style={styles.actionsTitle}>Update Status</h3>
                <div style={styles.statusButtonsGrid}>
                  <button
                    style={{...styles.statusActionBtn}}
                    onClick={() => updateStatus(selectedComplaint.id, "OPEN")}
                  >
                    Mark as OPEN
                  </button>
                  <button
                    style={{...styles.statusActionBtn}}
                    onClick={() => updateStatus(selectedComplaint.id, "ASSIGNED")}
                  >
                    Mark as ASSIGNED
                  </button>
                  <button
                    style={{...styles.statusActionBtn}}
                    onClick={() => updateStatus(selectedComplaint.id, "RESOLVED")}
                  >
                    Mark as RESOLVED
                  </button>
                </div>
              </div>
            </div>
          ) : (
            <div style={styles.emptyDetails}>
              <p>👈 Select a complaint to view details</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

const styles = {
  mainContainer: {
    backgroundColor: "#f5f5f5",
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
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(150px, 1fr))",
    gap: "15px",
    marginBottom: "30px"
  },
  statCard: {
    backgroundColor: "white",
    padding: "20px",
    borderRadius: "10px",
    textAlign: "center",
    boxShadow: "0 2px 4px rgba(0,0,0,0.1)"
  },
  statNumber: {
    fontSize: "32px",
    fontWeight: "bold",
    color: "#333"
  },
  statLabel: {
    fontSize: "14px",
    color: "#666",
    marginTop: "5px"
  },
  contentContainer: {
    display: "grid",
    gridTemplateColumns: "1fr 1fr",
    gap: "20px"
  },
  listContainer: {
    backgroundColor: "white",
    borderRadius: "10px",
    padding: "20px",
    boxShadow: "0 2px 4px rgba(0,0,0,0.1)"
  },
  filtersContainer: {
    display: "flex",
    gap: "10px",
    marginBottom: "20px"
  },
  searchInput: {
    flex: 1,
    padding: "10px",
    border: "1px solid #ddd",
    borderRadius: "5px",
    fontSize: "14px"
  },
  filterSelect: {
    padding: "10px",
    border: "1px solid #ddd",
    borderRadius: "5px",
    backgroundColor: "white",
    cursor: "pointer"
  },
  complaintsList: {
    maxHeight: "600px",
    overflowY: "auto"
  },
  complaintItem: {
    padding: "15px",
    marginBottom: "10px",
    backgroundColor: "white",
    borderRadius: "5px",
    cursor: "pointer",
    transition: "all 0.3s",
    border: "1px solid #eee"
  },
  complaintItemHeader: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "start",
    marginBottom: "8px"
  },
  complaintTitle: {
    margin: "0",
    fontSize: "15px",
    color: "#333",
    flex: 1
  },
  statusBadge: {
    color: "#333",
    padding: "6px 14px",
    borderRadius: "20px",
    fontSize: "12px",
    fontWeight: "bold",
    whiteSpace: "nowrap",
    marginLeft: "10px",
    backgroundColor: "#e0e0e0",
    border: "1px solid #ccc"
  },
  complaintUser: {
    fontSize: "13px",
    color: "#666",
    margin: "5px 0"
  },
  complaintDate: {
    fontSize: "12px",
    color: "#999",
    margin: "0"
  },
  emptyState: {
    textAlign: "center",
    padding: "40px 20px",
    color: "#999",
    fontSize: "14px"
  },
  detailsContainer: {
    backgroundColor: "white",
    borderRadius: "10px",
    padding: "20px",
    boxShadow: "0 2px 4px rgba(0,0,0,0.1)",
    maxHeight: "700px",
    overflowY: "auto"
  },
  detailsCard: {
    height: "100%"
  },
  reportTitle: {
    margin: "0 0 15px 0",
    fontSize: "24px",
    color: "#333",
    textAlign: "center",
    borderBottom: "3px solid #333",
    paddingBottom: "12px"
  },
  reportInfo: {
    fontSize: "13px",
    color: "#666",
    marginBottom: "20px",
    paddingBottom: "10px",
    borderBottom: "1px solid #eee"
  },
  mainTable: {
    width: "100%",
    borderCollapse: "collapse",
    marginBottom: "20px",
    border: "1px solid #ddd"
  },
  labelCell: {
    padding: "12px",
    backgroundColor: "#f9f9f9",
    borderRight: "1px solid #ddd",
    borderBottom: "1px solid #ddd",
    width: "30%",
    fontSize: "14px",
    color: "#333"
  },
  valueCell: {
    padding: "12px",
    borderBottom: "1px solid #ddd",
    fontSize: "14px",
    color: "#555",
    wordBreak: "break-word"
  },
  actionsContainer: {
    marginTop: "20px",
    borderTop: "2px solid #eee",
    paddingTop: "20px"
  },
  actionsTitle: {
    margin: "0 0 15px 0",
    fontSize: "16px",
    color: "#333"
  },
  statusButtonsGrid: {
    display: "grid",
    gridTemplateColumns: "1fr 1fr 1fr",
    gap: "10px"
  },
  statusActionBtn: {
    padding: "12px",
    color: "white",
    border: "none",
    borderRadius: "5px",
    cursor: "pointer",
    fontSize: "14px",
    fontWeight: "bold",
    transition: "all 0.3s",
    textAlign: "center",
    backgroundColor: "#007bff"
  },
  emptyDetails: {
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    height: "100%",
    color: "#999",
    fontSize: "16px"
  }
};

export default AdminDashboard;
