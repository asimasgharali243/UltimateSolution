import React, { useState } from "react";
import { Settings, ChevronDown, List, FileText, Users } from "lucide-react";
import { useNavigate } from "react-router-dom";

export function SetUp() {
  const navigate = useNavigate();

  const [isOpen, setIsOpen] = useState(false);

  const setupCategories = {
    Lists: [
      "Customers",
      "Vendors",
      "Products",
      "Sales Persons",
      "Users",
      "Other Contacts",
      "Prospects",
      "Couriers",
      "Customer Portal",
    ],
    Categories: [
      "Customer Categories",
      "Other Contact Categories",
      "Vendor Categories",
      "Product Categories",
      "Brands",
    ],
    General: [
      "Taxes",
      "Warehouses",
      "Adjustment Types",
      "Consignments",
      "Custom Fields",
      "Multiple Price Levels",
    ],
    Payroll: ["Employees", "Departments", "Designations"],
    CRM: [
      "Tags",
      "Ticket Statuses",
      "Industries",
      "Projects",
      "Lead Sources",
      "Lead Statuses",
      "Event Types",
      "Event Statuses",
    ],
  };

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center space-x-2 px-3 py-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
      >
        <Settings size={18} className="text-gray-500" />
        <span className="text-sm hidden md:inline">Setup</span>
        <ChevronDown
          size={16}
          className={`transition-transform ${isOpen ? "rotate-180" : ""}`}
        />
      </button>

      {isOpen && (
        <>
          {/* Backdrop */}
          <div
            className="fixed inset-0 z-40"
            onClick={() => setIsOpen(false)}
          />

          {/* Dropdown */}
          <div className="absolute right-0 top-full mt-2 w-[800px] bg-white border-3 border-green-400 rounded-lg shadow-lg z-50 p-6">
            <div className="absolute -top-3 right-12 w-6 h-6 bg-white border-l-3 border-t-3 border-green-400 transform rotate-45"></div>
            <div className="grid grid-cols-5 gap-6">
              {Object.entries(setupCategories).map(([category, items]) => (
                <div key={category} className="space-y-3">
                  <h3 className="font-semibold text-gray-800 text-sm border-b border-gray-200 pb-2 flex items-center">
                    {category === "Lists" && <List size={16} />}
                    {category === "Categories" && <FileText size={16} />}
                    {category === "General" && <Users size={16} />}
                    {category === "Payroll" && <FileText size={16} />}
                    {category === "CRM" && <Users size={16} />}
                    <span className="ml-2">{category}</span>
                  </h3>
                  <ul className="space-y-2">
                    {items.map((item) => (
                      <li key={item}>
                        <button
                          className="text-sm text-gray-600 hover:text-blue-600 hover:bg-blue-50 w-full text-left px-2 py-1 rounded transition-colors"
                          onClick={() => {
                            if (item === "Customers") {
                              navigate("/setup/customer-information");
                            } else if (item === "Products") {
                              navigate("/setup/product-form");
                            } else {
                              console.log(`Navigate to ${item}`);
                            }
                            setIsOpen(false);
                          }}
                        >
                          {item}
                        </button>
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          </div>
        </>
      )}
    </div>
  );
}
