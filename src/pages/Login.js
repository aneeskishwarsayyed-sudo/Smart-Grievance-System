import { useState } from "react";
import api from "../api/api";
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

    if (!email.trim()) {
      setError("Please enter your email");
      return;
    }

    if (!validateEmail(email)) {
      setError("Please enter a valid email");
      return;
    }

    if (!password.trim()) {
      setError("Please enter your password");
      return;
    }

    if (password.length < 6) {
      setError("Password must be at least 6 characters");
      return;
    }

    setLoading(true);
    try {
      const res = await api.post("/auth/login", { email, password });

      localStorage.setItem("userId", res.data.id);
      localStorage.setItem("role", res.data.role);

      if (res.data.role === "ADMIN") navigate("/admin");
      else if (res.data.role === "EMPLOYEE") navigate("/employee");
      else navigate("/user");

    } catch (err) {
      setError(err.response?.data?.message || "Login failed. Please try again.");
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
      {/* Background Section */}
      <div style={styles.backgroundSection}></div>
      
      {/* Main Container */}
      <div style={styles.container}>
        {/* Left Section - Illustration */}
        <div style={styles.leftSection}>
          <div style={styles.contentBox}>
            <div style={styles.logoBox}>
              <span style={styles.logoIcon}>📋</span>
            </div>
            <h1 style={styles.mainTitle}>ResolveIT</h1>
            <p style={styles.mainSubtitle}>Smart Grievance Management</p>
            
            <div style={styles.benefitsSection}>
              <div style={styles.benefitRow}>
                <div style={styles.benefitDot}></div>
                <div style={styles.benefitText}>
                  <h3 style={styles.benefitTitle}>Secure & Private</h3>
                  <p style={styles.benefitDesc}>Your complaints are handled with complete confidentiality</p>
                </div>
              </div>
              
              <div style={styles.benefitRow}>
                <div style={styles.benefitDot}></div>
                <div style={styles.benefitText}>
                  <h3 style={styles.benefitTitle}>Real-time Updates</h3>
                  <p style={styles.benefitDesc}>Track your complaint status instantly</p>
                </div>
              </div>
              
              <div style={styles.benefitRow}>
                <div style={styles.benefitDot}></div>
                <div style={styles.benefitText}>
                  <h3 style={styles.benefitTitle}>Quick Resolution</h3>
                  <p style={styles.benefitDesc}>Efficient grievance handling process</p>
                </div>
              </div>
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

            {/* Error Message */}
            {error && (
              <div style={styles.alertBox}>
                <span style={styles.alertIcon}>⚠️</span>
                <span style={styles.alertText}>{error}</span>
              </div>
            )}

            {/* Email Input */}
            <div style={styles.inputGroup}>
              <label style={styles.inputLabel}>Email Address</label>
              <input
                type="email"
                placeholder="name@company.com"
                value={email}
                onChange={e => {
                  setEmail(e.target.value);
                  setError("");
                }}
                onKeyPress={handleKeyPress}
                style={styles.inputField}
                disabled={loading}
              />
            </div>

            {/* Password Input */}
            <div style={styles.inputGroup}>
              <label style={styles.inputLabel}>Password</label>
              <input
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={e => {
                  setPassword(e.target.value);
                  setError("");
                }}
                onKeyPress={handleKeyPress}
                style={styles.inputField}
                disabled={loading}
              />
            </div>

            {/* Login Button */}
            <button
              style={{...styles.loginBtn, opacity: loading ? 0.7 : 1}}
              onClick={login}
              disabled={loading}
            >
              {loading ? "Signing in..." : "Sign In"}
            </button>

            {/* Divider */}
            <div style={styles.divider}>
              <span>or</span>
            </div>

            {/* Sign Up Link */}
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

          {/* Footer */}
          <div style={styles.formFooter}>
            <p style={styles.footerText}>© 2026 ResolveIT. All rights reserved.</p>
          </div>
        </div>
      </div>
    </div>
  );
}

const styles = {
  wrapper: {
    display: "flex",
    minHeight: "100vh",
    backgroundColor: "#F8F6F1",
    position: "relative"
  },
  backgroundSection: {
    position: "absolute",
    left: 0,
    top: 0,
    width: "50%",
    height: "100%",
    background: "linear-gradient(135deg, #E67E22 0%, #D35400 100%)",
    zIndex: 1
  },
  container: {
    display: "grid",
    gridTemplateColumns: "1fr 1fr",
    width: "100%",
    position: "relative",
    zIndex: 2
  },
  leftSection: {
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    padding: "60px 50px",
    color: "white"
  },
  contentBox: {
    maxWidth: "400px"
  },
  logoBox: {
    display: "inline-flex",
    alignItems: "center",
    justifyContent: "center",
    width: "80px",
    height: "80px",
    backgroundColor: "rgba(255,255,255,0.15)",
    borderRadius: "16px",
    marginBottom: "30px",
    backdropFilter: "blur(10px)"
  },
  logoIcon: {
    fontSize: "40px"
  },
  mainTitle: {
    fontSize: "42px",
    fontWeight: "700",
    margin: "0 0 10px 0",
    letterSpacing: "-0.5px"
  },
  mainSubtitle: {
    fontSize: "16px",
    color: "rgba(255,255,255,0.8)",
    margin: "0 0 40px 0",
    fontWeight: "300"
  },
  benefitsSection: {
    display: "flex",
    flexDirection: "column",
    gap: "25px"
  },
  benefitRow: {
    display: "flex",
    gap: "16px",
    alignItems: "flex-start"
  },
  benefitDot: {
    width: "8px",
    height: "8px",
    backgroundColor: "rgba(255,255,255,0.6)",
    borderRadius: "50%",
    marginTop: "8px",
    flexShrink: 0
  },
  benefitText: {
    flex: 1
  },
  benefitTitle: {
    fontSize: "16px",
    fontWeight: "600",
    margin: "0 0 5px 0",
    color: "white"
  },
  benefitDesc: {
    fontSize: "13px",
    color: "rgba(255,255,255,0.7)",
    margin: "0",
    lineHeight: "1.4"
  },
  rightSection: {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
    padding: "60px 50px",
    backgroundColor: "#F8F6F1"
  },
  formCard: {
    width: "100%",
    maxWidth: "360px",
    backgroundColor: "white",
    borderRadius: "16px",
    padding: "50px 40px",
    boxShadow: "0 8px 24px rgba(0,0,0,0.08)",
    border: "1px solid #E8DFD0"
  },
  formHeader: {
    marginBottom: "35px"
  },
  formTitle: {
    fontSize: "32px",
    fontWeight: "700",
    margin: "0 0 8px 0",
    color: "#2C2C2C",
    letterSpacing: "-0.5px"
  },
  formSubtitle: {
    fontSize: "14px",
    color: "#7A7A7A",
    margin: "0",
    fontWeight: "400"
  },
  alertBox: {
    backgroundColor: "#FEF1F1",
    border: "1px solid #F5A6A6",
    borderRadius: "10px",
    padding: "14px 16px",
    marginBottom: "25px",
    display: "flex",
    alignItems: "center",
    gap: "12px",
    color: "#D32F2F",
    fontSize: "13px"
  },
  alertIcon: {
    fontSize: "18px",
    flexShrink: 0
  },
  alertText: {
    flexGrow: 1
  },
  inputGroup: {
    marginBottom: "20px"
  },
  inputLabel: {
    display: "block",
    fontSize: "13px",
    fontWeight: "600",
    color: "#2C2C2C",
    marginBottom: "10px",
    letterSpacing: "0.3px"
  },
  inputField: {
    width: "100%",
    padding: "12px 14px",
    border: "1px solid #E0D5C7",
    borderRadius: "10px",
    fontSize: "14px",
    boxSizing: "border-box",
    transition: "all 0.3s ease",
    fontFamily: "inherit",
    backgroundColor: "#FDFBF7"
  },
  loginBtn: {
    width: "100%",
    padding: "13px 16px",
    backgroundColor: "#E67E22",
    color: "white",
    border: "none",
    borderRadius: "10px",
    fontSize: "15px",
    fontWeight: "700",
    cursor: "pointer",
    transition: "all 0.3s ease",
    marginTop: "8px",
    letterSpacing: "0.5px"
  },
  divider: {
    display: "flex",
    alignItems: "center",
    margin: "28px 0",
    fontSize: "12px",
    color: "#A0A0A0",
    textAlign: "center",
    gap: "12px"
  },
  signupSection: {
    textAlign: "center"
  },
  signupText: {
    fontSize: "13px",
    color: "#7A7A7A",
    margin: "0",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    gap: "4px",
    flexWrap: "wrap"
  },
  signupBtn: {
    background: "none",
    border: "none",
    color: "#E67E22",
    fontWeight: "700",
    cursor: "pointer",
    fontSize: "13px",
    padding: "0 4px",
    textDecoration: "none",
    transition: "all 0.3s ease"
  },
  formFooter: {
    marginTop: "30px",
    textAlign: "center"
  },
  footerText: {
    fontSize: "11px",
    color: "#A0A0A0",
    margin: "0",
    letterSpacing: "0.3px"
  }
};

export default Login;
