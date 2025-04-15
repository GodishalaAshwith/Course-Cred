import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import AOS from "aos";
import "aos/dist/aos.css";
import axios from "axios";

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
      const response = await axios.get(`http://localhost:5000/api/auth/user`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      });
      setUserTotalCredits(response.data.totalCredits || 0);
    } catch (error) {
      console.error("Failed to fetch user credits:", error);
    }
  };

  const fetchUserVideos = async () => {
    try {
      const response = await axios.get(
        "http://localhost:5000/api/videos/user-videos",
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        }
      );
      setVideos(response.data);
    } catch (error) {
      console.error("Failed to fetch videos:", error);
    }
  };

  const handleFileChange = (e) => {
    setFile(e.target.files[0]);
  };

  const handleCheckStatistics = async () => {
    if (!file) {
      alert("Please select a file first!");
      return;
    }

    setLoading(true);
    const formData = new FormData();
    formData.append("video", file);

    try {
      const response = await axios.post(
        "http://localhost:5000/api/videos/analyze",
        formData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        }
      );

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
        alert(
          "This video appears to be a duplicate. No credits will be awarded."
        );
      } else if (response.data.similarity > 0) {
        alert(
          `This video has ${response.data.similarity.toFixed(
            1
          )}% similarity with existing content. Credits have been adjusted accordingly.`
        );
      }
    } catch (error) {
      console.error("Statistics check failed:", error);
      alert("Failed to check statistics! Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleUpload = async () => {
    if (!file || !title) {
      alert("Please select a file and provide a title!");
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
      const response = await axios.post(
        "http://localhost:5000/api/videos/upload",
        formData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        }
      );

      if (response.data.similarity_message) {
        alert(response.data.similarity_message);
      } else {
        alert("Video uploaded successfully!");
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
        alert(error.response.data.similarity_message);
      } else {
        alert("Upload failed! Please try again.");
      }
    }
  };

  const handleDeleteVideo = async (videoId, videoCredits) => {
    if (
      !window.confirm(
        "Are you sure you want to delete this video? Your credits will be reduced accordingly."
      )
    ) {
      return;
    }

    try {
      await axios.delete(`http://localhost:5000/api/videos/${videoId}`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      });

      // Update local state
      setVideos(videos.filter((video) => video._id !== videoId));
      setUserTotalCredits((prev) => Math.max(0, prev - videoCredits));
      alert("Video deleted successfully!");
    } catch (error) {
      console.error("Failed to delete video:", error);
      alert("Failed to delete video. Please try again.");
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-r from-indigo-600 to-blue-500 pt-16">
      <div className="flex justify-between items-center px-8 py-6 bg-indigo-700 shadow-md">
        <div>
          <h1 className="text-2xl font-bold text-white">Your Videos</h1>
          <p className="text-white mt-2">Total Credits: {userTotalCredits}</p>
        </div>
        <button
          onClick={() => setShowUploadForm(!showUploadForm)}
          className="bg-white text-indigo-700 py-2 px-4 rounded-lg font-semibold hover:bg-gray-100 transition"
        >
          {showUploadForm ? "Close" : "Add Video"}
        </button>
      </div>

      {showUploadForm && (
        <div className="flex items-center justify-center py-8">
          <div className="bg-white shadow-lg rounded-lg p-8 w-full max-w-lg">
            <h2 className="text-2xl font-bold text-gray-800 mb-4">
              Upload a Video
            </h2>

            <label className="block mb-4">
              <span className="text-gray-700 font-medium">Video Title:</span>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Enter a title for your video"
                className="mt-2 w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </label>

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

            <div className="mt-8">
              <h3 className="text-lg font-semibold text-gray-800 mb-4">
                Analysis Report:
              </h3>
              <div className="bg-gray-100 p-4 rounded-lg shadow">
                <p className="text-gray-700 mb-2">
                  <strong>Summary:</strong> {summary}
                </p>
                <p className="text-gray-700 mb-2">
                  <strong>Topics:</strong> {topic}
                </p>
                <p className="text-gray-700 mb-2">
                  <strong>Difficulty:</strong> {difficulty}/100
                </p>
                <p className="text-gray-700 mb-2">
                  <strong>Content Uniqueness:</strong> {uniqueness}%
                  <span className="ml-2 text-sm text-gray-500">
                    (Higher uniqueness results in more credits)
                  </span>
                </p>
                {similarity > 0 && (
                  <p className="text-amber-600 mb-2">
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
                  <span className="ml-2 text-sm text-gray-500">
                    (Based on difficulty, uniqueness, and similarity)
                  </span>
                </p>
              </div>
            </div>

            <button
              onClick={handleUpload}
              className="w-full mt-4 py-2 px-4 rounded-lg bg-green-600 text-white font-semibold hover:bg-green-700 transition"
            >
              Upload
            </button>
          </div>
        </div>
      )}

      <div className="px-8 py-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {videos.length > 0 ? (
            videos.map((video) => (
              <div
                key={video._id}
                className="bg-white shadow-lg rounded-lg p-4 flex flex-col"
              >
                <div className="relative">
                  <div className="aspect-w-16 aspect-h-9 mb-4">
                    <video
                      className="w-full h-full rounded-lg object-cover"
                      controlsList="nodownload"
                      disablePictureInPicture
                      playsInline
                      controls
                    >
                      <source
                        src={`http://localhost:5000/uploads/videos/${video.filename}`}
                        type="video/mp4"
                      />
                      Your browser does not support the video tag.
                    </video>
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
                  <p className="text-gray-600 text-sm mb-2">{video.summary}</p>
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
            <p className="text-white col-span-3 text-center text-lg">
              No videos uploaded yet.
            </p>
          )}
        </div>
      </div>
    </div>
  );
};

export default Videos;
