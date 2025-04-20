import React from "react";

const TransactionsTable = ({ transactions }) => {
  return (
    <div className="bg-gray-800 rounded-lg shadow overflow-x-auto">
      <table className="min-w-full">
        <thead className="bg-gray-900">
          <tr>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase">
              Video
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase">
              Buyer
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase">
              Seller
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase">
              Credits
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase">
              Date
            </th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-700">
          {transactions.map((transaction) => (
            <tr key={transaction._id} className="text-gray-200">
              <td className="px-6 py-4 whitespace-nowrap">
                {transaction.video?.title || "Unknown Video"}
              </td>
              <td className="px-6 py-4 whitespace-nowrap">
                {transaction.buyer?.name || "Unknown Buyer"}
              </td>
              <td className="px-6 py-4 whitespace-nowrap">
                {transaction.seller?.name || "Unknown Seller"}
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
