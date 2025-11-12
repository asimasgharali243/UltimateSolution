import React from "react";

export function Notes() {
  return (
    <div className="space-y-4 py-6 shadow-lg p-4 rounded-md shadow-gray-400">
      <div>
        <label className="block text-sm text-gray-600 mb-1">Notes</label>
        <textarea
          className="w-full rounded border border-gray-300 px-3 py-2 h-32 resize-none focus:outline-none focus:ring-2 focus:ring-emerald-500"
          placeholder="Enter notes here..."
        />
      </div>
    </div>
  );
}
