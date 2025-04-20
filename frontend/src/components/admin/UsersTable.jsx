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
    <div className="bg-white rounded-lg shadow overflow-x-auto">
      <table className="min-w-full">
        <thead className="bg-gray-50">
          <tr>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
              Name
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
              Email
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
              Credits
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
              Admin
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
              Actions
            </th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-200">
          {users.map((user) => {
            const isEditing = editingUser && editingUser._id === user._id;
            return (
              <tr key={user._id}>
                <td className="px-6 py-4 whitespace-nowrap">
                  {isEditing ? (
                    <input
                      type="text"
                      value={editingUser.name}
                      onChange={(e) => handleUserChange(e, "name")}
                      className="border rounded px-2 py-1"
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
                      className="border rounded px-2 py-1 w-20"
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
                      className="rounded"
                    />
                  ) : user.isAdmin ? (
                    "Yes"
                  ) : (
                    "No"
                  )}
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  {isEditing ? (
                    <div>
                      <button
                        onClick={() => handleUpdateUser(user._id, editingUser)}
                        className="text-green-600 hover:text-green-900 mr-2"
                      >
                        Save
                      </button>
                      <button
                        onClick={() => setEditingUser(null)}
                        className="text-gray-600 hover:text-gray-900"
                      >
                        Cancel
                      </button>
                    </div>
                  ) : (
                    <div>
                      <button
                        onClick={() => setEditingUser(user)}
                        className="text-indigo-600 hover:text-indigo-900 mr-2"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => handleDeleteUser(user._id)}
                        className="text-red-600 hover:text-red-900"
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
