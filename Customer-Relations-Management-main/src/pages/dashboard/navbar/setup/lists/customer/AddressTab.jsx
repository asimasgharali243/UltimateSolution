import React from "react";

export function AddressTab() {
  return (
    <div className="space-y-2 py-6 shadow-lg p-4 rounded-md shadow-gray-400">
      <div>
        <label className="block text-sm text-gray-600 mb-2">
          Billing Address
        </label>
        <textarea
          className="w-[50%] text-sm rounded border border-gray-300 px-3 py-2  resize-none focus:outline-none focus:ring-2 focus:ring-emerald-500"
          placeholder="Enter billing address"
        />
      </div>

      <div className="grid grid-cols-4 gap-5">
        <div>
          <input
            type="text"
            className="w-full rounded border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-emerald-500"
            placeholder="Enter city"
          />
        </div>
        <div>
          <input
            type="text"
            className="w-full rounded border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-emerald-500"
            placeholder="Enter state"
          />
        </div>
      </div>

      <div className="grid grid-cols-4 gap-5">
        <div>
          <input
            type="text"
            className="w-full rounded border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-emerald-500"
            placeholder="Enter zip code"
          />
        </div>
        <div>
          <select className="w-full rounded border border-gray-300 px-3 pr-3 py-2 focus:outline-none focus:ring-2 focus:ring-emerald-500">
            <option>Pakistan</option>
            <option>United States</option>
            <option>United Kingdom</option>
            <option>Canada</option>
          </select>
        </div>
      </div>
    </div>
  );
}
