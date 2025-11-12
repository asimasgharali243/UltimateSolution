import React from "react";

export function Taxinfo() {
  return (
    <div className="space-y-4 shadow-lg py-6 p-4 rounded-md shadow-gray-400">
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm text-gray-600 mb-1">NTN</label>
          <input
            type="text"
            className="w-full rounded border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-emerald-500"
            placeholder="NTN"
          />
        </div>
        <div>
          <label className="block text-sm text-gray-600 mb-1">STN</label>
          <input
            type="text"
            className="w-full rounded border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-emerald-500"
            placeholder="STN"
          />
        </div>
      </div>

      <div>
        <label className="block text-sm text-gray-600 mb-1">CNIC</label>
        <input
          type="text"
          className="w-[50%] rounded border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-emerald-500"
          placeholder="CNIC"
        />
      </div>
    </div>
  );
}
