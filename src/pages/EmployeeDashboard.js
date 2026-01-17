import { useState, useEffect } from "react";
import api from "../api/api";
import { useNavigate } from "react-router-dom";
import LogoutButton from "../components/LogoutButton";

function EmployeeDashboard() {
  const navigate = useNavigate();
  const [assignedTasks, setAssignedTasks] = useState([]);
  const [completedTasks, setCompletedTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [selectedTask, setSelectedTask] = useState(null);
  const [updateNote, setUpdateNote] = useState("");
  const [activeTab, setActiveTab] = useState("assigned");

  const employeeId = localStorage.getItem("userId");
  const role = localStorage.getItem("role");

  // Validate Role
  useEffect(() => {
    const validRoles = ["EMPLOYEE", "MANAGER", "SENIOR_MANAGER"];
    if (!validRoles.includes(role)) {
      navigate("/");
    } else {
      fetchTasks();
    }
  }, [role, navigate]);

  const fetchTasks = async () => {
    setLoading(true);
    try {
      // Matches: @GetMapping("/admin/complaints/assigned/{employeeId}")
      const res = await api.get(`/admin/complaints/assigned/${employeeId}`, {
        headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
      });
      
      const allTasks = res.data;
      setAssignedTasks(allTasks.filter((t) => t.status !== "RESOLVED"));
      setCompletedTasks(allTasks.filter((t) => t.status === "RESOLVED"));
    } catch (err) {
      setError("Failed to fetch assigned tasks.");
    } finally {
      setLoading(false);
    }
  };

  const updateComplaintStatus = async (complaintId, newStatus) => {
    try {
      // Matches the DTO logic in the controller
      await api.put(
        `/admin/complaints/${complaintId}/status`,
        {
          status: newStatus,
          note: updateNote,
          employeeId: employeeId,
        },
        {
          headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
        }
      );
      setUpdateNote("");
      setSelectedTask(null);
      fetchTasks();
    } catch (err) {
      alert("Failed to update status. Ensure notes are provided.");
    }
  };

  const getStatusColor = (status) => {
    switch (status?.toUpperCase()) {
      case "ASSIGNED": return "#2196f3";
      case "IN_PROGRESS": return "#1976d2";
      case "RESOLVED": return "#4caf50";
      case "ESCALATED": return "#f44336";
      default: return "#9e9e9e";
    }
  };

  if (loading) return <div style={styles.container}><p>Loading your duties...</p></div>;

  const currentTasks = activeTab === "assigned" ? assignedTasks : completedTasks;

  return (
    <div style={styles.container}>
      <div style={styles.header}>
        <div>
          <h1 style={styles.title}>Employee Portal</h1>
          <p style={styles.subtitle}>Welcome back! You have {assignedTasks.length} active tasks.</p>
        </div>
        <LogoutButton />
      </div>

      <div style={styles.content}>
        {error && <div style={styles.error}>{error}</div>}

        <div style={styles.tabsContainer}>
          <button
            onClick={() => setActiveTab("assigned")}
            style={{
              ...styles.tab,
              backgroundColor: activeTab === "assigned" ? "#2196f3" : "#f0f0f0",
              color: activeTab === "assigned" ? "white" : "black",
            }}
          >
            My Active Tasks ({assignedTasks.length})
          </button>
          <button
            onClick={() => setActiveTab("completed")}
            style={{
              ...styles.tab,
              backgroundColor: activeTab === "completed" ? "#2196f3" : "#f0f0f0",
              color: activeTab === "completed" ? "white" : "black",
            }}
          >
            Completed Tasks ({completedTasks.length})
          </button>
        </div>

        <div style={styles.section}>
          {currentTasks.length === 0 ? (
            <p style={styles.emptyMessage}>No tasks found in this category.</p>
          ) : (
            <div style={styles.tasksGrid}>
              {currentTasks.map((task) => (
                <div key={task.id} style={styles.taskCard}>
                  <div style={styles.cardHeader}>
                    <h3>{task.title}</h3>
                    <span style={{ ...styles.statusBadge, backgroundColor: getStatusColor(task.status) }}>
                      {task.status}
                    </span>
                  </div>
                  <p style={styles.description}>{task.description}</p>
                  
                  {task.status === "ESCALATED" && (
                    <div style={styles.escalationAlert}>⚠️ Priority: High (Escalated)</div>
                  )}

                  <div style={styles.cardFooter}>
                    <small>Received: {new Date(task.createdAt).toLocaleDateString()}</small>
                  </div>

                  <div style={styles.cardActions}>
                    {task.status === "ASSIGNED" && (
                      <button onClick={() => setSelectedTask(task)} style={{ ...styles.button, backgroundColor: "#2196f3" }}>
                        Start Work
                      </button>
                    )}
                    {task.status === "IN_PROGRESS" && (
                      <button onClick={() => setSelectedTask(task)} style={{ ...styles.button, backgroundColor: "#4caf50" }}>
                        Submit Resolution
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {selectedTask && (
          <div style={styles.modal}>
            <div style={styles.modalContent}>
              <h3>Update Progress</h3>
              <p>Task: {selectedTask.title}</p>
              <textarea
                style={styles.textarea}
                placeholder="Enter progress notes or resolution details..."
                value={updateNote}
                onChange={(e) => setUpdateNote(e.target.value)}
              />
              <div style={styles.modalActions}>
                <button 
                  onClick={() => updateComplaintStatus(
                    selectedTask.id, 
                    selectedTask.status === "ASSIGNED" ? "IN_PROGRESS" : "RESOLVED"
                  )} 
                  style={{ ...styles.button, backgroundColor: "#4caf50" }}
                >
                  Confirm
                </button>
                <button onClick={() => setSelectedTask(null)} style={{ ...styles.button, backgroundColor: "#9e9e9e" }}>
                  Cancel
                </button>
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
  title: { fontSize: "28px", margin: "0", color: "#333" },
  subtitle: { fontSize: "14px", color: "#666" },
  content: { padding: "0 40px", maxWidth: "1200px", margin: "0 auto" },
  tabsContainer: { display: "flex", gap: "10px", marginBottom: "20px" },
  tab: { padding: "10px 20px", border: "none", borderRadius: "4px", cursor: "pointer", fontWeight: "bold" },
  section: { backgroundColor: "white", padding: "20px", borderRadius: "8px", boxShadow: "0 2px 4px rgba(0,0,0,0.1)" },
  tasksGrid: { display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))", gap: "20px" },
  taskCard: { border: "1px solid #eee", padding: "15px", borderRadius: "8px" },
  cardHeader: { display: "flex", justifyContent: "space-between", marginBottom: "10px" },
  statusBadge: { padding: "4px 8px", borderRadius: "12px", color: "#fff", fontSize: "11px", fontWeight: "bold" },
  description: { fontSize: "14px", color: "#555", height: "50px", overflow: "hidden" },
  escalationAlert: { color: "#f44336", fontWeight: "bold", fontSize: "12px", marginTop: "5px" },
  cardFooter: { marginTop: "10px", fontSize: "11px", color: "#999" },
  cardActions: { marginTop: "15px", display: "flex", gap: "10px" },
  button: { border: "none", padding: "8px 15px", borderRadius: "4px", color: "#fff", cursor: "pointer" },
  modal: { position: "fixed", top: 0, left: 0, width: "100%", height: "100%", background: "rgba(0,0,0,0.5)", display: "flex", justifyContent: "center", alignItems: "center" },
  modalContent: { background: "#fff", padding: "20px", borderRadius: "8px", width: "400px" },
  textarea: { width: "100%", height: "100px", marginTop: "10px", padding: "10px", boxSizing: "border-box" },
  modalActions: { display: "flex", gap: "10px", marginTop: "15px" },
  error: { color: "red", marginBottom: "10px" }
};

export default EmployeeDashboard;