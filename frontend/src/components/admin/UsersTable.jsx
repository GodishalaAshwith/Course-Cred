import React from "react";

const UsersTable = ({
  users,
  editingUser,
  setEditingUser,
  handleUpdateUser,
  handleDeleteUser,
}) => {
  const handleUserChange = (e, field) => {
    setEditingUser({
      ...editingUser,
      [field]:
        field === "totalCredits"
          ? parseInt(e.target.value)
          : field === "isAdmin"
          ? e.target.checked
          : e.target.value,
    });
  };

  return (
    <div className="bg-gray-800 rounded-lg shadow overflow-x-auto">
      <table className="min-w-full">
        <thead className="bg-gray-900">
          <tr>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase">
              Name
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase">
              Email
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase">
              Credits
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase">
              Admin
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase">
              Actions
            </th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-700">
          {users.map((user) => {
            const isEditing = editingUser && editingUser._id === user._id;
            return (
              <tr key={user._id} className="text-gray-200">
                <td className="px-6 py-4 whitespace-nowrap">
                  {isEditing ? (
                    <input
                      type="text"
                      value={editingUser.name}
                      onChange={(e) => handleUserChange(e, "name")}
                      className="bg-gray-700 text-gray-200 border border-gray-600 rounded px-2 py-1"
                    />
                  ) : (
                    user.name
                  )}
                </td>
                <td className="px-6 py-4 whitespace-nowrap">{user.email}</td>
                <td className="px-6 py-4 whitespace-nowrap">
                  {isEditing ? (
                    <input
                      type="number"
                      value={editingUser.totalCredits}
                      onChange={(e) => handleUserChange(e, "totalCredits")}
                      className="bg-gray-700 text-gray-200 border border-gray-600 rounded px-2 py-1 w-20"
                    />
                  ) : (
                    user.totalCredits
                  )}
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  {isEditing ? (
                    <input
                      type="checkbox"
                      checked={editingUser.isAdmin}
                      onChange={(e) => handleUserChange(e, "isAdmin")}
                      className="rounded bg-gray-700 border-gray-600"
                    />
                  ) : user.isAdmin ? (
                    "Yes"
                  ) : (
                    "No"
                  )}
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  {isEditing ? (
                    <div className="space-x-2">
                      <button
                        onClick={() => handleUpdateUser(user._id, editingUser)}
                        className="bg-green-500 text-white hover:bg-green-600 px-3 py-1 rounded"
                      >
                        Save
                      </button>
                      <button
                        onClick={() => setEditingUser(null)}
                        className="bg-gray-500 text-white hover:bg-gray-600 px-3 py-1 rounded"
                      >
                        Cancel
                      </button>
                    </div>
                  ) : (
                    <div className="space-x-2">
                      <button
                        onClick={() => setEditingUser(user)}
                        className="bg-blue-500 text-white hover:bg-blue-600 px-3 py-1 rounded"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => handleDeleteUser(user._id)}
                        className="bg-red-500 text-white hover:bg-red-600 px-3 py-1 rounded"
                      >
                        Delete
                      </button>
                    </div>
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

export default UsersTable;
