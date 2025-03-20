import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import AOS from "aos";
import "aos/dist/aos.css";
import axios from "axios";

const Dashboard = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [file, setFile] = useState(null);
  const [summary, setSummary] = useState("");
  const [topic, setTopic] = useState("");
  const [difficulty, setDifficulty] = useState("");
  const [credits, setCredits] = useState(0);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    AOS.init({ duration: 1000, once: false, mirror: true });

    const storedUser = localStorage.getItem("user");
    if (!storedUser) {
      navigate("/login");
    } else {
      setUser(JSON.parse(storedUser));
    }
  }, [navigate]);

  const handleFileChange = (e) => {
    setFile(e.target.files[0]);
  };

  const handleUpload = async () => {
    if (!file) {
      alert("Please select a file first!");
      return;
    }

    setLoading(true);
    const formData = new FormData();
    formData.append("video", file);

    try {
      const response = await axios.post(
        "http://127.0.0.1:5000/upload",
        formData,
        { headers: { "Content-Type": "multipart/form-data" } }
      );

      console.log("Server Response:", response.data);

      setSummary(response.data.summary || "No summary available.");
      setTopic(response.data.topic || "Unknown");
      setDifficulty(response.data.difficulty || "Unknown");
      setCredits(response.data.credits || 0);
    } catch (error) {
      console.error("Upload failed:", error);
      alert("Upload failed! Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      style={{
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        height: "100vh",
        backgroundColor: "#f3f3f3",
        fontFamily: "Arial, sans-serif",
      }}
    >
      <div
        style={{
          background: "white",
          padding: "20px",
          borderRadius: "10px",
          boxShadow: "0px 4px 8px rgba(0, 0, 0, 0.2)",
          textAlign: "center",
          width: "350px",
        }}
      >
        <h2 style={{ fontSize: "24px", fontWeight: "bold", color: "#4a4a4a" }}>
          Welcome, {user ? user.name : "Guest"}!
        </h2>
        <p style={{ color: "#666", marginBottom: "15px" }}>
          Upload a video to extract a summary and difficulty analysis.
        </p>

        {/* File Upload */}
        <input
          type="file"
          onChange={handleFileChange}
          accept="video/*"
          style={{ marginBottom: "10px" }}
        />
        <button
          onClick={handleUpload}
          style={{
            backgroundColor: loading ? "gray" : "#4a90e2",
            color: "white",
            padding: "10px 20px",
            border: "none",
            borderRadius: "5px",
            cursor: loading ? "not-allowed" : "pointer",
          }}
          disabled={loading}
        >
          {loading ? "Processing..." : "Upload"}
        </button>

        {/* Extracted Text Display */}
        <div style={{ marginTop: "20px", textAlign: "left" }}>
          <h3>Analysis Report:</h3>
          <div
            style={{
              backgroundColor: "#000",
              padding: "10px",
              borderRadius: "5px",
              color: "white",
            }}
          >
            <p>
              <strong>Summary:</strong> {summary}
            </p>
            <p>
              <strong>Topic:</strong> {topic}
            </p>
            <p>
              <strong>Difficulty:</strong> {difficulty}
            </p>
            <p>
              <strong>Credits:</strong> {credits}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
