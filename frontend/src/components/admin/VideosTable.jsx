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
    <div className="bg-white rounded-lg shadow overflow-x-auto">
      <table className="min-w-full">
        <thead className="bg-gray-50">
          <tr>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
              Title
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
              Owner
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
              Credits
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
              Difficulty
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
              Actions
            </th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-200">
          {videos.map((video) => {
            const isEditing = editingVideo && editingVideo._id === video._id;
            return (
              <tr key={video._id}>
                <td className="px-6 py-4 whitespace-nowrap">
                  {isEditing ? (
                    <input
                      type="text"
                      value={editingVideo.title}
                      onChange={(e) => handleVideoChange(e, "title")}
                      className="border rounded px-2 py-1"
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
                      className="border rounded px-2 py-1 w-20"
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
                      className="border rounded px-2 py-1"
                    />
                  ) : (
                    video.difficulty
                  )}
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  {isEditing ? (
                    <div>
                      <button
                        onClick={() =>
                          handleUpdateVideo(video._id, editingVideo)
                        }
                        className="text-green-600 hover:text-green-900 mr-2"
                      >
                        Save
                      </button>
                      <button
                        onClick={() => setEditingVideo(null)}
                        className="text-gray-600 hover:text-gray-900"
                      >
                        Cancel
                      </button>
                    </div>
                  ) : (
                    <button
                      onClick={() => setEditingVideo(video)}
                      className="text-indigo-600 hover:text-indigo-900"
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
