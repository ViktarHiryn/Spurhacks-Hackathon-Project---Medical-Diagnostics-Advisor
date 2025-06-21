import React from "react";
import { Link, useLocation } from "react-router-dom";
import {
  MessageCircle,
  Pill,
  History,
  Settings,
  User,
  Stethoscope,
} from "lucide-react";

const Sidebar = () => {
  const location = useLocation();

  const navItems = [
    {
      path: "/",
      icon: MessageCircle,
      label: "AI Doctor Chat",
      description: "Talk to your AI doctor",
    },
    {
      path: "/medications",
      icon: Pill,
      label: "Medications",
      description: "Track your medications",
    },
    {
      path: "/history",
      icon: History,
      label: "Medical History",
      description: "View past consultations",
    },
  ];

  const isActive = (path) => {
    return location.pathname === path;
  };

  return (
    <div className="w-80 bg-white border-r border-neutral-200 flex flex-col h-full">
      {/* Header */}
      <div className="p-6 border-b border-neutral-200">
        <div className="flex items-center space-x-3">
          <div className="bg-primary-700 p-2 rounded-lg">
            <Stethoscope className="w-6 h-6 text-white" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-neutral-900">AI Doctor</h1>
            <p className="text-sm text-neutral-600">
              Medical Diagnostics Advisor
            </p>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-4">
        <div className="space-y-2">
          {navItems.map((item) => {
            const Icon = item.icon;
            return (
              <Link
                key={item.path}
                to={item.path}
                className={`w-full flex items-center p-4 rounded-xl transition-all duration-200 group ${
                  isActive(item.path)
                    ? "bg-primary-50 border border-primary-200 text-primary-700"
                    : "hover:bg-neutral-50 text-neutral-700 hover:text-neutral-900"
                }`}
              >
                <Icon
                  className={`w-5 h-5 mr-3 ${
                    isActive(item.path)
                      ? "text-primary-600"
                      : "text-neutral-500 group-hover:text-neutral-700"
                  }`}
                />
                <div className="flex-1">
                  <div className="font-medium">{item.label}</div>
                  <div className="text-xs text-neutral-500 mt-0.5">
                    {item.description}
                  </div>
                </div>
              </Link>
            );
          })}
        </div>
      </nav>

      {/* User Profile */}
      <div className="p-4 border-t border-neutral-200">
        <div className="flex items-center p-3 rounded-lg hover:bg-neutral-50 cursor-pointer">
          <div className="bg-neutral-200 p-2 rounded-full">
            <User className="w-4 h-4 text-neutral-600" />
          </div>
          <div className="ml-3 flex-1">
            <div className="font-medium text-neutral-900">Anonymous User</div>
            <div className="text-xs text-neutral-500">Patient</div>
          </div>
          <Settings className="w-4 h-4 text-neutral-400" />
        </div>
      </div>
    </div>
  );
};

export default Sidebar;
