import React from "react";
import {
  MessageCircle,
  Plus,
  Settings,
  Bell,
  ChevronDown,
  Menu,
} from "lucide-react";
import { SetUp } from "./SetUp";

export function Navbar({ onToggleSidebar }) {
  return (
    <nav className="bg-white border-b border-gray-200 px-4 py-3 flex-shrink-0 z-10">
      <div className="flex items-center justify-between">
        {/* Left side - Hamburger and Logo */}
        <div className="flex items-center space-x-4">
          {/* Hamburger Menu */}
          <button
            onClick={onToggleSidebar}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            aria-label="Toggle sidebar"
          >
            <Menu size={20} className="text-gray-600" />
          </button>

          {/* Logo */}
          <div className="border-2 border-black px-4 py-2 bg-white">
            <span className="font-bold text-lg">LOGO</span>
          </div>
        </div>

        {/* Right side - Action buttons and user */}
        <div className="flex items-center space-x-2 lg:space-x-4">
          {/* Support */}
          <button className="flex items-center space-x-2 px-3 py-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors">
            <MessageCircle size={18} className="text-green-500" />
            <span className="text-sm hidden md:inline">Support</span>
          </button>
          {/* Create */}
          <button className="flex items-center space-x-2 px-3 py-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors">
            <Plus size={18} className="text-blue-500" />
            <span className="text-sm hidden md:inline">Create</span>
          </button>{" "}
          {/* Setup */}
          <SetUp />
          {/* Notifications */}
          <button className="p-2 text-gray-600 hover:bg-gray-100 rounded-lg relative transition-colors">
            <Bell size={18} />
            <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
              3
            </span>
          </button>
          {/* User Dropdown */}
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 bg-gray-300 rounded-full flex items-center justify-center">
              <span className="text-sm font-medium text-gray-600">AT</span>
            </div>
            <button className="flex items-center space-x-1 text-gray-700 hover:bg-gray-100 px-2 py-1 rounded-lg transition-colors">
              <span className="text-sm font-medium hidden sm:inline">
                AJWA TILE
              </span>
              <ChevronDown size={16} />
            </button>
          </div>
        </div>
      </div>
    </nav>
  );
}
