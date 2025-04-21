import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import API from "../utils/api";
import AdminDashboard from "../components/admin/AdminDashboard";
import UsersTable from "../components/admin/UsersTable";
import VideosTable from "../components/admin/VideosTable";
import TransactionsTable from "../components/admin/TransactionsTable";
import ComplaintsTable from "../components/admin/ComplaintsTable";
import ConfirmDialog from "../components/ConfirmDialog";

function Admin() {
  const navigate = useNavigate();
  const [secretCode, setSecretCode] = useState("");
  const [adminPassword, setAdminPassword] = useState("");
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");
  const [stats, setStats] = useState(null);
  const [activeSection, setActiveSection] = useState("dashboard");
  const [users, setUsers] = useState([]);
  const [videos, setVideos] = useState([]);
  const [transactions, setTransactions] = useState([]);
  const [editingUser, setEditingUser] = useState(null);
  const [editingVideo, setEditingVideo] = useState(null);
  const [alertMessage, setAlertMessage] = useState("");
  const [alertType, setAlertType] = useState("");
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [userToDelete, setUserToDelete] = useState(null);

  useEffect(() => {
    checkAdminAuth();
  }, []);

  async function checkAdminAuth() {
    try {
      setIsLoading(true);
      const adminCode = localStorage.getItem("adminCode");
      if (!adminCode) {
        setIsAuthenticated(false);
        setIsLoading(false);
        return;
      }

      const response = await API.get("/admin/stats", {
        headers: { "Admin-Access-Code": adminCode },
      });

      setIsAuthenticated(true);
      setStats(response.data);
      await fetchAdminData();
    } catch (error) {
      setIsAuthenticated(false);
      localStorage.removeItem("adminCode"); // Clear invalid admin code
    } finally {
      setIsLoading(false);
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
      const response = await API.post(
        "/admin/login",
        {
          email: user.email,
          adminPassword,
          secretCode,
        },
        {
          headers: {
            "Admin-Access-Code": secretCode,
          },
        }
      );

      if (response.data.isAdmin) {
        localStorage.setItem("adminCode", secretCode);
        setIsAuthenticated(true);
        await fetchAdminData();
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
      setAlertMessage("User updated successfully");
      setAlertType("success");
    } catch (error) {
      setError(error.response?.data?.message || "Failed to update user");
      setAlertType("error");
    }
  }

  async function handleDeleteUser(userId) {
    setUserToDelete(userId);
    setShowDeleteDialog(true);
  }

  async function confirmDeleteUser() {
    try {
      await API.delete("/admin/users/" + userToDelete);
      fetchAdminData();
      setAlertMessage("User deleted successfully");
      setAlertType("success");
    } catch (error) {
      setError(error.response?.data?.message || "Failed to delete user");
      setAlertType("error");
    } finally {
      setShowDeleteDialog(false);
      setUserToDelete(null);
    }
  }

  async function handleUpdateVideo(videoId, videoData) {
    try {
      await API.put("/admin/videos/" + videoId, videoData);
      fetchAdminData();
      setEditingVideo(null);
      setAlertMessage("Video updated successfully");
      setAlertType("success");
    } catch (error) {
      setError(error.response?.data?.message || "Failed to update video");
      setAlertType("error");
    }
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-r from-blue-700 to-indigo-600 flex items-center justify-center">
        <div className="text-white text-xl">Loading...</div>
      </div>
    );
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
    <div className="min-h-screen bg-gray-900 pt-16">
      <div className="container mx-auto px-4 py-8">
        {alertMessage && (
          <div
            className={`mb-4 px-6 py-4 rounded-lg shadow-sm transition-all duration-300 ${
              alertType === "success"
                ? "bg-gradient-to-r from-green-50 to-green-100 border border-green-200 text-green-800"
                : alertType === "error"
                ? "bg-gradient-to-r from-red-50 to-red-100 border border-red-200 text-red-800"
                : "bg-gradient-to-r from-yellow-50 to-yellow-100 border border-yellow-200 text-yellow-800"
            }`}
          >
            <div className="flex items-center">
              {alertType === "success" && (
                <svg
                  className="w-5 h-5 mr-3"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path
                    fillRule="evenodd"
                    d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                    clipRule="evenodd"
                  />
                </svg>
              )}
              {alertType === "error" && (
                <svg
                  className="w-5 h-5 mr-3"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path
                    fillRule="evenodd"
                    d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z"
                    clipRule="evenodd"
                  />
                </svg>
              )}
              <p>{alertMessage}</p>
            </div>
          </div>
        )}
        <div className="flex flex-wrap gap-4 mb-8">
          {["dashboard", "users", "videos", "transactions", "complaints"].map(
            (section) => (
              <button
                key={section}
                onClick={() => setActiveSection(section)}
                className={`px-4 py-2 rounded ${
                  activeSection === section
                    ? "bg-indigo-600 text-white"
                    : "bg-gray-800 text-gray-200 hover:bg-gray-700"
                }`}
              >
                {section.charAt(0).toUpperCase() + section.slice(1)}
              </button>
            )
          )}
        </div>

        {activeSection === "dashboard" && <AdminDashboard stats={stats} />}
        {activeSection === "users" && (
          <div className="bg-gray-800 rounded-lg shadow-lg">
            <UsersTable
              users={users}
              editingUser={editingUser}
              setEditingUser={setEditingUser}
              handleUpdateUser={handleUpdateUser}
              handleDeleteUser={handleDeleteUser}
            />
          </div>
        )}
        {activeSection === "videos" && (
          <div className="bg-gray-800 rounded-lg shadow-lg">
            <VideosTable
              videos={videos}
              editingVideo={editingVideo}
              setEditingVideo={setEditingVideo}
              handleUpdateVideo={handleUpdateVideo}
            />
          </div>
        )}
        {activeSection === "transactions" && (
          <div className="bg-gray-800 rounded-lg shadow-lg">
            <TransactionsTable transactions={transactions} />
          </div>
        )}
        {activeSection === "complaints" && (
          <div className="bg-gray-800 rounded-lg shadow-lg p-6">
            <ComplaintsTable />
          </div>
        )}
      </div>

      <ConfirmDialog
        isOpen={showDeleteDialog}
        onClose={() => setShowDeleteDialog(false)}
        onConfirm={confirmDeleteUser}
        title="Delete User"
        message="Are you sure you want to delete this user? This action cannot be undone."
      />
    </div>
  );
}

export default Admin;
