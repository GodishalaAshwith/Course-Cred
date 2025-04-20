import React from "react";

const TransactionsTable = ({ transactions }) => {
  return (
    <div className="bg-white rounded-lg shadow overflow-x-auto">
      <table className="min-w-full">
        <thead className="bg-gray-50">
          <tr>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
              Video
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
              Buyer
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
              Seller
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
              Credits
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
              Date
            </th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-200">
          {transactions.map((transaction) => (
            <tr key={transaction._id}>
              <td className="px-6 py-4 whitespace-nowrap">
                {transaction.video?.title || "Deleted Video"}
              </td>
              <td className="px-6 py-4 whitespace-nowrap">
                {transaction.buyer?.name || "Deleted User"}
              </td>
              <td className="px-6 py-4 whitespace-nowrap">
                {transaction.seller?.name || "Deleted User"}
              </td>
              <td className="px-6 py-4 whitespace-nowrap">
                {transaction.credits}
              </td>
              <td className="px-6 py-4 whitespace-nowrap">
                {new Date(transaction.createdAt).toLocaleDateString()}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default TransactionsTable;
