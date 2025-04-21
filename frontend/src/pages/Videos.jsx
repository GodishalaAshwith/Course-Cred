import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import AOS from "aos";
import "aos/dist/aos.css";
import API from "../utils/api";
import ConfirmDialog from "../components/ConfirmDialog";

const Videos = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [file, setFile] = useState(null);
  const [title, setTitle] = useState("");
  const [summary, setSummary] = useState("");
  const [topic, setTopic] = useState("");
  const [difficulty, setDifficulty] = useState("");
  const [credits, setCredits] = useState(0);
  const [loading, setLoading] = useState(false);
  const [videos, setVideos] = useState([]);
  const [showUploadForm, setShowUploadForm] = useState(false);
  const [userTotalCredits, setUserTotalCredits] = useState(0);
  const [uniqueness, setUniqueness] = useState(0);
  const [similarityMessage, setSimilarityMessage] = useState("");
  const [similarity, setSimilarity] = useState(0);
  const [fingerprint, setFingerprint] = useState("");
  const [previewUrl, setPreviewUrl] = useState(null);
  const [hoveredVideo, setHoveredVideo] = useState(null);
  const [isPlaying, setIsPlaying] = useState({});
  const [alertMessage, setAlertMessage] = useState("");
  const [alertType, setAlertType] = useState("");
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [videoToDelete, setVideoToDelete] = useState(null);

  useEffect(() => {
    AOS.init({ duration: 1000, once: false, mirror: true });

    const storedUser = localStorage.getItem("user");
    if (!storedUser) {
      navigate("/login");
    } else {
      const parsedUser = JSON.parse(storedUser);
      setUser(parsedUser);
      fetchUserVideos();
      fetchUserCredits(parsedUser.id);
    }
  }, [navigate]);

  const fetchUserCredits = async (userId) => {
    try {
      const response = await API.get(`/auth/user`);
      setUserTotalCredits(response.data.totalCredits || 0);
    } catch (error) {
      console.error("Failed to fetch user credits:", error);
    }
  };

  const fetchUserVideos = async () => {
    try {
      const response = await API.get("/videos/user-videos");
      setVideos(response.data);
    } catch (error) {
      console.error("Failed to fetch videos:", error);
    }
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    setFile(file);

    // Create preview URL for the video
    if (file) {
      const url = URL.createObjectURL(file);
      setPreviewUrl(url);
      return () => URL.revokeObjectURL(url);
    }
  };

  const handleCheckStatistics = async () => {
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
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });

      setSummary(response.data.summary || "No summary available.");
      setTopic(response.data.topic || "Unknown");
      setDifficulty(response.data.difficulty || "Unknown");
      setCredits(response.data.credits || 0);
      setUniqueness(response.data.uniqueness || 0);
      setSimilarity(response.data.similarity || 0);
      setSimilarityMessage(response.data.similarity_message || "");
      setFingerprint(response.data.fingerprint || "");

      // Alert user if the video is a duplicate
      if (response.data.credits === "0") {
        setAlertMessage(
          "This video appears to be a duplicate. No credits will be awarded."
        );
        setAlertType("error");
      } else if (response.data.similarity > 0) {
        setAlertMessage(
          `This video has ${response.data.similarity.toFixed(
            1
          )}% similarity with existing content. Credits have been adjusted accordingly.`
        );
        setAlertType("warning");
      }
    } catch (error) {
      console.error("Statistics check failed:", error);
      setAlertMessage("Failed to check statistics! Please try again.");
      setAlertType("error");
    } finally {
      setLoading(false);
    }
  };

  const handleUpload = async () => {
    if (!file || !title) {
      setAlertMessage("Please select a file and provide a title!");
      setAlertType("error");
      return;
    }

    const formData = new FormData();
    formData.append("video", file);
    formData.append("title", title);
    formData.append("credits", credits);
    formData.append("summary", summary);
    formData.append("difficulty", difficulty);
    formData.append("topics", topic);
    formData.append("uniqueness", uniqueness);
    formData.append("fingerprint", fingerprint);
    formData.append("similarity_message", similarityMessage);

    try {
      const response = await API.post("/videos/upload", formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });

      if (response.data.similarity_message) {
        setAlertMessage(response.data.similarity_message);
        setAlertType("warning");
      } else {
        setAlertMessage("Video uploaded successfully!");
        setAlertType("success");
      }

      fetchUserVideos();
      fetchUserCredits(user.id);
      setShowUploadForm(false);
      // Reset form
      setFile(null);
      setTitle("");
      setSummary("");
      setTopic("");
      setDifficulty("");
      setCredits(0);
      setSimilarity(0);
      setSimilarityMessage("");
      setFingerprint("");
      setUniqueness(0);
    } catch (error) {
      console.error("Upload failed:", error);
      if (error.response?.data?.similarity_message) {
        setAlertMessage(error.response.data.similarity_message);
        setAlertType("warning");
      } else {
        setAlertMessage("Upload failed! Please try again.");
        setAlertType("error");
      }
    }
  };

  const handleDeleteVideo = async (videoId, videoCredits) => {
    setVideoToDelete({ id: videoId, credits: videoCredits });
    setShowDeleteDialog(true);
  };

  const confirmDelete = async () => {
    try {
      await API.delete(`/videos/${videoToDelete.id}`);
      setVideos(videos.filter((video) => video._id !== videoToDelete.id));
      setUserTotalCredits((prev) => Math.max(0, prev - videoToDelete.credits));
      setAlertMessage("Video deleted successfully!");
      setAlertType("success");
    } catch (error) {
      console.error("Failed to delete video:", error);
      setAlertMessage("Failed to delete video. Please try again.");
      setAlertType("error");
    } finally {
      setShowDeleteDialog(false);
      setVideoToDelete(null);
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

  return (
    <div className="min-h-screen bg-gradient-to-r from-indigo-600 to-blue-500 pt-16">
      {alertMessage && (
        <div
          className={`mx-4 sm:mx-8 mb-4 px-6 py-4 rounded-lg shadow-sm transition-all duration-300 ${
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

      {/* Header Section */}
      <div className="flex flex-col sm:flex-row justify-between items-center px-4 sm:px-8 py-4 sm:py-6 bg-indigo-700 shadow-md">
        <div className="text-center sm:text-left mb-4 sm:mb-0">
          <h1 className="text-xl sm:text-2xl font-bold text-white">
            Your Videos
          </h1>
          <p className="text-white mt-2">Total Credits: {userTotalCredits}</p>
        </div>
        <button
          onClick={() => setShowUploadForm(!showUploadForm)}
          className="w-full sm:w-auto bg-white text-indigo-700 py-2 px-4 rounded-lg font-semibold hover:bg-gray-100 transition"
        >
          {showUploadForm ? "Close" : "Add Video"}
        </button>
      </div>

      {/* Upload Form */}
      {showUploadForm && (
        <div
          className="flex items-center justify-center py-6 sm:py-8 px-4"
          data-aos="fade-down"
        >
          <div className="bg-white shadow-lg rounded-lg p-6 sm:p-8 w-full max-w-lg">
            <h2 className="text-xl sm:text-2xl font-bold text-gray-800 mb-4">
              Upload a Video
            </h2>

            <div className="space-y-4">
              {/* Title Input */}
              <label className="block">
                <span className="text-gray-700 font-medium">Video Title:</span>
                <input
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="Enter a title for your video"
                  className="mt-2 w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </label>

              {/* File Input */}
              <label className="block">
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
                    <span className="text-sm font-medium truncate">
                      {file ? file.name : "No file chosen"}
                    </span>
                    <span className="text-sm font-semibold">Browse</span>
                  </div>
                </div>
              </label>

              {/* Check Statistics Button */}
              <button
                onClick={handleCheckStatistics}
                className={`w-full py-2 px-4 rounded-lg text-white font-semibold transition ${
                  loading
                    ? "bg-gray-400 cursor-not-allowed"
                    : "bg-indigo-600 hover:bg-indigo-700"
                }`}
                disabled={loading}
              >
                {loading ? "Processing..." : "Check Statistics"}
              </button>

              {/* Analysis Report */}
              <div className="mt-6">
                <h3 className="text-lg font-semibold text-gray-800 mb-4">
                  Analysis Report:
                </h3>
                <div className="bg-gray-100 p-4 rounded-lg shadow space-y-2">
                  <p className="text-gray-700">
                    <strong>Summary:</strong> {summary}
                  </p>
                  <p className="text-gray-700">
                    <strong>Topics:</strong> {topic}
                  </p>
                  <p className="text-gray-700">
                    <strong>Difficulty:</strong> {difficulty}/100
                  </p>
                  <p className="text-gray-700">
                    <strong>Content Uniqueness:</strong> {uniqueness}%
                    <span className="block text-sm text-gray-500 mt-1">
                      (Higher uniqueness results in more credits)
                    </span>
                  </p>
                  {similarity > 0 && (
                    <p className="text-amber-600">
                      <strong>Similarity with existing content:</strong>{" "}
                      {similarity.toFixed(1)}%
                      {similarityMessage && (
                        <span className="block text-sm mt-1">
                          {similarityMessage}
                        </span>
                      )}
                    </p>
                  )}
                  <p
                    className={`font-medium ${
                      credits === 0 ? "text-red-600" : "text-gray-700"
                    }`}
                  >
                    <strong>Final Credits:</strong> {credits}
                    <span className="block text-sm text-gray-500 mt-1">
                      (Based on difficulty, uniqueness, and similarity)
                    </span>
                  </p>
                </div>
              </div>

              {/* Video Preview */}
              {previewUrl && (
                <div className="mt-4">
                  <h4 className="text-gray-700 font-medium mb-2">Preview:</h4>
                  <video
                    className="w-full rounded-lg"
                    src={previewUrl}
                    controls
                    controlsList="nodownload"
                  />
                </div>
              )}

              {/* Upload Button */}
              <button
                onClick={handleUpload}
                className="w-full mt-4 py-2 px-4 rounded-lg bg-green-600 text-white font-semibold hover:bg-green-700 transition"
              >
                Upload
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Videos Grid */}
      <div className="px-4 sm:px-8 py-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
          {videos.length > 0 ? (
            videos.map((video) => (
              <div
                key={video._id}
                className="bg-white shadow-lg rounded-lg p-4 flex flex-col transform transition-all duration-300 hover:shadow-2xl hover:-translate-y-1"
                onMouseEnter={() => handleVideoHover(video._id)}
                onMouseLeave={handleVideoLeave}
                data-aos="fade-up"
              >
                <div className="relative">
                  <div className="aspect-w-16 aspect-h-9 mb-4 group">
                    <video
                      className="w-full h-full rounded-lg object-cover"
                      controlsList="nodownload"
                      disablePictureInPicture
                      playsInline
                      controls
                      onPlay={() => handleVideoPlay(video._id)}
                      onPause={() => handleVideoPause(video._id)}
                    >
                      <source
                        src={`http://localhost:5000/uploads/videos/${video.filename}`}
                        type="video/mp4"
                      />
                      Your browser does not support the video tag.
                    </video>

                    {/* Hover Overlay */}
                    {hoveredVideo === video._id && !isPlaying[video._id] && (
                      <div className="absolute inset-0 bg-black bg-opacity-40 flex items-center justify-center rounded-lg transition-opacity">
                        <svg
                          className="w-16 h-16 text-white opacity-80"
                          fill="currentColor"
                          viewBox="0 0 20 20"
                        >
                          <path
                            fillRule="evenodd"
                            d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                            clipRule="evenodd"
                          />
                        </svg>
                      </div>
                    )}
                  </div>
                  <button
                    onClick={() => handleDeleteVideo(video._id, video.credits)}
                    className="absolute top-2 right-2 bg-red-500 hover:bg-red-600 text-white rounded-full p-2 transition-colors"
                    title="Delete video"
                  >
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="h-5 w-5"
                      viewBox="0 0 20 20"
                      fill="currentColor"
                    >
                      <path
                        fillRule="evenodd"
                        d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z"
                        clipRule="evenodd"
                      />
                    </svg>
                  </button>
                </div>
                <div className="flex-1">
                  <h3 className="text-lg font-semibold text-gray-800 mb-2">
                    {video.title}
                  </h3>
                  <p className="text-gray-600 text-sm mb-2 line-clamp-2">
                    {video.summary}
                  </p>
                  <div className="space-y-1">
                    <p className="text-sm text-gray-500">
                      Topics: {video.topics.join(", ")}
                    </p>
                    <p className="text-sm text-gray-500">
                      Difficulty: {video.difficulty}/100
                    </p>
                    <p className="text-sm text-indigo-600 font-semibold">
                      Credits: {video.credits}
                    </p>
                  </div>
                </div>
                <div className="mt-4 pt-4 border-t border-gray-200">
                  <p className="text-xs text-gray-500">
                    Uploaded: {new Date(video.uploadDate).toLocaleDateString()}
                  </p>
                </div>
              </div>
            ))
          ) : (
            <p className="text-white col-span-full text-center text-lg">
              No videos uploaded yet.
            </p>
          )}
        </div>
      </div>

      <ConfirmDialog
        isOpen={showDeleteDialog}
        onClose={() => setShowDeleteDialog(false)}
        onConfirm={confirmDelete}
        title="Delete Video"
        message="Are you sure you want to delete this video? Your credits will be reduced accordingly."
      />
    </div>
  );
};

export default Videos;
