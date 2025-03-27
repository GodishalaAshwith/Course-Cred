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
    <div className="flex items-center justify-center min-h-screen bg-gradient-to-r from-indigo-600 to-blue-500">
      <div className="bg-white shadow-lg rounded-lg p-8 w-full max-w-lg">
        <h2 className="text-2xl font-bold text-gray-800 mb-4">
          Welcome, {user ? user.name : "Guest"}!
        </h2>
        <p className="text-gray-600 mb-6">
          Upload a video to extract a summary and difficulty analysis.
        </p>

        {/* File Upload */}
        <label className="block mb-4">
          <span className="text-gray-700 font-medium">
            Choose a video file:
          </span>
          <div className="relative mt-2">
            <input
              type="file"
              onChange={handleFileChange}
              accept="video/*"
              className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
            />
            <div className="flex items-center justify-between px-4 py-2 bg-indigo-100 text-indigo-700 rounded-lg shadow-sm hover:bg-indigo-200 transition">
              <span className="text-sm font-medium">
                {file ? file.name : "No file chosen"}
              </span>
              <span className="text-sm font-semibold">Browse</span>
            </div>
          </div>
        </label>

        <button
          onClick={handleUpload}
          className={`w-full py-2 px-4 rounded-lg text-white font-semibold transition ${
            loading
              ? "bg-gray-400 cursor-not-allowed"
              : "bg-indigo-600 hover:bg-indigo-700"
          }`}
          disabled={loading}
        >
          {loading ? "Processing..." : "Upload"}
        </button>

        {/* Extracted Text Display */}
        <div className="mt-8">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">
            Analysis Report:
          </h3>
          <div className="bg-gray-100 p-4 rounded-lg shadow">
            <p className="text-gray-700 mb-2">
              <strong>Summary:</strong> {summary}
            </p>
            <p className="text-gray-700 mb-2">
              <strong>Topic:</strong> {topic}
            </p>
            <p className="text-gray-700 mb-2">
              <strong>Difficulty:</strong> {difficulty}
            </p>
            <p className="text-gray-700">
              <strong>Credits:</strong> {credits}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
