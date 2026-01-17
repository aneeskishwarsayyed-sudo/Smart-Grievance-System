import { useState, useEffect } from "react";
import api from "../api/api";

function NotificationBell() {
  const [notifications, setNotifications] = useState([]);
  const [showDrawer, setShowDrawer] = useState(false);
  const userId = localStorage.getItem("userId");

  useEffect(() => {
    if (userId) fetchNotifications();
  }, [userId]);

  const fetchNotifications = async () => {
    try {
      const res = await api.get(`/notifications/user/${userId}`);
      setNotifications(res.data);
    } catch (err) {
      console.error("Error fetching notifications");
    }
  };

  return (
    <div style={{ position: "relative", cursor: "pointer" }}>
      <div onClick={() => setShowDrawer(!showDrawer)} style={styles.bellIcon}>
        🔔 {notifications.length > 0 && <span style={styles.badge}>{notifications.length}</span>}
      </div>

      {showDrawer && (
        <div style={styles.drawer}>
          <h4 style={{ margin: "0 0 10px 0" }}>Notifications</h4>
          {notifications.length === 0 ? <p style={{fontSize: '12px'}}>No new alerts</p> : (
            notifications.map((n) => (
              <div key={n.id} style={styles.notifItem}>
                <p style={{ margin: 0, fontSize: "13px" }}>{n.message}</p>
                <small style={{ color: "#888" }}>{new Date(n.createdAt).toLocaleString()}</small>
              </div>
            ))
          )}
        </div>
      )}
    </div>
  );
}

const styles = {
  bellIcon: { fontSize: "24px", position: "relative" },
  badge: { position: "absolute", top: "-5px", right: "-5px", backgroundColor: "red", color: "white", borderRadius: "50%", padding: "2px 6px", fontSize: "10px" },
  drawer: { position: "absolute", top: "40px", right: "0", width: "250px", backgroundColor: "white", boxShadow: "0 4px 12px rgba(0,0,0,0.15)", borderRadius: "8px", padding: "15px", zIndex: 1000, maxHeight: "300px", overflowY: "auto" },
  notifItem: { borderBottom: "1px solid #eee", padding: "8px 0" }
};

export default NotificationBell;