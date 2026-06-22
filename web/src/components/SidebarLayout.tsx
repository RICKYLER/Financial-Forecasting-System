import React, { useState } from "react";
import type { User, ActiveTab } from "../types";
import {
  PresentationChart,
  Layout,
  UploadSimple,
  ChartLineUp,
  TrendUp,
  TrendDown,
  Coins,
  Calculator,
  Tag,
  Briefcase,
  Sparkle,
  DownloadSimple,
  Gear,
  SignOut,
  List,
  X,
  Bell
} from "@phosphor-icons/react";

interface SidebarLayoutProps {
  user: User;
  activeTab: ActiveTab;
  setActiveTab: (tab: ActiveTab) => void;
  onLogout: () => void;
  children: React.ReactNode;
}

interface MenuItem {
  id: ActiveTab;
  label: string;
  icon: React.ReactNode;
  roles: string[];
}

export const SidebarLayout: React.FC<SidebarLayoutProps> = ({
  user,
  activeTab,
  setActiveTab,
  onLogout,
  children
}) => {
  const [isMobileOpen, setIsMobileOpen] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);

  const menuItems: MenuItem[] = [
    { id: "dashboard", label: "Dashboard", icon: <Layout size={18} />, roles: ["Admin", "Business Owner", "Financial Analyst"] },
    { id: "upload", label: "Data Upload", icon: <UploadSimple size={18} />, roles: ["Admin", "Business Owner"] },
    { id: "sales-forecast", label: "Sales Forecasting", icon: <ChartLineUp size={18} />, roles: ["Business Owner", "Financial Analyst"] },
    { id: "revenue-forecast", label: "Revenue Projections", icon: <TrendUp size={18} />, roles: ["Business Owner", "Financial Analyst"] },
    { id: "expense-forecast", label: "Expense Analysis", icon: <TrendDown size={18} />, roles: ["Business Owner", "Financial Analyst"] },
    { id: "profit-analysis", label: "Profit Analysis", icon: <Coins size={18} />, roles: ["Business Owner", "Financial Analyst"] },
    { id: "break-even", label: "Break-even Analysis", icon: <Calculator size={18} />, roles: ["Business Owner", "Financial Analyst"] },
    { id: "product-analytics", label: "Product Analytics", icon: <Tag size={18} />, roles: ["Business Owner", "Financial Analyst"] },
    { id: "bi", label: "Business Intelligence", icon: <Briefcase size={18} />, roles: ["Business Owner", "Financial Analyst"] },
    { id: "ai-insights", label: "AI Recommendations", icon: <Sparkle size={18} />, roles: ["Business Owner", "Financial Analyst"] },
    { id: "reports", label: "Export Reports", icon: <DownloadSimple size={18} />, roles: ["Admin", "Business Owner", "Financial Analyst"] },
    { id: "settings", label: "Settings", icon: <Gear size={18} />, roles: ["Admin", "Business Owner", "Financial Analyst"] },
  ];

  // Filter menu items by user role
  const visibleMenuItems = menuItems.filter(item => item.roles.includes(user.role));

  const handleTabChange = (tabId: ActiveTab) => {
    setActiveTab(tabId);
    setIsMobileOpen(false);
  };

  const getPageTitle = () => {
    const activeItem = menuItems.find(item => item.id === activeTab);
    return activeItem ? activeItem.label : "Forecasting Platform";
  };

  return (
    <div className="min-h-screen bg-slate-50 flex font-sans">
      
      {/* Mobile Nav Trigger Bar */}
      <div className="lg:hidden fixed top-0 left-0 right-0 h-16 bg-slate-950 border-b border-slate-800 px-6 flex items-center justify-between z-40">
        <div className="flex items-center gap-2">
          <PresentationChart size={20} className="text-emerald-500" />
          <span className="font-bold text-white text-sm tracking-tight">ForeSight</span>
        </div>
        <button 
          onClick={() => setIsMobileOpen(!isMobileOpen)}
          className="text-slate-400 hover:text-white"
        >
          {isMobileOpen ? <X size={24} /> : <List size={24} />}
        </button>
      </div>

      {/* Navigation Sidebar */}
      <aside className={`
        fixed inset-y-0 left-0 w-64 bg-slate-950 text-slate-400 border-r border-slate-900 z-50 flex flex-col justify-between
        transform transition-transform duration-200 ease-in-out lg:translate-x-0 lg:static lg:h-screen
        ${isMobileOpen ? "translate-x-0" : "-translate-x-full"}
      `}>
        {/* Brand Block */}
        <div>
          <div className="h-16 border-b border-slate-900 flex items-center justify-between px-6">
            <div className="flex items-center gap-3">
              <div className="bg-emerald-600 p-1.5 rounded text-white">
                <PresentationChart size={20} weight="bold" />
              </div>
              <span className="font-bold text-white text-md tracking-tight">
                ForeSight
              </span>
            </div>
            <button className="lg:hidden text-slate-500 hover:text-white" onClick={() => setIsMobileOpen(false)}>
              <X size={20} />
            </button>
          </div>

          {/* Navigation Links */}
          <nav className="p-4 space-y-1 overflow-y-auto max-h-[calc(100vh-10rem)]">
            {visibleMenuItems.map((item) => {
              const isActive = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => handleTabChange(item.id)}
                  className={`w-full flex items-center gap-3 px-3 py-2 text-xs font-semibold rounded-lg transition-colors cursor-pointer ${
                    isActive
                      ? "bg-slate-900 text-emerald-400 border border-slate-800"
                      : "hover:bg-slate-900/60 hover:text-slate-200"
                  }`}
                >
                  <span className={isActive ? "text-emerald-500" : "text-slate-500"}>
                    {item.icon}
                  </span>
                  {item.label}
                </button>
              );
            })}
          </nav>
        </div>

        {/* User Block & Logout */}
        <div className="p-4 border-t border-slate-900 bg-slate-950/60 space-y-3">
          <div className="flex items-center gap-3 px-2 py-1">
            <div className="w-8 h-8 rounded-full bg-emerald-950 border border-emerald-800 text-emerald-400 flex items-center justify-center font-bold text-xs">
              {user.fullname.split(" ").map(n => n[0]).join("")}
            </div>
            <div className="flex-1 text-left min-w-0">
              <p className="text-xs font-semibold text-white truncate">{user.fullname}</p>
              <p className="text-[10px] text-slate-500 truncate">{user.role}</p>
            </div>
          </div>

          <button
            onClick={onLogout}
            className="w-full flex items-center gap-3 px-3 py-2 text-xs font-semibold hover:bg-rose-950/20 hover:text-rose-400 rounded-lg transition-colors text-left cursor-pointer"
          >
            <SignOut size={18} className="text-slate-500 group-hover:text-rose-400" />
            Sign Out Session
          </button>
        </div>
      </aside>

      {/* Main Workspace Frame */}
      <div className="flex-1 flex flex-col min-w-0 lg:h-screen lg:overflow-y-auto">
        
        {/* Workspace Top Header */}
        <header className="h-16 bg-white border-b border-slate-200 px-8 flex items-center justify-between shrink-0 mt-16 lg:mt-0 z-30">
          <h2 className="text-md font-bold tracking-tight text-slate-900">
            {getPageTitle()}
          </h2>

          <div className="flex items-center gap-4">
            
            {/* Notifications Button */}
            <div className="relative">
              <button 
                onClick={() => setShowNotifications(!showNotifications)}
                className="p-2 text-slate-400 hover:text-slate-600 rounded-full hover:bg-slate-100 transition relative"
              >
                <Bell size={20} />
                <span className="absolute top-1 right-1 w-2 h-2 bg-emerald-500 rounded-full" />
              </button>

              {showNotifications && (
                <div className="absolute right-0 mt-2 w-80 bg-white border border-slate-200 rounded-xl shadow-xl z-50 p-4 text-left font-sans">
                  <div className="flex justify-between items-center border-b border-slate-150 pb-2 mb-2">
                    <span className="font-semibold text-xs text-slate-700">Notifications</span>
                    <button 
                      onClick={() => setShowNotifications(false)}
                      className="text-[10px] text-slate-400 hover:text-slate-600"
                    >
                      Dismiss all
                    </button>
                  </div>
                  <div className="space-y-3 text-xs">
                    <div className="p-2 hover:bg-slate-50 rounded transition">
                      <p className="font-semibold text-slate-800">Forecast Completed</p>
                      <p className="text-slate-500 text-[11px] mt-0.5">R model fits generated for monthly ARIMA datasets.</p>
                      <span className="text-[10px] text-slate-400 block mt-1">2 mins ago</span>
                    </div>
                    <div className="p-2 hover:bg-slate-50 rounded transition border-t border-slate-100">
                      <p className="font-semibold text-slate-800">System Alert</p>
                      <p className="text-slate-500 text-[11px] mt-0.5">Expenses growth outpacing revenues. Check AI analysis tab.</p>
                      <span className="text-[10px] text-slate-400 block mt-1">1 hour ago</span>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Active User Badging */}
            <div className="hidden sm:inline-flex items-center gap-2 px-3 py-1 bg-slate-100 border border-slate-200 rounded-full text-xs font-semibold text-slate-600">
              <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse" />
              {user.role} Account
            </div>
          </div>
        </header>

        {/* Content Viewport */}
        <main className="flex-1 p-8 overflow-y-auto bg-slate-50">
          <div className="max-w-6xl mx-auto space-y-8">
            {children}
          </div>
        </main>
      </div>

    </div>
  );
};
