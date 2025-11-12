import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { ChevronDown, X } from "lucide-react";

export function ProductForm() {
  const navigate = useNavigate();
  const [showFBROptions, setShowFBROptions] = useState(false);
  const [showAdvanceOptions, setShowAdvanceOptions] = useState(false);
  const [image, setImage] = useState(null);

  // Drag & drop handlers
  const handleDrop = (e) => {
    e.preventDefault();
    const file = e.dataTransfer.files[0];
    if (file && file.type.startsWith("image/")) {
      setImage(URL.createObjectURL(file));
    }
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file && file.type.startsWith("image/")) {
      setImage(URL.createObjectURL(file));
    }
  };

  const handleRemoveImage = () => {
    setImage(null);
  };

  const handleClose = () => {
    navigate(-1);
  };

  const handleSave = () => {
    console.log("Product saved");
    navigate(-1);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/40" onClick={handleClose} />

      {/* Dialog */}
      <div className="relative bg-white w-full max-w-6xl mx-4 rounded-lg shadow-2xl overflow-hidden max-h-[95vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-2 border-b bg-gray-50">
          <h3 className="text-base font-medium text-gray-800">
            Add Stock Product
          </h3>
          <button
            onClick={handleClose}
            className="text-gray-500 hover:text-gray-800"
          >
            <X size={20} />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6">
          <div className="grid grid-cols-12 gap-4">
            {/* Left Column */}
            <div className="col-span-6 space-y-3">
              {/* Name */}
              <div>
                <label className="block text-xs text-gray-600 mb-1">
                  Name <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  className="w-full rounded border border-gray-300 px-2 py-1.5 text-sm focus:outline-none focus:ring-1 focus:ring-emerald-500"
                  placeholder="Name"
                />
              </div>

              {/* Code/Number */}
              <div>
                <label className="block text-xs text-gray-600 mb-1">
                  Code / Number
                </label>
                <input
                  type="text"
                  className="w-full rounded border border-gray-300 px-2 py-1.5 text-sm focus:outline-none focus:ring-1 focus:ring-emerald-500"
                  placeholder="code/number"
                />
              </div>

              {/* Category */}
              <div>
                <label className="block text-xs text-gray-600 mb-1">
                  Category
                </label>
                <select className="w-full rounded border border-gray-300 px-2 py-1.5 text-sm focus:outline-none focus:ring-1 focus:ring-emerald-500  ">
                  <option>Select...</option>
                  <option>Electronics</option>
                  <option>Clothing</option>
                  <option>Food & Beverages</option>
                </select>
              </div>

              {/* Sale Information */}
              <div>
                <label className="block text-xs text-gray-600 mb-1">
                  Sale Information
                </label>
                <textarea
                  className="w-full rounded border border-gray-300 px-2 py-1.5 text-sm h-24 resize-none focus:outline-none focus:ring-1 focus:ring-emerald-500"
                  placeholder=""
                />
              </div>

              {/* Notes */}
              <div>
                <label className="block text-xs text-gray-600 mb-1">
                  Notes
                </label>
                <textarea
                  className="w-full rounded border border-gray-300 px-2 py-1.5 text-sm h-24 resize-none focus:outline-none focus:ring-1 focus:ring-emerald-500"
                  placeholder=""
                />
              </div>
            </div>

            {/* Right Column - Exact Layout from Screenshot */}
            <div className="col-span-6 space-y-3">
              {/* Date, Opening Quantity, Opening Rate Row */}
              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block text-xs text-gray-600 mb-1">
                    Date <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="date"
                    className="w-full rounded border border-gray-300 px-2 py-1.5 text-sm focus:outline-none focus:ring-1 focus:ring-emerald-500"
                    defaultValue="2025-10-17"
                  />
                </div>
                <div>
                  <label className="block text-xs text-gray-600 mb-1">
                    Opening Quantity <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="number"
                    className="w-full rounded border border-gray-300 px-2 py-1.5 text-sm focus:outline-none focus:ring-1 focus:ring-emerald-500"
                    defaultValue="0"
                  />
                </div>
                <div>
                  <label className="block text-xs text-gray-600 mb-1">
                    Opening Rate <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="number"
                    className="w-full rounded border border-gray-300 px-2 py-1.5 text-sm focus:outline-none focus:ring-1 focus:ring-emerald-500"
                    defaultValue="0"
                  />
                </div>
              </div>

              {/* Stock Asset Account and Low Stock Level Row */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs text-gray-600 mb-1">
                    Stock Asset Account
                  </label>
                  <select className="w-full rounded border border-gray-300 px-2 py-1.5 text-sm focus:outline-none focus:ring-1 focus:ring-emerald-500">
                    <option>Stock (230101)</option>
                    <option>Inventory Asset (230102)</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs text-gray-600 mb-1">
                    Low Stock Level
                  </label>
                  <input
                    type="number"
                    className="w-full rounded border border-gray-300 px-2 py-1.5 text-sm focus:outline-none focus:ring-1 focus:ring-emerald-500"
                    defaultValue="0"
                  />
                </div>
              </div>

              {/* Income Account and Sale Price/Rate Row */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs text-gray-600 mb-1">
                    Income Account
                  </label>
                  <select className="w-full rounded border border-gray-300 px-2 py-1.5 text-sm focus:outline-none focus:ring-1 focus:ring-emerald-500">
                    <option>Sales of Product Income (410101)</option>
                    <option>Service Revenue (410102)</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs text-gray-600 mb-1">
                    Sale Price / Rate
                  </label>
                  <input
                    type="number"
                    className="w-full rounded border border-gray-300 px-2 py-1.5 text-sm focus:outline-none focus:ring-1 focus:ring-emerald-500"
                    defaultValue="0"
                  />
                </div>
              </div>

              {/* Expense Account and Cost Row */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs text-gray-600 mb-1">
                    Expense Account
                  </label>
                  <select className="w-full rounded border border-gray-300 px-2 py-1.5 text-sm focus:outline-none focus:ring-1 focus:ring-emerald-500">
                    <option>Supplies and materials (510201)</option>
                    <option>Cost of Goods Sold (510202)</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs text-gray-600 mb-1">
                    Cost
                  </label>
                  <input
                    type="number"
                    className="w-full rounded border border-gray-300 px-2 py-1.5 text-sm focus:outline-none focus:ring-1 focus:ring-emerald-500"
                    defaultValue="0"
                  />
                </div>
              </div>

              {/* Sale Discount, Purchase Discount, Weight, Unit Row */}
              <div className="grid grid-cols-4 gap-3">
                <div>
                  <label className="block text-xs text-gray-600 mb-1">
                    Sale Discount (%)
                  </label>
                  <input
                    type="number"
                    className="w-full rounded border border-gray-300 px-2 py-1.5 text-sm focus:outline-none focus:ring-1 focus:ring-emerald-500"
                    defaultValue="0"
                  />
                </div>
                <div>
                  <label className="block text-xs text-gray-600 mb-1">
                    Purchase Discount (%)
                  </label>
                  <input
                    type="number"
                    className="w-full rounded border border-gray-300 px-2 py-1.5 text-sm focus:outline-none focus:ring-1 focus:ring-emerald-500"
                    defaultValue="0"
                  />
                </div>
                <div>
                  <label className="block text-xs text-gray-600 mb-1">
                    Weight
                  </label>
                  <input
                    type="number"
                    className="w-full rounded border border-gray-300 px-2 py-1.5 text-sm focus:outline-none focus:ring-1 focus:ring-emerald-500"
                    defaultValue="0"
                  />
                </div>
                <div>
                  <label className="block text-xs text-gray-600 mb-1">
                    Unit
                  </label>
                  <select className="w-full rounded border border-gray-300 px-2 py-1.5 text-sm focus:outline-none focus:ring-1 focus:ring-emerald-500">
                    <option>Select...</option>
                    <option>Pieces</option>
                    <option>Kg</option>
                    <option>Liters</option>
                  </select>
                </div>
              </div>

              {/* GST Rate, Non-Filer GST Rate, MRP Ex. Tax, MRP Inc. Tax Row */}
              <div className="grid grid-cols-4 gap-3">
                <div>
                  <label className="block text-xs text-gray-600 mb-1">
                    GST Rate
                  </label>
                  <select className="w-full rounded border border-gray-300 px-2 py-1.5 text-sm focus:outline-none focus:ring-1 focus:ring-emerald-500">
                    <option>No Rate</option>
                    <option>5%</option>
                    <option>17%</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs text-gray-600 mb-1">
                    Non-Filer GST Rate
                  </label>
                  <select className="w-full rounded border border-gray-300 px-2 py-1.5 text-sm focus:outline-none focus:ring-1 focus:ring-emerald-500">
                    <option>No Rate</option>
                    <option>5%</option>
                    <option>17%</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs text-gray-600 mb-1">
                    MRP Ex. Tax
                  </label>
                  <input
                    type="number"
                    className="w-full rounded border border-gray-300 px-2 py-1.5 text-sm focus:outline-none focus:ring-1 focus:ring-emerald-500"
                    defaultValue="0"
                  />
                </div>
                <div>
                  <label className="block text-xs text-gray-600 mb-1">
                    MRP Inc. Tax
                  </label>
                  <input
                    type="number"
                    className="w-full rounded border border-gray-300 px-2 py-1.5 text-sm focus:outline-none focus:ring-1 focus:ring-emerald-500"
                    defaultValue="0"
                  />
                </div>
              </div>

              {/* Bin Location, Large Pack Size, Small Pack Size, Preferred Supplier Row */}
              <div className="grid grid-cols-4 gap-3">
                <div>
                  <label className="block text-xs text-gray-600 mb-1">
                    Bin Location
                  </label>
                  <input
                    type="text"
                    className="w-full rounded border border-gray-300 px-2 py-1.5 text-sm focus:outline-none focus:ring-1 focus:ring-emerald-500"
                    placeholder="Bin Location"
                  />
                </div>
                <div>
                  <label className="block text-xs text-gray-600 mb-1">
                    Large Pack Size
                  </label>
                  <input
                    type="number"
                    className="w-full rounded border border-gray-300 px-2 py-1.5 text-sm focus:outline-none focus:ring-1 focus:ring-emerald-500"
                    defaultValue="1"
                  />
                </div>
                <div>
                  <label className="block text-xs text-gray-600 mb-1">
                    Small Pack Size
                  </label>
                  <input
                    type="number"
                    className="w-full rounded border border-gray-300 px-2 py-1.5 text-sm focus:outline-none focus:ring-1 focus:ring-emerald-500"
                    defaultValue="1"
                  />
                </div>
                <div>
                  <label className="block text-xs text-gray-600 mb-1">
                    Preferred Supplier
                  </label>
                  <select className="w-full rounded border border-gray-300 px-2 py-1.5 text-sm focus:outline-none focus:ring-1 focus:ring-emerald-500">
                    <option>No Supplier</option>
                    <option>ABC Suppliers</option>
                    <option>XYZ Trading</option>
                  </select>
                </div>
              </div>
            </div>
          </div>

          {/* FBR Options Dropdown */}
          <div className="mt-6">
            <button
              onClick={() => setShowFBROptions(!showFBROptions)}
              className="flex items-center space-x-2 text-left w-full"
              style={{ padding: "0.5rem 0", fontWeight: 500 }}
            >
              <ChevronDown
                size={18}
                className={`transition-transform ${
                  showFBROptions ? "rotate-180" : ""
                }`}
              />
              <span className="text-sm text-gray-800">FBR Options</span>
            </button>
            {showFBROptions && (
              <div className="p-4 bg-gray-50 border rounded mt-2">
                <div className="grid grid-cols-6 gap-3">
                  <div>
                    <label className="block text-xs text-gray-600 mb-1">
                      HS Code
                    </label>
                    <input
                      type="text"
                      className="w-full rounded border border-gray-300 px-2 py-1.5 text-sm focus:outline-none focus:ring-1 focus:ring-emerald-500"
                      placeholder="FBR HS Code"
                    />
                    <button className="text-xs text-blue-500 hover:text-blue-700 mt-1">
                      Verify
                    </button>
                  </div>
                  <div>
                    <label className="block text-xs text-gray-600 mb-1">
                      FBR Sale Type
                    </label>
                    <select className="w-full rounded border border-gray-300 px-2 py-1.5 text-sm focus:outline-none focus:ring-1 focus:ring-emerald-500">
                      <option>Goods at standard rate (defau...</option>
                      <option>Services</option>
                      <option>Zero rated supplies</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs text-gray-600 mb-1">
                      FBR Sale Rate
                    </label>
                    <select className="w-full rounded border border-gray-300 px-2 py-1.5 text-sm focus:outline-none focus:ring-1 focus:ring-emerald-500">
                      <option>Select Rate</option>
                      <option>17%</option>
                      <option>18%</option>
                      <option>5%</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs text-gray-600 mb-1">
                      SRO Schedule No
                    </label>
                    <select className="w-full rounded border border-gray-300 px-2 py-1.5 text-sm focus:outline-none focus:ring-1 focus:ring-emerald-500">
                      <option>Select SRO Schedul...</option>
                      <option>SRO 1</option>
                      <option>SRO 2</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs text-gray-600 mb-1">
                      SRO Item Serial No
                    </label>
                    <select className="w-full rounded border border-gray-300 px-2 py-1.5 text-sm focus:outline-none focus:ring-1 focus:ring-emerald-500">
                      <option>Select SRO Item Se...</option>
                      <option>Item 1</option>
                      <option>Item 2</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs text-gray-600 mb-1">
                      UOM
                    </label>
                    <select className="w-full rounded border border-gray-300 px-2 py-1.5 text-sm focus:outline-none focus:ring-1 focus:ring-emerald-500">
                      <option>Select UOM</option>
                      <option>Pieces</option>
                      <option>Kg</option>
                      <option>Liters</option>
                    </select>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Advance Options Dropdown */}
          <div className="mt-2">
            <button
              onClick={() => setShowAdvanceOptions(!showAdvanceOptions)}
              className="flex items-center space-x-2 text-left w-full"
              style={{ padding: "0.5rem 0", fontWeight: 500 }}
            >
              <ChevronDown
                size={18}
                className={`transition-transform ${
                  showAdvanceOptions ? "rotate-180" : ""
                }`}
              />
              <span className="text-sm text-gray-800">Advance Options</span>
            </button>
            {showAdvanceOptions && (
              <div className="p-4 bg-gray-50 border rounded mt-2">
                <div className="flex gap-6">
                  {/* Left Section: Image Upload */}
                  <div
                    className="flex flex-col items-start"
                    style={{ minWidth: 220 }}
                  >
                    <h4 className="text-xs font-medium text-gray-700 mb-2">
                      Add Image
                    </h4>
                    <button
                      className="text-xs text-blue-500 hover:text-blue-700 mb-2"
                      onClick={handleRemoveImage}
                      type="button"
                    >
                      ✖ Remove
                    </button>
                    <div
                      className="w-40 h-40 border-2 border-dashed border-gray-300 rounded-lg flex items-center justify-center bg-white mb-2 relative overflow-hidden"
                      onDrop={handleDrop}
                      onDragOver={(e) => e.preventDefault()}
                      style={{ cursor: "pointer" }}
                    >
                      {image ? (
                        <img
                          src={image}
                          alt="Preview"
                          className="object-contain w-full h-full"
                        />
                      ) : (
                        <div className="text-center w-full">
                          <label>
                            <input
                              type="file"
                              accept="image/*"
                              className="hidden"
                              onChange={handleFileChange}
                            />
                            <span className="px-3 py-1 bg-white border border-blue-400 text-blue-500 text-xs rounded hover:bg-blue-50 transition-colors inline-block cursor-pointer">
                              Choose file
                            </span>
                          </label>
                          <p className="text-xs text-gray-500 mt-1">
                            Upload size: 1MB
                          </p>
                          <p className="text-xs text-gray-400 mt-1">
                            Drag & drop image here
                          </p>
                        </div>
                      )}
                    </div>
                  </div>
                  {/* Right Section: Fields */}
                  <div className="flex-1">
                    {/* Fields 1 & 2 */}
                    <div className="grid grid-cols-2 gap-4 mb-2">
                      <div>
                        <label className="block text-xs text-gray-600 mb-1">
                          Field 1
                        </label>
                        <input
                          type="text"
                          className="w-full rounded border border-gray-300 px-2 py-1.5 text-sm"
                          placeholder="Field 1"
                        />
                      </div>
                      <div>
                        <label className="block text-xs text-gray-600 mb-1">
                          Field 2
                        </label>
                        <input
                          type="text"
                          className="w-full rounded border border-gray-300 px-2 py-1.5 text-sm"
                          placeholder="Field 2"
                        />
                      </div>
                    </div>
                    {/* Fields 3 & 4 */}
                    <div className="grid grid-cols-2 gap-4 mb-2">
                      <div>
                        <label className="block text-xs text-gray-600 mb-1">
                          Field 3
                        </label>
                        <input
                          type="text"
                          className="w-full rounded border border-gray-300 px-2 py-1.5 text-sm"
                          placeholder="Field 3"
                        />
                      </div>
                      <div>
                        <label className="block text-xs text-gray-600 mb-1">
                          Field 4
                        </label>
                        <input
                          type="text"
                          className="w-full rounded border border-gray-300 px-2 py-1.5 text-sm"
                          placeholder="Field 4"
                        />
                      </div>
                    </div>
                    {/* Fields A & B */}
                    <div className="grid grid-cols-2 gap-4 mb-2">
                      <div>
                        <label className="block text-xs text-gray-600 mb-1">
                          Field A
                        </label>
                        <textarea
                          className="w-full rounded border border-gray-300 px-2 py-1.5 text-sm h-16 resize-none"
                          placeholder="Field A"
                        />
                      </div>
                      <div>
                        <label className="block text-xs text-gray-600 mb-1">
                          Field B
                        </label>
                        <textarea
                          className="w-full rounded border border-gray-300 px-2 py-1.5 text-sm h-16 resize-none"
                          placeholder="Field B"
                        />
                      </div>
                    </div>
                    {/* Fields C & D */}
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-xs text-gray-600 mb-1">
                          Field C
                        </label>
                        <textarea
                          className="w-full rounded border border-gray-300 px-2 py-1.5 text-sm h-16 resize-none"
                          placeholder="Field C"
                        />
                      </div>
                      <div>
                        <label className="block text-xs text-gray-600 mb-1">
                          Field D
                        </label>
                        <textarea
                          className="w-full rounded border border-gray-300 px-2 py-1.5 text-sm h-16 resize-none"
                          placeholder="Field D"
                        />
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="border-t px-6 py-3 bg-gray-50 flex items-center justify-between">
          <button
            onClick={handleClose}
            className="px-4 py-2 rounded border border-gray-300 text-gray-700 hover:bg-gray-100 transition-colors text-sm"
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            className="px-4 py-2 rounded bg-emerald-600 text-white hover:bg-emerald-700 transition-colors text-sm"
          >
            Save and Close
          </button>
        </div>
      </div>
    </div>
  );
}
