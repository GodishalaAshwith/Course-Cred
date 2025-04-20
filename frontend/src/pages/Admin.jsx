import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import API from "../utils/api";
import AdminDashboard from "../components/admin/AdminDashboard";
import UsersTable from "../components/admin/UsersTable";
import VideosTable from "../components/admin/VideosTable";
import TransactionsTable from "../components/admin/TransactionsTable";

function Admin() {
  const navigate = useNavigate();
  const [secretCode, setSecretCode] = useState("");
  const [adminPassword, setAdminPassword] = useState("");
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [error, setError] = useState("");
  const [stats, setStats] = useState(null);
  const [activeSection, setActiveSection] = useState("dashboard");
  const [users, setUsers] = useState([]);
  const [videos, setVideos] = useState([]);
  const [transactions, setTransactions] = useState([]);
  const [editingUser, setEditingUser] = useState(null);
  const [editingVideo, setEditingVideo] = useState(null);

  useEffect(() => {
    checkAdminAuth();
  }, []);

  async function checkAdminAuth() {
    try {
      const response = await API.get("/admin/stats", {
        headers: { "Admin-Access-Code": localStorage.getItem("adminCode") },
      });
      setIsAuthenticated(true);
      setStats(response.data);
      fetchAdminData();
    } catch (error) {
      setIsAuthenticated(false);
    }
  }

  async function handleAdminLogin(e) {
    e.preventDefault();
    try {
      const userStr = localStorage.getItem("user");
      if (!userStr) {
        setError("Please login first");
        navigate("/login");
        return;
      }

      const user = JSON.parse(userStr);
      const response = await API.post("/admin/login", {
        email: user.email,
        password: "",
        adminPassword,
        secretCode,
      });

      if (response.data.isAdmin) {
        localStorage.setItem("adminCode", secretCode);
        setIsAuthenticated(true);
        fetchAdminData();
      }
    } catch (error) {
      setError(error.response?.data?.message || "Authentication failed");
    }
  }

  async function fetchAdminData() {
    try {
      const [statsRes, usersRes, videosRes, transactionsRes] =
        await Promise.all([
          API.get("/admin/stats"),
          API.get("/admin/users"),
          API.get("/admin/videos"),
          API.get("/admin/transactions"),
        ]);

      setStats(statsRes.data);
      setUsers(usersRes.data);
      setVideos(videosRes.data);
      setTransactions(transactionsRes.data);
    } catch (error) {
      console.error("Error fetching admin data:", error);
    }
  }

  async function handleUpdateUser(userId, userData) {
    try {
      await API.put("/admin/users/" + userId, userData);
      fetchAdminData();
      setEditingUser(null);
    } catch (error) {
      setError(error.response?.data?.message || "Failed to update user");
    }
  }

  async function handleDeleteUser(userId) {
    if (!window.confirm("Are you sure you want to delete this user?")) return;
    try {
      await API.delete("/admin/users/" + userId);
      fetchAdminData();
    } catch (error) {
      setError(error.response?.data?.message || "Failed to delete user");
    }
  }

  async function handleUpdateVideo(videoId, videoData) {
    try {
      await API.put("/admin/videos/" + videoId, videoData);
      fetchAdminData();
      setEditingVideo(null);
    } catch (error) {
      setError(error.response?.data?.message || "Failed to update video");
    }
  }

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-gradient-to-r from-blue-700 to-indigo-600 flex items-center justify-center px-4">
        <div className="bg-white p-8 rounded-xl shadow-2xl w-full max-w-md">
          <h2 className="text-3xl font-bold text-gray-800 mb-6 text-center">
            Admin Access
          </h2>
          {error && (
            <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
              {error}
            </div>
          )}
          <form onSubmit={handleAdminLogin} className="space-y-4">
            <div>
              <label className="block text-gray-700 mb-2">Secret Code</label>
              <input
                type="text"
                value={secretCode}
                onChange={(e) => setSecretCode(e.target.value)}
                className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500"
                placeholder="Enter the secret code"
                required
              />
            </div>
            <div>
              <label className="block text-gray-700 mb-2">Admin Password</label>
              <input
                type="password"
                value={adminPassword}
                onChange={(e) => setAdminPassword(e.target.value)}
                className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500"
                placeholder="Enter admin password"
                required
              />
            </div>
            <button
              type="submit"
              className="w-full bg-indigo-600 text-white py-2 rounded-lg hover:bg-indigo-700 transition duration-200"
            >
              Access Admin Panel
            </button>
          </form>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100 pt-16">
      <div className="container mx-auto px-4 py-8">
        <div className="flex flex-wrap gap-4 mb-8">
          {["dashboard", "users", "videos", "transactions"].map((section) => (
            <button
              key={section}
              onClick={() => setActiveSection(section)}
              className={`px-4 py-2 rounded ${
                activeSection === section
                  ? "bg-indigo-600 text-white"
                  : "bg-white text-gray-700 hover:bg-gray-50"
              }`}
            >
              {section.charAt(0).toUpperCase() + section.slice(1)}
            </button>
          ))}
        </div>

        {activeSection === "dashboard" && <AdminDashboard stats={stats} />}
        {activeSection === "users" && (
          <UsersTable
            users={users}
            editingUser={editingUser}
            setEditingUser={setEditingUser}
            handleUpdateUser={handleUpdateUser}
            handleDeleteUser={handleDeleteUser}
          />
        )}
        {activeSection === "videos" && (
          <VideosTable
            videos={videos}
            editingVideo={editingVideo}
            setEditingVideo={setEditingVideo}
            handleUpdateVideo={handleUpdateVideo}
          />
        )}
        {activeSection === "transactions" && (
          <TransactionsTable transactions={transactions} />
        )}
      </div>
    </div>
  );
}

export default Admin;
