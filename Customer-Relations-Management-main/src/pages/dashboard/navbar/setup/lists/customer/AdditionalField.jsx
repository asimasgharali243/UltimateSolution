import React from "react";

export function AdditionalField() {
  return (
    <div className="space-y-4 py-6 shadow-lg p-4 rounded-md shadow-gray-400">
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm text-gray-600 mb-1">Field 1</label>
          <select className="w-full rounded border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-emerald-500">
            <option>Select</option>
            <option>Option 1</option>
            <option>Option 2</option>
            <option>Option 3</option>
          </select>
        </div>
        <div>
          <label className="block text-sm text-gray-600 mb-1">Field A</label>
          <input
            type="text"
            className="w-full rounded border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-emerald-500"
            placeholder="Enter field A value"
          />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm text-gray-600 mb-1">Field 2</label>
          <select className="w-full rounded border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-emerald-500">
            <option>Select</option>
            <option>Option 1</option>
            <option>Option 2</option>
            <option>Option 3</option>
          </select>
        </div>
        <div>
          <label className="block text-sm text-gray-600 mb-1">Field B</label>
          <input
            type="text"
            className="w-full rounded border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-emerald-500"
            placeholder="Enter field B value"
          />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm text-gray-600 mb-1">Field 3</label>
          <select className="w-full rounded border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-emerald-500">
            <option>Select</option>
            <option>Option 1</option>
            <option>Option 2</option>
            <option>Option 3</option>
          </select>
        </div>
        <div>
          <label className="block text-sm text-gray-600 mb-1">Field C</label>
          <input
            type="text"
            className="w-full rounded border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-emerald-500"
            placeholder="Enter field C value"
          />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm text-gray-600 mb-1">Field 4</label>
          <select className="w-full rounded border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-emerald-500">
            <option>Select</option>
            <option>Option 1</option>
            <option>Option 2</option>
            <option>Option 3</option>
          </select>
        </div>
        <div>
          <label className="block text-sm text-gray-600 mb-1">Field D</label>
          <input
            type="text"
            className="w-full rounded border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-emerald-500"
            placeholder="Enter field D value"
          />
        </div>
      </div>
    </div>
  );
}
