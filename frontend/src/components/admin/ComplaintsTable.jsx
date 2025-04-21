import React, { useState, useEffect, useCallback } from "react";
import axios from "axios";

const ComplaintsTable = () => {
  const [complaints, setComplaints] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [statusFilter, setStatusFilter] = useState("");
  const [refreshTrigger, setRefreshTrigger] = useState(0);
  const [deleteLoading, setDeleteLoading] = useState(false);

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
    if (
      !window.confirm(
        "Are you sure you want to delete all resolved complaints? This action cannot be undone."
      )
    ) {
      return;
    }

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
        alert(response.data.message);
        setRefreshTrigger((prev) => prev + 1); // Refresh the complaints list
      }
    } catch (err) {
      setError("Failed to delete resolved complaints");
      console.error(err);
    } finally {
      setDeleteLoading(false);
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
    return (
      <div className="text-red-500 p-4 text-center bg-red-50 rounded-lg">
        {error}
      </div>
    );
  }

  return (
    <div className="space-y-4">
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
                    className={`px-2 py-1 text-xs rounded-full ${
                      complaint.status === "resolved"
                        ? "bg-green-100 text-green-800"
                        : complaint.status === "in-progress"
                        ? "bg-yellow-100 text-yellow-800"
                        : "bg-red-100 text-red-800"
                    }`}
                  >
                    {complaint.status}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  <select
                    value={complaint.status}
                    onChange={(e) =>
                      handleStatusUpdate(complaint._id, e.target.value)
                    }
                    className="border rounded px-2 py-1 text-sm focus:ring-2 focus:ring-indigo-500"
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
    </div>
  );
};

export default ComplaintsTable;
