import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import AOS from "aos";
import "aos/dist/aos.css";
import API from "../utils/api";

const Dashboard = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [file, setFile] = useState(null);
  const [summary, setSummary] = useState("");
  const [topic, setTopic] = useState("");
  const [difficulty, setDifficulty] = useState("");
  const [credits, setCredits] = useState(0);
  const [loading, setLoading] = useState(false);
  const [transactions, setTransactions] = useState([]);
  const [transactionsLoading, setTransactionsLoading] = useState(true);
  const [transactionError, setTransactionError] = useState("");
  const [alertMessage, setAlertMessage] = useState("");
  const [alertType, setAlertType] = useState(""); // success, error, or warning

  const fetchTransactions = async () => {
    setTransactionsLoading(true);
    setTransactionError("");
    try {
      const response = await API.get("/videos/transactions");
      console.log("Transactions response:", response.data);
      setTransactions(response.data);
    } catch (error) {
      console.error("Error fetching transactions:", error);
      setTransactionError("Failed to load transactions");
    } finally {
      setTransactionsLoading(false);
    }
  };

  const fetchUserData = async () => {
    try {
      const response = await API.get("/auth/user");
      setUser(response.data);
    } catch (error) {
      console.error("Error fetching user data:", error);
    }
  };

  useEffect(() => {
    AOS.init({ duration: 1000, once: false, mirror: true });

    const storedUser = localStorage.getItem("user");
    if (!storedUser) {
      navigate("/login");
      return;
    }

    const userData = JSON.parse(storedUser);
    setUser(userData);

    // Fetch data
    fetchUserData();
    fetchTransactions();
  }, [navigate]);

  const handleFileChange = (e) => {
    setFile(e.target.files[0]);
  };

  const handleUpload = async () => {
    if (!file) {
      setAlertMessage("Please select a file first!");
      setAlertType("error");
      return;
    }

    setLoading(true);
    const formData = new FormData();
    formData.append("video", file);

    try {
      const response = await API.post("/videos/analyze", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      setSummary(response.data.summary || "No summary available.");
      setTopic(response.data.topic || "Unknown");
      setDifficulty(response.data.difficulty || "Unknown");
      setCredits(response.data.credits || 0);
    } catch (error) {
      console.error("Upload failed:", error);
      setAlertMessage("Upload failed! Please try again.");
      setAlertType("error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-r from-indigo-600 to-blue-500 pt-20 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
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
              {alertType === "warning" && (
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
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Upload Section */}
          <div
            className="bg-white shadow-lg rounded-lg overflow-hidden"
            data-aos="fade-up"
          >
            <div className="bg-indigo-700 px-6 py-8">
              <h2 className="text-2xl font-bold text-white mb-2">
                Welcome, {user ? user.name : "Guest"}!
              </h2>
              <p className="text-indigo-100">
                Total Credits: {user?.totalCredits || 0}
              </p>
            </div>

            <div className="p-6">
              <div className="mb-8">
                <label className="block mb-4">
                  <span className="text-gray-700 font-medium block mb-2">
                    Choose a video file:
                  </span>
                  <div className="relative">
                    <input
                      type="file"
                      onChange={handleFileChange}
                      accept="video/*"
                      className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                    />
                    <div className="flex items-center justify-between px-4 py-3 bg-indigo-100 text-indigo-700 rounded-lg shadow-sm hover:bg-indigo-200 transition border-2 border-dashed border-indigo-300">
                      <span className="text-sm font-medium truncate">
                        {file ? file.name : "No file chosen"}
                      </span>
                      <span className="text-sm font-semibold ml-4">Browse</span>
                    </div>
                  </div>
                </label>

                <button
                  onClick={handleUpload}
                  className={`w-full py-3 px-4 rounded-lg text-white font-semibold transition flex items-center justify-center ${
                    loading
                      ? "bg-gray-400 cursor-not-allowed"
                      : "bg-indigo-600 hover:bg-indigo-700"
                  }`}
                  disabled={loading}
                >
                  {loading ? (
                    <svg
                      className="animate-spin h-5 w-5 text-white"
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 24 24"
                    >
                      <circle
                        className="opacity-25"
                        cx="12"
                        cy="12"
                        r="10"
                        stroke="currentColor"
                        strokeWidth="4"
                      ></circle>
                      <path
                        className="opacity-75"
                        fill="currentColor"
                        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                      ></path>
                    </svg>
                  ) : (
                    "Check Credits"
                  )}
                </button>
              </div>

              {/* Analysis Report */}
              {(summary || topic || difficulty || credits > 0) && (
                <div data-aos="fade-up">
                  <h3 className="text-xl font-semibold text-gray-800 mb-4">
                    Analysis Report:
                  </h3>
                  <div className="bg-gray-100 p-4 rounded-lg shadow space-y-3">
                    <div className="space-y-2">
                      <h4 className="font-semibold text-gray-700">Summary:</h4>
                      <p className="text-gray-600">{summary}</p>
                    </div>
                    <div className="space-y-2">
                      <h4 className="font-semibold text-gray-700">Topic:</h4>
                      <p className="text-gray-600">{topic}</p>
                    </div>
                    <div className="space-y-2">
                      <h4 className="font-semibold text-gray-700">
                        Difficulty:
                      </h4>
                      <div className="relative pt-1">
                        <div className="overflow-hidden h-2 text-xs flex rounded bg-indigo-200">
                          <div
                            style={{ width: `${difficulty}%` }}
                            className="shadow-none flex flex-col text-center whitespace-nowrap text-white justify-center bg-indigo-600 transition-all duration-500"
                          ></div>
                        </div>
                        <p className="text-gray-600 mt-1">{difficulty}/100</p>
                      </div>
                    </div>
                    <div className="space-y-2">
                      <h4 className="font-semibold text-gray-700">Credits:</h4>
                      <p className="text-2xl font-bold text-indigo-600">
                        {credits} credits
                      </p>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Recent Transactions */}
          <div
            className="bg-white shadow-lg rounded-lg overflow-hidden"
            data-aos="fade-up"
          >
            <div className="bg-indigo-700 px-6 py-8">
              <h2 className="text-2xl font-bold text-white mb-2">
                Recent Transactions
              </h2>
            </div>

            <div className="p-6">
              {transactionError && (
                <div className="text-red-600 mb-4">{transactionError}</div>
              )}

              {transactionsLoading ? (
                <div className="flex justify-center py-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
                </div>
              ) : transactions.length > 0 ? (
                <div className="divide-y divide-gray-200">
                  {transactions.map((transaction) => (
                    <div key={transaction._id} className="py-4">
                      <div className="flex justify-between items-start">
                        <div>
                          <h4 className="text-lg font-medium text-gray-900">
                            {transaction.video?.title || "Untitled Video"}
                          </h4>
                          <p className="text-sm text-gray-500">
                            {transaction.buyer?._id === user?._id ? (
                              <>
                                Purchased from{" "}
                                {transaction.seller?.name || "Unknown Seller"}
                              </>
                            ) : (
                              <>
                                Sold to{" "}
                                {transaction.buyer?.name || "Unknown Buyer"}
                              </>
                            )}
                          </p>
                          <p className="text-sm text-gray-500">
                            {new Date(
                              transaction.createdAt
                            ).toLocaleDateString()}
                          </p>
                        </div>
                        <div
                          className={`text-lg font-semibold ${
                            transaction.buyer?._id === user?._id
                              ? "text-red-600"
                              : "text-green-600"
                          }`}
                        >
                          {transaction.buyer?._id === user?._id ? "-" : "+"}
                          {transaction.credits} Credits
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-center text-gray-500 py-4">
                  No transactions yet
                </p>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
