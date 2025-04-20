import React, { useEffect, useState } from "react";
import AOS from "aos";
import API from "../utils/api";
import "aos/dist/aos.css";

const BrowseVideos = () => {
  const [videos, setVideos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [user, setUser] = useState(null);

  useEffect(() => {
    AOS.init({ duration: 1000, once: false, mirror: true });
    fetchVideos();
    fetchUserData();
  }, []);

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
        alert("Insufficient credits to purchase this video!");
        return;
      }

      const response = await API.post(`/videos/purchase/${videoId}`);
      alert("Video purchased successfully!");

      // Update user data to reflect new credit balance
      fetchUserData();
      // Refresh videos list
      fetchVideos();
    } catch (error) {
      console.error("Purchase error:", error);
      alert(error.response?.data?.message || "Failed to purchase video");
    }
  };

  if (loading)
    return (
      <div className="min-h-screen bg-gradient-to-r from-indigo-600 to-blue-500 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-white"></div>
      </div>
    );

  return (
    <div className="min-h-screen bg-gradient-to-r from-indigo-600 to-blue-500 pt-20 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        <div className="bg-white rounded-lg shadow-xl p-6 mb-8">
          <div className="flex justify-between items-center">
            <h1 className="text-2xl font-bold text-gray-800">Browse Videos</h1>
            {user && (
              <p className="text-lg font-semibold text-indigo-600">
                Your Credits: {user.totalCredits}
              </p>
            )}
          </div>
        </div>

        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
            {error}
          </div>
        )}

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {videos.map((video) => {
            const isOwner = user?._id === video.owner._id;
            const isPurchased = user?.purchasedVideos?.includes(video._id);

            return (
              <div
                key={video._id}
                className="bg-white rounded-lg shadow-xl overflow-hidden"
                data-aos="fade-up"
              >
                <div className="aspect-w-16 aspect-h-9">
                  <video
                    className="w-full h-48 object-cover"
                    src={`http://localhost:5000/uploads/videos/${video.filename}`}
                    controls={isPurchased || isOwner}
                    controlsList="nodownload"
                    poster={`http://localhost:5000/uploads/videos/${video.filename}#t=0.1`}
                  >
                    Your browser does not support the video tag.
                  </video>
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
                        className="bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700 transition-colors"
                        disabled={loading || user?.totalCredits < video.credits}
                      >
                        Purchase
                      </button>
                    )}
                    {(isOwner || isPurchased) && (
                      <span className="text-green-600 font-medium">
                        {isOwner ? "Your Video" : "Purchased"}
                      </span>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default BrowseVideos;
