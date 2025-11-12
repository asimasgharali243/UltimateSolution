import React from "react";

export function Terms() {
  return (
    <div className="space-y-4 py-6 shadow-lg p-4 rounded-md shadow-gray-400">
      <div className="grid grid-cols-4 gap-4">
        <div>
          <label className="block text-sm text-gray-600 mb-1">
            Payment Term days
          </label>
          <input
            type="number"
            className="w-full rounded border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-emerald-500"
            placeholder="0"
            defaultValue="0"
          />
        </div>
        <div>
          <label className="block text-sm text-gray-600 mb-1">
            Credit Limit
          </label>
          <input
            type="number"
            className="w-full rounded border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-emerald-500"
            placeholder="0.00"
            defaultValue="0.00"
          />
        </div>
        <div>
          <label className="block text-sm text-gray-600 mb-1">
            Opening Date
          </label>
          <input
            type="date"
            className="w-full rounded border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-emerald-500"
            defaultValue="2025-10-17"
          />
        </div>
        <div>
          <label className="block text-sm text-gray-600 mb-1">
            Opening Balance
          </label>
          <input
            type="number"
            className="w-full rounded border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-emerald-500"
            placeholder="0.00"
            defaultValue="0.00"
          />
        </div>
      </div>

      <div className="grid grid-cols-4 gap-4">
        <div>
          <label className="block text-sm text-gray-600 mb-1">Discount</label>
          <input
            type="number"
            className="w-full rounded border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-emerald-500"
            placeholder="0.00"
            defaultValue="0.00"
          />
        </div>
        <div className="flex items-center space-x-2 pt-6">
          <input
            type="checkbox"
            id="creditLimit"
            className="w-4 h-4 text-emerald-600 bg-gray-100 border-gray-300 rounded focus:ring-emerald-500"
          />
          <label htmlFor="creditLimit" className="text-sm text-gray-600">
            Apply Credit Limit
          </label>
        </div>
        <div className="flex items-center space-x-2 pt-6">
          <input
            type="checkbox"
            id="supplier"
            className="w-4 h-4 text-emerald-600 bg-gray-100 border-gray-300 rounded focus:ring-emerald-500"
          />
          <label htmlFor="supplier" className="text-sm text-gray-600">
            Supplier
          </label>
        </div>
        <div className="flex items-center space-x-2 pt-6">
          <input
            type="checkbox"
            id="filer"
            className="w-4 h-4 text-emerald-600 bg-gray-100 border-gray-300 rounded focus:ring-emerald-500"
            defaultChecked
          />
          <label htmlFor="filer" className="text-sm text-gray-600">
            Filer
          </label>
        </div>
      </div>
    </div>
  );
}
