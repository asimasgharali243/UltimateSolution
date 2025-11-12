import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { AddressTab } from "./AddressTab";
import { Taxinfo } from "./Taxinfo";
import { Terms } from "./Terms";
import { Notes } from "./Notes";
import { AdditionalField } from "./AdditionalField";
import { BankInfo } from "./BankInfo";

export function CustomerInformation() {
  const navigate = useNavigate();
  const [open, setOpen] = useState(true);
  const [activeTab, setActiveTab] = useState("address");

  function closeDialog() {
    setOpen(false);
    navigate(-1);
  }

  function handleSave() {
    console.log("Form saved");
    closeDialog();
  }

  if (!open) return null;

  const tabs = [
    { id: "address", label: "Address" },
    { id: "Taxinfo", label: "Tax Info" },
    { id: "terms", label: "Terms" },
    { id: "notes", label: "Notes" },
    { id: "additional", label: "Additional Fields" },
    { id: "Bankinfo", label: "Bank Info" },
  ];

  const renderTabContent = () => {
    switch (activeTab) {
      case "address":
        return <AddressTab />;
      case "Taxinfo":
        return <Taxinfo />;
      case "terms":
        return <Terms />;
      case "notes":
        return <Notes />;
      case "additional":
        return <AdditionalField />;
      case "Bankinfo":
        return <BankInfo />;
      default:
        return <AddressTab />;
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/40" onClick={closeDialog} />

      {/* Dialog */}
      <div className="relative bg-white w-full max-w-4xl mx-4 rounded-lg shadow-2xl overflow-hidden max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b bg-gray-50">
          <h3 className="text-lg font-medium text-gray-800">
            Customer Information
          </h3>
          <button
            onClick={closeDialog}
            className="text-gray-500 hover:text-gray-800 text-xl"
          >
            ✕
          </button>
        </div>

        {/* Body - Scrollable */}
        <div className="flex-1 overflow-y-auto p-6">
          {/* Fixed Top Section - Always Visible */}
          <div className="mb-6">
            <div className="grid grid-cols-2 gap-8">
              {/* Left Side - Business Name, Email, Account No */}
              <div className="space-y-4">
                {/* Business Name */}
                <div>
                  <label className="block text-sm text-gray-600 mb-1">
                    Business Name *
                  </label>
                  <input
                    type="text"
                    className="w-full rounded border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                    placeholder="Enter business name"
                  />
                </div>

                {/* Email */}
                <div>
                  <label className="block text-sm text-gray-600 mb-1">
                    Email
                  </label>
                  <input
                    type="email"
                    className="w-full rounded border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                    placeholder="email@example.com"
                  />
                </div>

                {/* Account No */}
                <div>
                  <label className="block text-sm text-gray-600 mb-1">
                    Account No.
                  </label>
                  <input
                    type="text"
                    className="w-full rounded border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                    placeholder="Account number"
                  />
                </div>
              </div>

              {/* Right Side - Title, Names, Mobile, Phone, Website */}
              <div className="space-y-4">
                {/* Title, First Name, Last Name */}
                <div className="grid grid-cols-12 gap-4">
                  <div className="col-span-2">
                    <label className="block text-sm text-gray-600 mb-1">
                      Title
                    </label>
                    <input
                      type="text"
                      className="w-full rounded border border-gray-300 px-2 py-2 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                      placeholder="Title"
                    />
                  </div>
                  <div className="col-span-5">
                    <label className="block text-sm text-gray-600 mb-1">
                      First Name
                    </label>
                    <input
                      type="text"
                      className="w-full rounded border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                      placeholder="First name"
                    />
                  </div>
                  <div className="col-span-5">
                    <label className="block text-sm text-gray-600 mb-1">
                      Last Name
                    </label>
                    <input
                      type="text"
                      className="w-full rounded border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                      placeholder="Last name"
                    />
                  </div>
                </div>

                {/* Mobile & Phone */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm text-gray-600 mb-1">
                      Mobile
                    </label>
                    <input
                      type="tel"
                      className="w-full rounded border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                      placeholder="0300-1234567"
                    />
                  </div>
                  <div>
                    <label className="block text-sm text-gray-600 mb-1">
                      Phone
                    </label>
                    <input
                      type="tel"
                      className="w-full rounded border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                      placeholder="042-1234567"
                    />
                  </div>
                </div>

                {/* Website */}
                <div>
                  <label className="block text-sm text-gray-600 mb-1">
                    Website
                  </label>
                  <input
                    type="url"
                    className="w-full rounded border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                    placeholder="https://example.com"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Tabs Navigation - Centered with Emerald Green */}
          <div className="flex border-b ">
            <div className="flex gap-1">
              {tabs.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`px-6 py-3 font-medium transition-colors ${
                    activeTab === tab.id
                      ? "text-emerald-600 border-b-2 border-emerald-600 bg-emerald-50"
                      : "text-gray-600 hover:text-gray-800 hover:bg-gray-50"
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>
          </div>

          {/* Tab Content */}
          <div className="min-h-[200px]">{renderTabContent()}</div>
        </div>

        {/* Footer - Action Buttons with Emerald Green */}
        <div className="border-t px-6 py-4 bg-gray-50 flex items-center justify-between">
          <button
            onClick={closeDialog}
            className="px-5 py-2 rounded border border-gray-300 text-gray-700 hover:bg-gray-100 transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            className="px-5 py-2 rounded bg-emerald-600 text-white hover:bg-emerald-700 transition-colors"
          >
            Save and Close
          </button>
        </div>
      </div>
    </div>
  );
}
