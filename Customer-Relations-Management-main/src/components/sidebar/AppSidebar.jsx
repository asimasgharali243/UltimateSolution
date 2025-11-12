import React, { useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import {
  Home,
  LayoutDashboard,
  Users,
  TrendingUp,
  ShoppingCart,
  Calculator,
  CreditCard,
  Package,
  Settings,
  FileText,
  ChevronRight,
  ChevronDown,
} from "lucide-react";

export function AppSidebar({ isCollapsed }) {
  const location = useLocation();
  const navigate = useNavigate();
  const [expandedItems, setExpandedItems] = useState({});

  const toggleExpand = (itemKey) => {
    if (!isCollapsed) {
      setExpandedItems((prev) => ({
        ...prev,
        [itemKey]: !prev[itemKey],
      }));
    }
  };

  const handleItemClick = (href, hasSubItems, itemKey) => {
    if (hasSubItems && !isCollapsed) {
      toggleExpand(itemKey);
    } else if (!hasSubItems) {
      navigate(href);
    }
  };

  const isActive = (href, subItems = null) => {
    if (href === "/" && location.pathname === "/") return true;
    if (
      href === "/dashboard" &&
      (location.pathname === "/" || location.pathname === "/dashboard")
    )
      return true;
    if (href !== "/" && location.pathname.startsWith(href)) return true;

    // Check if any sub-item is active
    if (subItems) {
      return subItems.some((subItem) => location.pathname === subItem.href);
    }

    return false;
  };

  const menuItems = [
    {
      key: "home",
      icon: Home,
      label: "Home",
      href: "/",
    },
    {
      key: "dashboard",
      icon: LayoutDashboard,
      label: "Dashboard",
      href: "/dashboard",
    },
    {
      key: "crm",
      icon: Users,
      label: "CRM",
      href: "/crm",
      hasSubItems: true,
      subItems: [
        { label: "Contacts", href: "/crm/contacts" },
        { label: "Leads", href: "/crm/leads" },
        { label: "Opportunities", href: "/crm/opportunities" },
      ],
    },
    {
      key: "sales",
      icon: TrendingUp,
      label: "Sales",
      href: "/sales",
      hasSubItems: true,
      subItems: [
        { label: "Quotation", href: "/sales/quotations" },
        { label: "Order", href: "/sales/orders" },
        { label: "Delivery", href: "/sales/delivery" },
        { label: "Invoice", href: "/sales/invoices" },
        { label: "Recurring Invoice", href: "/sales/recurring-invoices" },
        { label: "Return", href: "/sales/returns" },
        { label: "Receive Money", href: "/sales/receive-money" },
        { label: "Refund", href: "/sales/refunds" },
        { label: "Settlement", href: "/sales/settlements" },
      ],
    },
    {
      key: "purchases",
      icon: ShoppingCart,
      label: "Purchases",
      href: "/purchases",
      hasSubItems: true,
      subItems: [
        { label: "Purchase Order", href: "/purchases/orders" },
        { label: "Bills", href: "/purchases/bills" },
        { label: "Payments", href: "/purchases/payments" },
        { label: "Vendor Credits", href: "/purchases/credits" },
      ],
    },
    {
      key: "pos",
      icon: Calculator,
      label: "POS",
      href: "/pos",
      hasSubItems: true,
      subItems: [
        { label: "Point of Sale", href: "/pos/sale" },
        { label: "POS Orders", href: "/pos/orders" },
      ],
    },
    {
      key: "accounts",
      icon: CreditCard,
      label: "Accounts",
      href: "/accounts",
      hasSubItems: true,
      subItems: [
        { label: "Chart of Accounts", href: "/accounts/chart" },
        { label: "Journal Entries", href: "/accounts/journal" },
        { label: "Bank Accounts", href: "/accounts/bank" },
      ],
    },
    {
      key: "inventory",
      icon: Package,
      label: "Inventory",
      href: "/inventory",
      hasSubItems: true,
      subItems: [
        { label: "Items", href: "/inventory/items" },
        { label: "Stock Adjustment", href: "/inventory/adjustments" },
        { label: "Warehouses", href: "/inventory/warehouses" },
      ],
    },
    {
      key: "manufacturing",
      icon: Settings,
      label: "Manufacturing",
      href: "/manufacturing",
      hasSubItems: true,
      subItems: [
        { label: "Work Orders", href: "/manufacturing/work-orders" },
        { label: "Bill of Materials", href: "/manufacturing/bom" },
      ],
    },
    {
      key: "reports",
      icon: FileText,
      label: "Reports",
      href: "/reports",
      hasSubItems: true,
      subItems: [
        { label: "Financial Reports", href: "/reports/financial" },
        { label: "Sales Reports", href: "/reports/sales" },
        { label: "Purchase Reports", href: "/reports/purchases" },
      ],
    },
  ];

  return (
    <div
      className={`bg-gray-100 border-r border-gray-200 flex-shrink-0 transition-all duration-300 ${
        isCollapsed ? "w-16" : "w-64"
      }`}
    >
      <div className=" overflow-y-auto h-full">
        {menuItems.map((item) => {
          const Icon = item.icon;
          const isExpanded = expandedItems[item.key];
          const active = isActive(item.href, item.subItems);

          return (
            <div key={item.key}>
              {/* Main menu item */}
              <div className="relative group ">
                <div
                  className={`flex items-center py-3 cursor-pointer transition-colors ${
                    isCollapsed ? "px-4 justify-center" : "px-4"
                  } ${
                    active
                      ? "bg-green-100 text-green-600 border-r-4 border-green-500"
                      : "text-gray-600 hover:bg-gray-200"
                  }`}
                  onClick={() =>
                    handleItemClick(item.href, item.hasSubItems, item.key)
                  }
                >
                  <Icon size={20} className="flex-shrink-0" />
                  {!isCollapsed && (
                    <>
                      <span className="ml-3 font-medium flex-1">
                        {item.label}
                      </span>
                      {item.hasSubItems &&
                        (isExpanded ? (
                          <ChevronDown size={16} className="ml-auto" />
                        ) : (
                          <ChevronRight size={16} className="ml-auto" />
                        ))}
                    </>
                  )}
                </div>

                {/* {isCollapsed && (
                  <div className="absolute left-full top-0 ml-2 px-3 py-2 bg-gray-800 text-white text-sm rounded-md opacity-0 group-hover:opacity-100 transition-opacity duration-200 whitespace-nowrap z-50 pointer-events-none">
                    {item.label}
                    <div className="absolute left-0 top-1/2 transform -translate-y-1/2 -translate-x-1 border-4 border-transparent border-r-gray-800"></div>
                  </div>
                )} */}
              </div>

              {/* Sub-items - only show when expanded and not collapsed */}
              {item.hasSubItems && isExpanded && !isCollapsed && (
                <div className="bg-gray-50">
                  {item.subItems.map((subItem, index) => (
                    <div
                      key={index}
                      className={`block px-12 py-2 text-sm cursor-pointer transition-colors ${
                        location.pathname === subItem.href
                          ? "bg-green-50 text-green-600 border-r-4 border-green-400"
                          : "text-gray-600 hover:bg-gray-200 hover:text-gray-800"
                      }`}
                      onClick={() => navigate(subItem.href)}
                    >
                      {subItem.label}
                    </div>
                  ))}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
