import { Link } from "react-router-dom";
import { FaHome, FaUser, FaUserTie, FaUsers } from "react-icons/fa";

function Navbar() {
  return (
    <div style={{
      background: "white",
      padding: "15px 30px",
      display: "flex",
      justifyContent: "space-between",
      alignItems: "center",
      boxShadow: "0 4px 10px rgba(0,0,0,0.1)"
    }}>
      <h2 style={{ color: "#667eea" }}>ResolveIt</h2>
      <div style={{ display: "flex", gap: "20px" }}>
        <Link to="/" ><FaHome /> Login</Link>
        <Link to="/user"><FaUser /> User</Link>
        <Link to="/admin"><FaUserTie /> Admin</Link>
        <Link to="/employee"><FaUsers /> Employee</Link>
      </div>
    </div>
  );
}

export default Navbar;
