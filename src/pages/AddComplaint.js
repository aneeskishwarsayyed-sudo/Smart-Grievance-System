import { useState } from "react";
import api from "../api/api";
import { useNavigate } from "react-router-dom";
import LogoutButton from "../components/LogoutButton";

function AddComplaint() {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [file, setFile] = useState(null);
  const [fileName, setFileName] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];
    if (selectedFile) {
      setFile(selectedFile);
      setFileName(selectedFile.name);
    }
  };

  const submitComplaint = async () => {
    if (!title.trim()) {
      alert("Please enter a complaint title");
      return;
    }
    if (!description.trim()) {
      alert("Please enter a description");
      return;
    }

    setLoading(true);
    try {
      const userId = localStorage.getItem("userId");
      const formData = new FormData();
      formData.append("title", title);
      formData.append("description", description);
      
      if (file) {
        formData.append("file", file);
      }

      await api.post(`/complaints/add/${userId}`, formData, {
        headers: {
          "Content-Type": "multipart/form-data"
        }
      });

      alert("Complaint submitted successfully");
      navigate("/user");
    } catch (err) {
      alert(err.response?.data?.message || "Error submitting complaint. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const removeFile = () => {
    setFile(null);
    setFileName("");
  };

  return (
    <div style={styles.mainContainer}>
      {/* Header */}
      <div style={styles.header}>
        <div>
          <h1 style={styles.title}>Submit Complaint</h1>
          <p style={styles.subtitle}>We are here to help you resolve your grievance</p>
        </div>
        <LogoutButton />
      </div>

      {/* Form Container */}
      <div style={styles.formWrapper}>
        <div style={styles.formCard}>
          {/* Title Input */}
          <div style={styles.formGroup}>
            <label style={styles.label}>Complaint Title</label>
            <input
              type="text"
              placeholder="Brief title of your complaint"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              style={styles.input}
              disabled={loading}
            />
            <p style={styles.hint}>Be concise and descriptive</p>
          </div>

          {/* Description Input */}
          <div style={styles.formGroup}>
            <label style={styles.label}>Description</label>
            <textarea
              placeholder="Describe your issue in detail..."
              value={description}
              rows="6"
              onChange={(e) => setDescription(e.target.value)}
              style={styles.textarea}
              disabled={loading}
            />
            <p style={styles.hint}>Provide as much detail as possible to help us understand your issue better</p>
          </div>

          {/* File Upload Section */}
          <div style={styles.fileUploadSection}>
            <label style={styles.label}>📎 Attach Supporting Document (Optional)</label>
            <p style={styles.fileHint}>Supported formats: PDF, DOC, DOCX, JPG, PNG (Max 5MB)</p>
            
            <div style={styles.fileInputWrapper}>
              <input
                type="file"
                onChange={handleFileChange}
                style={styles.fileInput}
                accept=".pdf,.doc,.docx,.jpg,.jpeg,.png"
                disabled={loading}
              />
              <span style={styles.fileInputLabel}>
                {fileName ? `✓ ${fileName}` : "📁 Click to select file"}
              </span>
            </div>

            {file && (
              <div style={styles.filePreview}>
                <div style={styles.filePreviewItem}>
                  <span style={styles.fileIcon}>📄</span>
                  <div style={styles.filePreviewDetails}>
                    <p style={styles.filePreviewName}>{fileName}</p>
                    <p style={styles.filePreviewSize}>
                      {(file.size / 1024).toFixed(2)} KB
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={removeFile}
                    style={styles.removeFileBtn}
                    disabled={loading}
                  >
                    ✕
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Submit Button */}
          <button 
            style={{...styles.submitBtn, opacity: loading ? 0.6 : 1}}
            onClick={submitComplaint}
            disabled={loading}
          >
            {loading ? "Submitting..." : "Submit Complaint"}
          </button>

          {/* Back Button */}
          <button 
            style={styles.backBtn}
            onClick={() => navigate("/user")}
            disabled={loading}
          >
            Back to Dashboard
          </button>
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
  formWrapper: {
    display: "flex",
    justifyContent: "center"
  },
  formCard: {
    backgroundColor: "white",
    borderRadius: "10px",
    padding: "30px",
    boxShadow: "0 2px 4px rgba(0,0,0,0.1)",
    width: "100%",
    maxWidth: "700px"
  },
  formGroup: {
    marginBottom: "25px"
  },
  label: {
    display: "block",
    fontSize: "14px",
    fontWeight: "600",
    color: "#333",
    marginBottom: "10px",
    letterSpacing: "0.3px"
  },
  hint: {
    fontSize: "12px",
    color: "#999",
    margin: "8px 0 0 0"
  },
  input: {
    width: "100%",
    padding: "12px 14px",
    border: "1px solid #E0E0E0",
    borderRadius: "8px",
    fontSize: "14px",
    boxSizing: "border-box",
    transition: "all 0.3s ease",
    fontFamily: "inherit",
    backgroundColor: "#FAFAFA"
  },
  textarea: {
    width: "100%",
    padding: "12px 14px",
    border: "1px solid #E0E0E0",
    borderRadius: "8px",
    fontSize: "14px",
    fontFamily: "inherit",
    boxSizing: "border-box",
    transition: "all 0.3s ease",
    resize: "vertical",
    backgroundColor: "#FAFAFA"
  },
  fileUploadSection: {
    marginBottom: "25px",
    padding: "20px",
    backgroundColor: "#FAFAFA",
    borderRadius: "8px",
    border: "1px solid #E0E0E0"
  },
  fileLabel: {
    display: "block",
    fontSize: "14px",
    fontWeight: "600",
    color: "#333",
    marginBottom: "5px"
  },
  fileHint: {
    fontSize: "12px",
    color: "#999",
    margin: "0 0 15px 0"
  },
  fileInputWrapper: {
    position: "relative",
    marginBottom: "15px"
  },
  fileInput: {
    position: "absolute",
    opacity: 0,
    width: "100%",
    height: "100%",
    cursor: "pointer",
    top: 0,
    left: 0
  },
  fileInputLabel: {
    display: "block",
    padding: "12px",
    backgroundColor: "white",
    border: "2px dashed #E67E22",
    borderRadius: "8px",
    textAlign: "center",
    cursor: "pointer",
    color: "#E67E22",
    fontSize: "14px",
    fontWeight: "600",
    transition: "all 0.3s"
  },
  filePreview: {
    marginTop: "10px"
  },
  filePreviewItem: {
    display: "flex",
    alignItems: "center",
    padding: "12px",
    backgroundColor: "white",
    borderRadius: "8px",
    border: "1px solid #E0E0E0",
    gap: "12px"
  },
  fileIcon: {
    fontSize: "24px",
    flexShrink: 0
  },
  filePreviewDetails: {
    flex: 1
  },
  filePreviewName: {
    margin: "0",
    fontSize: "14px",
    fontWeight: "600",
    color: "#333"
  },
  filePreviewSize: {
    margin: "3px 0 0 0",
    fontSize: "12px",
    color: "#999"
  },
  removeFileBtn: {
    backgroundColor: "#FF6B6B",
    color: "white",
    border: "none",
    borderRadius: "50%",
    width: "32px",
    height: "32px",
    cursor: "pointer",
    fontSize: "16px",
    fontWeight: "bold",
    transition: "all 0.3s",
    flexShrink: 0
  },
  submitBtn: {
    width: "100%",
    padding: "13px 16px",
    backgroundColor: "#E67E22",
    color: "white",
    border: "none",
    borderRadius: "8px",
    fontSize: "15px",
    fontWeight: "700",
    cursor: "pointer",
    transition: "all 0.3s ease",
    marginBottom: "12px",
    letterSpacing: "0.5px"
  },
  backBtn: {
    width: "100%",
    padding: "13px 16px",
    backgroundColor: "#F0F0F0",
    color: "#333",
    border: "1px solid #E0E0E0",
    borderRadius: "8px",
    fontSize: "15px",
    fontWeight: "600",
    cursor: "pointer",
    transition: "all 0.3s ease",
    letterSpacing: "0.5px"
  }
};

export default AddComplaint;
