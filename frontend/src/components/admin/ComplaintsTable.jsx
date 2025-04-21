import React, { useState, useEffect, useCallback } from "react";
import axios from "axios";
import ConfirmDialog from "../ConfirmDialog";

const ComplaintsTable = () => {
  const [complaints, setComplaints] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [statusFilter, setStatusFilter] = useState("");
  const [refreshTrigger, setRefreshTrigger] = useState(0);
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [alertMessage, setAlertMessage] = useState("");
  const [alertType, setAlertType] = useState("");
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);

  const fetchComplaints = useCallback(async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem("token");
      const adminCode = localStorage.getItem("adminCode");

      if (!token || !adminCode) {
        throw new Error("Authentication required");
      }

      const response = await axios.get(
        `http://localhost:5000/api/complaints?page=${page}&status=${statusFilter}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Admin-Access-Code": adminCode,
          },
        }
      );

      setComplaints(response.data.complaints);
      setTotalPages(response.data.totalPages);
    } catch (err) {
      setError(err.response?.data?.message || "Failed to fetch complaints");
    } finally {
      setLoading(false);
    }
  }, [page, statusFilter]);

  useEffect(() => {
    fetchComplaints();
  }, [fetchComplaints, refreshTrigger]);

  const handleStatusUpdate = async (id, newStatus) => {
    try {
      const token = localStorage.getItem("token");
      const adminCode = localStorage.getItem("adminCode");

      await axios.patch(
        `http://localhost:5000/api/complaints/${id}`,
        { status: newStatus },
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Admin-Access-Code": adminCode,
          },
        }
      );

      setRefreshTrigger((prev) => prev + 1);
    } catch (err) {
      setError("Failed to update status");
    }
  };

  const handleDeleteResolved = async () => {
    setShowDeleteDialog(true);
  };

  const confirmDeleteResolved = async () => {
    try {
      setDeleteLoading(true);
      const token = localStorage.getItem("token");
      const adminCode = localStorage.getItem("adminCode");

      const response = await axios.delete(
        "http://localhost:5000/api/complaints/resolved",
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Admin-Access-Code": adminCode,
          },
        }
      );

      if (response.data.success) {
        setAlertMessage(response.data.message);
        setAlertType("success");
        setRefreshTrigger((prev) => prev + 1); // Refresh the complaints list
      }
    } catch (err) {
      setAlertMessage("Failed to delete resolved complaints");
      setAlertType("error");
      console.error(err);
    } finally {
      setDeleteLoading(false);
      setShowDeleteDialog(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center p-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  if (error) {
    return <div className="alert alert-error">{error}</div>;
  }

  return (
    <div className="space-y-4">
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

      <div className="flex justify-between items-center mb-4">
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="border rounded-lg px-3 py-2 focus:ring-2 focus:ring-indigo-500"
        >
          <option value="">All Status</option>
          <option value="pending">Pending</option>
          <option value="in-progress">In Progress</option>
          <option value="resolved">Resolved</option>
        </select>

        <button
          onClick={handleDeleteResolved}
          disabled={deleteLoading}
          className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors disabled:bg-red-400 disabled:cursor-not-allowed"
        >
          {deleteLoading ? "Deleting..." : "Delete All Resolved"}
        </button>
      </div>

      {error && (
        <div className="text-red-500 p-4 text-center bg-red-50 rounded-lg">
          {error}
        </div>
      )}

      <div className="overflow-x-auto rounded-lg shadow">
        <table className="min-w-full bg-white">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Date
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Name
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Subject
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Status
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {complaints.map((complaint) => (
              <tr key={complaint._id} className="hover:bg-gray-50">
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {new Date(complaint.createdAt).toLocaleDateString()}
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm font-medium text-gray-900">
                    {complaint.name}
                  </div>
                  <div className="text-sm text-gray-500">{complaint.email}</div>
                </td>
                <td className="px-6 py-4">
                  <div className="text-sm text-gray-900">
                    {complaint.subject}
                  </div>
                  <div className="text-sm text-gray-500 truncate max-w-xs">
                    {complaint.message}
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span
                    className={`inline-flex items-center px-3 py-1 text-sm font-medium rounded-full ${
                      complaint.status === "resolved"
                        ? "bg-gradient-to-r from-green-100 to-green-200 text-green-800"
                        : complaint.status === "in-progress"
                        ? "bg-gradient-to-r from-yellow-100 to-yellow-200 text-yellow-800"
                        : "bg-gradient-to-r from-red-100 to-red-200 text-red-800"
                    }`}
                  >
                    <span
                      className={`w-2 h-2 mr-2 rounded-full ${
                        complaint.status === "resolved"
                          ? "bg-green-400"
                          : complaint.status === "in-progress"
                          ? "bg-yellow-400"
                          : "bg-red-400"
                      }`}
                    ></span>
                    {complaint.status}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  <select
                    value={complaint.status}
                    onChange={(e) =>
                      handleStatusUpdate(complaint._id, e.target.value)
                    }
                    className="border rounded-lg px-2 py-1 text-sm focus:ring-2 focus:ring-indigo-500"
                  >
                    <option value="pending">Pending</option>
                    <option value="in-progress">In Progress</option>
                    <option value="resolved">Resolved</option>
                  </select>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {totalPages > 1 && (
        <div className="flex justify-center space-x-2 mt-4">
          <button
            onClick={() => setPage((p) => Math.max(1, p - 1))}
            disabled={page === 1}
            className="px-4 py-2 border rounded-md disabled:opacity-50"
          >
            Previous
          </button>
          <span className="px-4 py-2">
            Page {page} of {totalPages}
          </span>
          <button
            onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
            disabled={page === totalPages}
            className="px-4 py-2 border rounded-md disabled:opacity-50"
          >
            Next
          </button>
        </div>
      )}

      <ConfirmDialog
        isOpen={showDeleteDialog}
        onClose={() => setShowDeleteDialog(false)}
        onConfirm={confirmDeleteResolved}
        title="Delete Resolved Complaints"
        message="Are you sure you want to delete all resolved complaints? This action cannot be undone."
      />
    </div>
  );
};

export default ComplaintsTable;
