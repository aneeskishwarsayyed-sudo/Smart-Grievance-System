import { useEffect, useState } from "react";
import api from "../api/api";

function AllComplaintsSheet() {
  const [complaints, setComplaints] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchComplaints();
  }, []);

  const fetchComplaints = async () => {
    try {
      const res = await api.get("/admin/complaints/all", {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      });
      setComplaints(res.data || []);
    } catch (err) {
      console.error("Failed to fetch complaints", err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <p style={{ padding: 30 }}>Loading complaints...</p>;
  }

  return (
    <div style={styles.page}>
      <div style={styles.card}>
        <h2 style={styles.title}>📊 Complaints Master Report</h2>
        <p style={styles.count}>Total Complaints: {complaints.length}</p>

        <table style={styles.table}>
          <thead>
            <tr>
              <th style={styles.th}>S.No</th>
              <th style={styles.th}>Complaint ID</th>
              <th style={styles.th}>Title</th>
              <th style={styles.th}>Raised By</th>
              <th style={styles.th}>Created Date</th>
              <th style={styles.th}>Assigned?</th>
              <th style={styles.th}>Assigned To</th>
              <th style={styles.th}>Status</th>
              <th style={styles.th}>Notes / Progress</th>
            </tr>
          </thead>

          <tbody>
            {complaints.length === 0 ? (
              <tr>
                <td colSpan="9" style={styles.empty}>
                  No complaints found
                </td>
              </tr>
            ) : (
              complaints.map((c, index) => (
                <tr key={c.id} style={styles.row}>
                  <td style={styles.td}>{index + 1}</td>
                  <td style={styles.td}>{c.id}</td>
                  <td style={styles.td}>{c.title}</td>
                  <td style={styles.td}>{c.user?.email || "-"}</td>
                  <td style={styles.td}>
                    {c.createdAt
                      ? new Date(c.createdAt).toLocaleString()
                      : "-"}
                  </td>
                  <td style={styles.td}>{c.employee ? "YES" : "NO"}</td>
                  <td style={styles.td}>{c.employee?.email || "-"}</td>
                  <td style={styles.td}>
                    <span style={getStatusStyle(c.status)}>
                      {c.status}
                    </span>
                  </td>
                  <td style={styles.td}>{c.notes || "-"}</td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

/* ---------------- STYLES ---------------- */

const styles = {
  page: {
    padding: "30px",
    backgroundColor: "#f5f6fa",
    minHeight: "100vh",
  },
  card: {
    backgroundColor: "#ffffff",
    borderRadius: "10px",
    padding: "25px",
    boxShadow: "0 4px 10px rgba(0,0,0,0.1)",
  },
  title: {
    marginBottom: "10px",
  },
  count: {
    marginBottom: "20px",
    color: "#555",
  },
  table: {
    width: "100%",
    borderCollapse: "separate",
    borderSpacing: "0 10px", // ✅ SPACE BETWEEN ROWS
  },
  th: {
    textAlign: "left",
    padding: "12px",
    backgroundColor: "#f0f2f5",
    fontSize: "14px",
  },
  row: {
    backgroundColor: "#fafafa",
    boxShadow: "0 1px 3px rgba(0,0,0,0.08)",
  },
  td: {
    padding: "12px",
    fontSize: "14px",
  },
  empty: {
    textAlign: "center",
    padding: "20px",
    color: "#777",
  },
};

const getStatusStyle = (status) => {
  let bg = "#9e9e9e";
  if (status === "OPEN" || status === "PENDING") bg = "#ff9800";
  if (status === "ASSIGNED") bg = "#2196f3";
  if (status === "IN_PROGRESS") bg = "#673ab7";
  if (status === "ESCALATED") bg = "#f44336";
  if (status === "RESOLVED") bg = "#4caf50";

  return {
    backgroundColor: bg,
    color: "white",
    padding: "4px 10px",
    borderRadius: "12px",
    fontSize: "12px",
    fontWeight: "bold",
  };
};

export default AllComplaintsSheet;
