import { useEffect, useState } from "react";
import api from "../api/api";
import { useNavigate } from "react-router-dom";
import LogoutButton from "../components/LogoutButton";

function EmployeeRequests() {
  const [requests, setRequests] = useState([]);
  const [selectedRequest, setSelectedRequest] = useState(null);
  const [filterStatus, setFilterStatus] = useState("ALL");
  const [searchTerm, setSearchTerm] = useState("");
  const [filteredRequests, setFilteredRequests] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    const userId = localStorage.getItem("userId");
    api.get(`/user/${userId}/requests`)
      .then(res => setRequests(res.data))
      .catch(err => console.error(err));
  }, []);

  useEffect(() => {
    let filtered = requests;

    if (filterStatus !== "ALL") {
      filtered = filtered.filter(r => r.status === filterStatus);
    }

    if (searchTerm) {
      filtered = filtered.filter(r =>
        r.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        r.description.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    setFilteredRequests(filtered);
  }, [searchTerm, filterStatus, requests]);

  const getStatusColor = (status) => {
    switch(status) {
      case "OPEN": return "#ff6b6b";
      case "IN_PROGRESS": return "#ffa500";
      case "COMPLETED": return "#51cf66";
      default: return "#666";
    }
  };

  return (
    <div style={styles.mainContainer}>
      {/* Header */}
      <div style={styles.header}>
        <div>
          <h1 style={styles.title}>Employee Requests</h1>
          <p style={styles.subtitle}>Track requests assigned to employees</p>
        </div>
        <LogoutButton />
      </div>

      {/* Stats */}
      <div style={styles.statsContainer}>
        <div style={styles.statCard}>
          <div style={styles.statNumber}>{requests.length}</div>
          <div style={styles.statLabel}>Total Requests</div>
        </div>
        <div style={styles.statCard}>
          <div style={styles.statNumber}>{requests.filter(r => r.status === "OPEN").length}</div>
          <div style={styles.statLabel}>Open</div>
        </div>
        <div style={styles.statCard}>
          <div style={styles.statNumber}>{requests.filter(r => r.status === "IN_PROGRESS").length}</div>
          <div style={styles.statLabel}>In Progress</div>
        </div>
        <div style={styles.statCard}>
          <div style={styles.statNumber}>{requests.filter(r => r.status === "COMPLETED").length}</div>
          <div style={styles.statLabel}>Completed</div>
        </div>
      </div>

      <div style={styles.contentContainer}>
        {/* Left: List of Requests */}
        <div style={styles.listContainer}>
          <div style={styles.filtersContainer}>
            <input
              type="text"
              placeholder="Search requests..."
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
              <option value="IN_PROGRESS">In Progress</option>
              <option value="COMPLETED">Completed</option>
            </select>
          </div>

          <div style={styles.requestsList}>
            {filteredRequests.length === 0 ? (
              <div style={styles.emptyState}>No requests found</div>
            ) : (
              filteredRequests.map(r => (
                <div
                  key={r.id}
                  style={{
                    ...styles.requestItem,
                    borderLeft: `4px solid ${getStatusColor(r.status)}`,
                    backgroundColor: selectedRequest?.id === r.id ? "#f0f0f0" : "white"
                  }}
                  onClick={() => setSelectedRequest(r)}
                >
                  <div style={styles.requestItemHeader}>
                    <h4 style={styles.requestTitle}>{r.title}</h4>
                    <span style={{
                      ...styles.statusBadge,
                      backgroundColor: getStatusColor(r.status)
                    }}>
                      {r.status.replace("_", " ")}
                    </span>
                  </div>
                  <p style={styles.requestEmployee}>Assigned to: {r.employee?.name}</p>
                  <p style={styles.requestDate}>
                    {new Date(r.createdAt).toLocaleDateString()}
                  </p>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Right: Request Details */}
        <div style={styles.detailsContainer}>
          {selectedRequest ? (
            <div style={styles.detailsCard}>
              <h2 style={styles.reportTitle}>Request Details</h2>
              
              <div style={styles.reportInfo}>
                <p><strong>Report Generated:</strong> {new Date().toLocaleDateString()}</p>
              </div>

              {/* Main Request Info Table */}
              <table style={styles.mainTable}>
                <tbody>
                  <tr>
                    <td style={styles.labelCell}><strong>ID:</strong></td>
                    <td style={styles.valueCell}>{selectedRequest.id}</td>
                  </tr>
                  <tr>
                    <td style={styles.labelCell}><strong>Title:</strong></td>
                    <td style={styles.valueCell}>{selectedRequest.title}</td>
                  </tr>
                  <tr>
                    <td style={styles.labelCell}><strong>Description:</strong></td>
                    <td style={styles.valueCell}>{selectedRequest.description}</td>
                  </tr>
                  <tr>
                    <td style={styles.labelCell}><strong>Status:</strong></td>
                    <td style={styles.valueCell}>
                      <span style={{
                        ...styles.statusBadge,
                        backgroundColor: getStatusColor(selectedRequest.status),
                        fontSize: "14px",
                        padding: "6px 12px"
                      }}>
                        {selectedRequest.status.replace("_", " ")}
                      </span>
                    </td>
                  </tr>
                  <tr>
                    <td style={styles.labelCell}><strong>Assigned to:</strong></td>
                    <td style={styles.valueCell}>{selectedRequest.employee?.name}</td>
                  </tr>
                  <tr>
                    <td style={styles.labelCell}><strong>Employee Email:</strong></td>
                    <td style={styles.valueCell}>{selectedRequest.employee?.email}</td>
                  </tr>
                  <tr>
                    <td style={styles.labelCell}><strong>Date Assigned:</strong></td>
                    <td style={styles.valueCell}>
                      {new Date(selectedRequest.createdAt).toLocaleString()}
                    </td>
                  </tr>
                  <tr>
                    <td style={styles.labelCell}><strong>Last Updated:</strong></td>
                    <td style={styles.valueCell}>
                      {new Date(selectedRequest.updatedAt).toLocaleString()}
                    </td>
                  </tr>
                </tbody>
              </table>

              {/* Action Buttons */}
              <div style={styles.actionsContainer}>
                <button style={{...styles.backBtn}} onClick={() => navigate("/user")}>
                  ← Back to Dashboard
                </button>
              </div>
            </div>
          ) : (
            <div style={styles.emptyDetails}>
              <p>👈 Select a request to view details</p>
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
  requestsList: {
    maxHeight: "600px",
    overflowY: "auto"
  },
  requestItem: {
    padding: "15px",
    marginBottom: "10px",
    backgroundColor: "white",
    borderRadius: "5px",
    cursor: "pointer",
    transition: "all 0.3s",
    border: "1px solid #eee"
  },
  requestItemHeader: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "start",
    marginBottom: "8px"
  },
  requestTitle: {
    margin: "0",
    fontSize: "15px",
    color: "#333",
    flex: 1
  },
  statusBadge: {
    color: "white",
    padding: "4px 12px",
    borderRadius: "20px",
    fontSize: "12px",
    fontWeight: "bold",
    whiteSpace: "nowrap",
    marginLeft: "10px"
  },
  requestEmployee: {
    fontSize: "13px",
    color: "#666",
    margin: "5px 0"
  },
  requestDate: {
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
  backBtn: {
    padding: "12px 24px",
    backgroundColor: "#007bff",
    color: "white",
    border: "none",
    borderRadius: "5px",
    cursor: "pointer",
    fontSize: "14px",
    fontWeight: "bold",
    transition: "all 0.3s",
    width: "100%"
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

export default EmployeeRequests;
