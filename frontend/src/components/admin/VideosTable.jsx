import React from "react";

const VideosTable = ({
  videos,
  editingVideo,
  setEditingVideo,
  handleUpdateVideo,
}) => {
  const handleVideoChange = (e, field) => {
    setEditingVideo({
      ...editingVideo,
      [field]: field === "credits" ? parseInt(e.target.value) : e.target.value,
    });
  };

  return (
    <div className="bg-gray-800 rounded-lg shadow overflow-x-auto">
      <table className="min-w-full">
        <thead className="bg-gray-900">
          <tr>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase">
              Title
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase">
              Owner
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase">
              Credits
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase">
              Difficulty
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase">
              Actions
            </th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-700">
          {videos.map((video) => {
            const isEditing = editingVideo && editingVideo._id === video._id;
            return (
              <tr key={video._id} className="text-gray-200">
                <td className="px-6 py-4 whitespace-nowrap">
                  {isEditing ? (
                    <input
                      type="text"
                      value={editingVideo.title}
                      onChange={(e) => handleVideoChange(e, "title")}
                      className="bg-gray-700 text-gray-200 border border-gray-600 rounded px-2 py-1"
                    />
                  ) : (
                    video.title
                  )}
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  {video.owner?.name || "Unknown"}
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  {isEditing ? (
                    <input
                      type="number"
                      value={editingVideo.credits}
                      onChange={(e) => handleVideoChange(e, "credits")}
                      className="bg-gray-700 text-gray-200 border border-gray-600 rounded px-2 py-1 w-20"
                    />
                  ) : (
                    video.credits
                  )}
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  {isEditing ? (
                    <input
                      type="text"
                      value={editingVideo.difficulty}
                      onChange={(e) => handleVideoChange(e, "difficulty")}
                      className="bg-gray-700 text-gray-200 border border-gray-600 rounded px-2 py-1"
                    />
                  ) : (
                    video.difficulty
                  )}
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  {isEditing ? (
                    <div className="space-x-2">
                      <button
                        onClick={() =>
                          handleUpdateVideo(video._id, editingVideo)
                        }
                        className="bg-green-500 text-white hover:bg-green-600 px-3 py-1 rounded"
                      >
                        Save
                      </button>
                      <button
                        onClick={() => setEditingVideo(null)}
                        className="bg-gray-500 text-white hover:bg-gray-600 px-3 py-1 rounded"
                      >
                        Cancel
                      </button>
                    </div>
                  ) : (
                    <button
                      onClick={() => setEditingVideo(video)}
                      className="bg-blue-500 text-white hover:bg-blue-600 px-3 py-1 rounded"
                    >
                      Edit
                    </button>
                  )}
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
};

export default VideosTable;
