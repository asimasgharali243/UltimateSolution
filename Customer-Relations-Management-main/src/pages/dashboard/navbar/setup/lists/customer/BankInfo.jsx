import React from "react";

export function BankInfo() {
  return (
    <div className="space-y-4 py-6 shadow-lg p-4 rounded-md shadow-gray-400">
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm text-gray-600 mb-1">Bank Name</label>
          <input
            type="text"
            className="w-full rounded border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-emerald-500"
            placeholder="Enter bank name"
          />
        </div>
        <div>
          <label className="block text-sm text-gray-600 mb-1">
            Account Name
          </label>
          <input
            type="text"
            className="w-full rounded border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-emerald-500"
            placeholder="Enter account name"
          />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm text-gray-600 mb-1">
            Account Number
          </label>
          <input
            type="text"
            className="w-full rounded border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-emerald-500"
            placeholder="Enter account number"
          />
        </div>
        <div>
          <label className="block text-sm text-gray-600 mb-1">IBAN</label>
          <input
            type="text"
            className="w-full rounded border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-emerald-500"
            placeholder="Enter IBAN number"
          />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm text-gray-600 mb-1">Swift Code</label>
          <input
            type="text"
            className="w-full rounded border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-emerald-500"
            placeholder="Enter field C value"
          />
        </div>
        <div>
          <label className="block text-sm text-gray-600 mb-1">Address</label>
          <input
            type="text"
            className="w-full rounded border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-emerald-500"
            placeholder="Enter field C value"
          />
        </div>
      </div>
    </div>
  );
}
