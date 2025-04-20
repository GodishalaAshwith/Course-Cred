import React from "react";

const AdminDashboard = ({ stats }) => {
  if (!stats) return null;

  const items = [
    { title: "Total Users", value: stats.totalUsers },
    { title: "Total Videos", value: stats.totalVideos },
    { title: "Total Transactions", value: stats.totalTransactions },
    { title: "Total Credits in System", value: stats.totalCreditsInSystem },
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
      {items.map((item, index) => (
        <div key={index} className="bg-white p-6 rounded-lg shadow">
          <h3 className="text-lg font-semibold text-gray-700">{item.title}</h3>
          <p className="text-3xl font-bold text-indigo-600">{item.value}</p>
        </div>
      ))}
    </div>
  );
};

export default AdminDashboard;
