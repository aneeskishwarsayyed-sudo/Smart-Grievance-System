import { useState } from "react";
import api from "../api/api"; // Ensure this path is correct
import { useNavigate } from "react-router-dom";

function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const validateEmail = (email) => {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  };

  const login = async () => {
    setError("");

    // --- Validations ---
    if (!email.trim() || !password.trim()) {
      setError("Please enter both email and password");
      return;
    }

    if (!validateEmail(email)) {
      setError("Please enter a valid email address");
      return;
    }

    setLoading(true);

    try {
      // 1. Send request to Backend
      const res = await api.post("/auth/login", { email, password });

      // 2. Store user data in LocalStorage
      // Note: Backend should return an object with { id, role, token }
      if (res.data) {
        localStorage.setItem("userId", res.data.id);
        localStorage.setItem("role", res.data.role);
        if (res.data.token) {
          localStorage.setItem("token", res.data.token);
        }

        // 3. Role-Based Navigation
        const role = res.data.role;
        if (role === "ADMIN") {
          navigate("/admin");
        } else if (role === "EMPLOYEE") {
          navigate("/employee");
        } else {
          navigate("/user");
        }
      }
    } catch (err) {
      console.error("Login Error:", err);
      // Handle specific error messages from Backend
      const message = err.response?.data?.message || "Invalid email or password";
      setError(message);
    } finally {
      setLoading(false);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === "Enter") {
      login();
    }
  };

  return (
    <div style={styles.wrapper}>
      <div style={styles.backgroundSection}></div>
      <div style={styles.container}>
        {/* Left Section - Branding */}
        <div style={styles.leftSection}>
          <div style={styles.contentBox}>
            <div style={styles.logoBox}>
              <span style={styles.logoIcon}>📋</span>
            </div>
            <h1 style={styles.mainTitle}>ResolveIT</h1>
            <p style={styles.mainSubtitle}>Smart Grievance Management</p>
            
            <div style={styles.benefitsSection}>
              <BenefitItem title="Secure & Private" desc="Your complaints are handled with complete confidentiality" />
              <BenefitItem title="Real-time Updates" desc="Track your complaint status instantly" />
              <BenefitItem title="Quick Resolution" desc="Efficient grievance handling process" />
            </div>
          </div>
        </div>

        {/* Right Section - Login Form */}
        <div style={styles.rightSection}>
          <div style={styles.formCard}>
            <div style={styles.formHeader}>
              <h2 style={styles.formTitle}>Sign In</h2>
              <p style={styles.formSubtitle}>Access your account</p>
            </div>

            {error && (
              <div style={styles.alertBox}>
                <span style={styles.alertIcon}>⚠️</span>
                <span style={styles.alertText}>{error}</span>
              </div>
            )}

            <div style={styles.inputGroup}>
              <label style={styles.inputLabel}>Email Address</label>
              <input
                type="email"
                placeholder="name@company.com"
                value={email}
                onChange={e => { setEmail(e.target.value); setError(""); }}
                onKeyPress={handleKeyPress}
                style={styles.inputField}
                disabled={loading}
              />
            </div>

            <div style={styles.inputGroup}>
              <label style={styles.inputLabel}>Password</label>
              <input
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={e => { setPassword(e.target.value); setError(""); }}
                onKeyPress={handleKeyPress}
                style={styles.inputField}
                disabled={loading}
              />
            </div>

            <button
              style={{...styles.loginBtn, opacity: loading ? 0.7 : 1}}
              onClick={login}
              disabled={loading}
            >
              {loading ? "Signing in..." : "Sign In"}
            </button>

            <div style={styles.divider}><span>or</span></div>

            <div style={styles.signupSection}>
              <p style={styles.signupText}>
                Don't have an account? 
                <button
                  style={styles.signupBtn}
                  onClick={() => navigate("/signup")}
                  disabled={loading}
                >
                  Create Account
                </button>
              </p>
            </div>
          </div>
          <div style={styles.formFooter}>
            <p style={styles.footerText}>© 2026 ResolveIT. All rights reserved.</p>
          </div>
        </div>
      </div>
    </div>
  );
}

// Small helper component for the list items
const BenefitItem = ({ title, desc }) => (
  <div style={styles.benefitRow}>
    <div style={styles.benefitDot}></div>
    <div style={styles.benefitText}>
      <h3 style={styles.benefitTitle}>{title}</h3>
      <p style={styles.benefitDesc}>{desc}</p>
    </div>
  </div>
);

const styles = {
  wrapper: { display: "flex", minHeight: "100vh", backgroundColor: "#F8F6F1", position: "relative", fontFamily: "'Segoe UI', Roboto, Helvetica, Arial, sans-serif" },
  backgroundSection: { position: "absolute", left: 0, top: 0, width: "50%", height: "100%", background: "linear-gradient(135deg, #E67E22 0%, #D35400 100%)", zIndex: 1 },
  container: { display: "grid", gridTemplateColumns: "1fr 1fr", width: "100%", position: "relative", zIndex: 2 },
  leftSection: { display: "flex", alignItems: "center", justifyContent: "center", padding: "60px 50px", color: "white" },
  contentBox: { maxWidth: "400px" },
  logoBox: { display: "inline-flex", alignItems: "center", justifyContent: "center", width: "70px", height: "70px", backgroundColor: "rgba(255,255,255,0.15)", borderRadius: "16px", marginBottom: "25px", backdropFilter: "blur(10px)" },
  logoIcon: { fontSize: "32px" },
  mainTitle: { fontSize: "42px", fontWeight: "700", margin: "0 0 10px 0" },
  mainSubtitle: { fontSize: "16px", color: "rgba(255,255,255,0.8)", margin: "0 0 40px 0" },
  benefitsSection: { display: "flex", flexDirection: "column", gap: "25px" },
  benefitRow: { display: "flex", gap: "16px", alignItems: "flex-start" },
  benefitDot: { width: "8px", height: "8px", backgroundColor: "rgba(255,255,255,0.6)", borderRadius: "50%", marginTop: "6px" },
  benefitText: { flex: 1 },
  benefitTitle: { fontSize: "16px", fontWeight: "600", margin: "0 0 4px 0" },
  benefitDesc: { fontSize: "13px", color: "rgba(255,255,255,0.7)", margin: "0", lineHeight: "1.4" },
  rightSection: { display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: "60px 50px" },
  formCard: { width: "100%", maxWidth: "380px", backgroundColor: "white", borderRadius: "20px", padding: "40px", boxShadow: "0 10px 30px rgba(0,0,0,0.05)", border: "1px solid #E8DFD0" },
  formHeader: { marginBottom: "30px", textAlign: "center" },
  formTitle: { fontSize: "28px", fontWeight: "700", color: "#2C2C2C", margin: "0 0 8px 0" },
  formSubtitle: { fontSize: "14px", color: "#7A7A7A", margin: "0" },
  alertBox: { backgroundColor: "#FFF1F1", border: "1px solid #FFC1C1", borderRadius: "10px", padding: "12px", marginBottom: "20px", display: "flex", alignItems: "center", gap: "10px", color: "#D32F2F", fontSize: "13px" },
  inputGroup: { marginBottom: "18px" },
  inputLabel: { display: "block", fontSize: "13px", fontWeight: "600", color: "#444", marginBottom: "8px" },
  inputField: { width: "100%", padding: "12px", border: "1px solid #DDD", borderRadius: "8px", fontSize: "14px", outline: "none", transition: "border 0.2s" },
  loginBtn: { width: "100%", padding: "14px", backgroundColor: "#E67E22", color: "white", border: "none", borderRadius: "8px", fontSize: "15px", fontWeight: "700", cursor: "pointer", marginTop: "10px" },
  divider: { display: "flex", alignItems: "center", margin: "25px 0", color: "#AAA", fontSize: "12px", gap: "10px" },
  signupSection: { textAlign: "center" },
  signupText: { fontSize: "13px", color: "#666" },
  signupBtn: { background: "none", border: "none", color: "#E67E22", fontWeight: "700", cursor: "pointer", marginLeft: "5px" },
  formFooter: { marginTop: "20px" },
  footerText: { fontSize: "11px", color: "#AAA" }
};

export default Login;