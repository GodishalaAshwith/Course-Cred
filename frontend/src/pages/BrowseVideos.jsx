import React, { useEffect, useState } from "react";
import AOS from "aos";
import API from "../utils/api";
import "aos/dist/aos.css";

const BrowseVideos = () => {
  const [videos, setVideos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [user, setUser] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedTopic, setSelectedTopic] = useState("");
  const [isPurchasing, setPurchasing] = useState({});
  const [hoveredVideo, setHoveredVideo] = useState(null);
  const [isPlaying, setIsPlaying] = useState({});
  const [allTopics, setAllTopics] = useState([]);
  const [alertMessage, setAlertMessage] = useState("");
  const [alertType, setAlertType] = useState("");

  useEffect(() => {
    AOS.init({ duration: 1000, once: false, mirror: true });
    fetchVideos();
    fetchUserData();
  }, []);

  useEffect(() => {
    // Extract unique topics from videos
    if (videos.length > 0) {
      const topics = [...new Set(videos.flatMap((video) => video.topics))];
      setAllTopics(topics);
    }
  }, [videos]);

  const fetchUserData = async () => {
    try {
      const response = await API.get("/auth/user");
      setUser(response.data);
    } catch (error) {
      console.error("Error fetching user data:", error);
    }
  };

  const fetchVideos = async () => {
    try {
      const response = await API.get("/videos/all");
      setVideos(response.data);
    } catch (error) {
      console.error("Error fetching videos:", error);
      setError("Failed to load videos");
    } finally {
      setLoading(false);
    }
  };

  const handlePurchase = async (videoId, credits) => {
    try {
      if (!user || credits > user.totalCredits) {
        setAlertMessage("Insufficient credits to purchase this video!");
        setAlertType("error");
        return;
      }

      setPurchasing((prev) => ({ ...prev, [videoId]: true }));

      const response = await API.post(`/videos/purchase/${videoId}`);
      setAlertMessage("Video purchased successfully!");
      setAlertType("success");

      // Update user data to reflect new credit balance
      fetchUserData();
      // Refresh videos list
      fetchVideos();
    } catch (error) {
      console.error("Purchase error:", error);
      setAlertMessage(
        error.response?.data?.message || "Failed to purchase video"
      );
      setAlertType("error");
    } finally {
      setPurchasing((prev) => ({ ...prev, [videoId]: false }));
    }
  };

  const handleVideoHover = (videoId) => {
    setHoveredVideo(videoId);
  };

  const handleVideoLeave = () => {
    setHoveredVideo(null);
  };

  const handleVideoPlay = (videoId) => {
    setIsPlaying((prev) => ({ ...prev, [videoId]: true }));
  };

  const handleVideoPause = (videoId) => {
    setIsPlaying((prev) => ({ ...prev, [videoId]: false }));
  };

  const filteredVideos = videos.filter((video) => {
    const matchesSearch =
      video.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      video.summary.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesTopic = !selectedTopic || video.topics.includes(selectedTopic);
    return matchesSearch && matchesTopic;
  });

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-r from-indigo-600 to-blue-500 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-white"></div>
      </div>
    );
  }

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
              <p>{alertMessage}</p>
            </div>
          </div>
        )}
        <div className="bg-white rounded-lg shadow-xl p-6 mb-8">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            <h1 className="text-2xl font-bold text-gray-800">Browse Videos</h1>
            {user && (
              <p className="text-lg font-semibold text-indigo-600">
                Your Credits: {user.totalCredits}
              </p>
            )}
          </div>

          {/* Search and Filter Section */}
          <div className="mt-6 flex flex-col sm:flex-row gap-4">
            <div className="flex-1">
              <input
                type="text"
                placeholder="Search videos..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>
            <select
              value={selectedTopic}
              onChange={(e) => setSelectedTopic(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
            >
              <option value="">All Topics</option>
              {allTopics.map((topic) => (
                <option key={topic} value={topic}>
                  {topic}
                </option>
              ))}
            </select>
          </div>
        </div>

        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
            {error}
          </div>
        )}

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredVideos.map((video) => {
            const isOwner = user?._id === video.owner._id;
            const isPurchased = user?.purchasedVideos?.includes(video._id);

            return (
              <div
                key={video._id}
                className="bg-white rounded-lg shadow-xl overflow-hidden transform transition-all duration-300 hover:shadow-2xl hover:-translate-y-1"
                data-aos="fade-up"
                onMouseEnter={() => handleVideoHover(video._id)}
                onMouseLeave={handleVideoLeave}
              >
                <div className="aspect-w-16 aspect-h-9 relative">
                  <video
                    className="w-full h-48 object-cover"
                    src={`http://localhost:5000/uploads/videos/${video.filename}`}
                    controls={isPurchased || isOwner}
                    controlsList="nodownload"
                    poster={`http://localhost:5000/uploads/videos/${video.filename}#t=0.1`}
                    onPlay={() => handleVideoPlay(video._id)}
                    onPause={() => handleVideoPause(video._id)}
                  >
                    Your browser does not support the video tag.
                  </video>

                  {/* Preview Overlay for unpurchased videos */}
                  {!isPurchased &&
                    !isOwner &&
                    hoveredVideo === video._id &&
                    !isPlaying[video._id] && (
                      <div className="absolute inset-0 bg-black bg-opacity-60 flex items-center justify-center">
                        <div className="text-white text-center">
                          <svg
                            className="w-16 h-16 mx-auto mb-2 opacity-80"
                            fill="currentColor"
                            viewBox="0 0 20 20"
                          >
                            <path
                              fillRule="evenodd"
                              d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z"
                              clipRule="evenodd"
                            />
                          </svg>
                          <p className="text-sm">Purchase to watch</p>
                        </div>
                      </div>
                    )}
                </div>

                <div className="p-6">
                  <h3 className="text-xl font-semibold text-gray-800 mb-2">
                    {video.title}
                  </h3>
                  <p className="text-gray-600 mb-4 line-clamp-2">
                    {video.summary}
                  </p>
                  <div className="flex flex-wrap gap-2 mb-4">
                    {video.topics.map((topic, index) => (
                      <span
                        key={index}
                        className="bg-indigo-100 text-indigo-800 text-sm px-3 py-1 rounded-full"
                      >
                        {topic}
                      </span>
                    ))}
                  </div>
                  <div className="flex justify-between items-center">
                    <div>
                      <p className="text-gray-500">
                        Difficulty: {video.difficulty}/100
                      </p>
                      <p className="text-indigo-600 font-semibold">
                        {video.credits} Credits
                      </p>
                    </div>
                    {!isOwner && !isPurchased && (
                      <button
                        onClick={() => handlePurchase(video._id, video.credits)}
                        className={`${
                          isPurchasing[video._id]
                            ? "bg-gray-400 cursor-not-allowed"
                            : "bg-indigo-600 hover:bg-indigo-700"
                        } text-white px-4 py-2 rounded-lg transition-colors flex items-center space-x-2`}
                        disabled={
                          loading ||
                          user?.totalCredits < video.credits ||
                          isPurchasing[video._id]
                        }
                      >
                        {isPurchasing[video._id] ? (
                          <>
                            <svg
                              className="animate-spin h-5 w-5 mr-2"
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
                              />
                              <path
                                className="opacity-75"
                                fill="currentColor"
                                d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                              />
                            </svg>
                            <span>Purchasing...</span>
                          </>
                        ) : (
                          "Purchase"
                        )}
                      </button>
                    )}
                    {(isOwner || isPurchased) && (
                      <span className="text-green-600 font-medium flex items-center">
                        <svg
                          className="w-5 h-5 mr-1"
                          fill="currentColor"
                          viewBox="0 0 20 20"
                        >
                          <path
                            fillRule="evenodd"
                            d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                            clipRule="evenodd"
                          />
                        </svg>
                        {isOwner ? "Your Video" : "Purchased"}
                      </span>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {filteredVideos.length === 0 && (
          <div className="text-center text-white py-8">
            <p className="text-xl">No videos found matching your criteria.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default BrowseVideos;
