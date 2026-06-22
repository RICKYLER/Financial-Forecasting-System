import React, { useState } from "react";
import type { User } from "../types";
import { UserCircle, Bell, Lock, CheckCircle } from "@phosphor-icons/react";


interface SettingsPageProps {
  user: User;
  onUserUpdate: (updatedUser: User) => void;
}

export const SettingsPage: React.FC<SettingsPageProps> = ({ user, onUserUpdate }) => {
  const [fullname, setFullname] = useState(user.fullname);
  const [email, setEmail] = useState(user.email);
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [notifyForecast, setNotifyForecast] = useState(true);
  const [notifyAlerts, setNotifyAlerts] = useState(true);
  const [isSavingProfile, setIsSavingProfile] = useState(false);
  const [isSavingPass, setIsSavingPass] = useState(false);
  const [msg, setMsg] = useState("");

  const handleProfileSave = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSavingProfile(true);
    setMsg("");
    setTimeout(() => {
      setIsSavingProfile(false);
      onUserUpdate({
        ...user,
        fullname,
        email
      });
      setMsg("Profile details updated successfully.");
    }, 800);
  };

  const handlePasswordSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentPassword || !newPassword) return;
    setIsSavingPass(true);
    setMsg("");
    setTimeout(() => {
      setIsSavingPass(false);
      setCurrentPassword("");
      setNewPassword("");
      setMsg("Password changed successfully.");
    }, 800);
  };

  return (
    <div className="space-y-8 text-left font-sans">
      
      {msg && (
        <div className="bg-emerald-50 border border-emerald-200 text-emerald-800 p-4 rounded-xl flex gap-3 items-center text-xs font-semibold">
          <CheckCircle size={18} className="text-emerald-500 shrink-0" />
          <span>{msg}</span>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* Profile Card */}
        <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-sm space-y-5">
          <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider font-mono flex items-center gap-2">
            <UserCircle size={18} className="text-emerald-500" />
            Edit Profile Parameters
          </h4>

          <form onSubmit={handleProfileSave} className="space-y-4">
            <div className="space-y-1.5 text-xs text-left">
              <label className="block font-semibold text-slate-500">Full Name</label>
              <input
                type="text"
                value={fullname}
                onChange={(e) => setFullname(e.target.value)}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:border-emerald-500 transition text-slate-700"
              />
            </div>

            <div className="space-y-1.5 text-xs text-left">
              <label className="block font-semibold text-slate-500">Email Address</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:border-emerald-500 transition text-slate-700"
              />
            </div>

            <div className="space-y-1.5 text-xs text-left">
              <label className="block font-semibold text-slate-400">Assigned Platform Role</label>
              <input
                type="text"
                value={user.role}
                disabled
                className="w-full px-3 py-2 bg-slate-100 border border-slate-200 rounded-lg text-slate-400 cursor-not-allowed"
              />
            </div>

            <button
              type="submit"
              disabled={isSavingProfile}
              className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 active:scale-98 text-white font-semibold text-xs rounded-lg transition disabled:opacity-50 cursor-pointer shadow-sm"
            >
              {isSavingProfile ? "Saving Details..." : "Update Profile Info"}
            </button>
          </form>
        </div>

        {/* Password Card */}
        <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-sm space-y-5">
          <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider font-mono flex items-center gap-2">
            <Lock size={18} className="text-emerald-500" />
            Security & Password Configuration
          </h4>

          <form onSubmit={handlePasswordSave} className="space-y-4">
            <div className="space-y-1.5 text-xs text-left">
              <label className="block font-semibold text-slate-500">Current Password</label>
              <input
                type="password"
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:border-emerald-500 transition text-slate-700"
              />
            </div>

            <div className="space-y-1.5 text-xs text-left">
              <label className="block font-semibold text-slate-500">New Password</label>
              <input
                type="password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:border-emerald-500 transition text-slate-700"
              />
            </div>

            <button
              type="submit"
              disabled={isSavingPass || !currentPassword || !newPassword}
              className="px-4 py-2 bg-slate-900 hover:bg-slate-800 active:scale-98 text-white font-semibold text-xs rounded-lg transition disabled:opacity-40 cursor-pointer"
            >
              {isSavingPass ? "Updating Password..." : "Change Security Password"}
            </button>
          </form>
        </div>

      </div>

      {/* Notifications toggle preferences */}
      <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-sm space-y-4">
        <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider font-mono flex items-center gap-2">
          <Bell size={18} className="text-emerald-500" />
          Mailing & Notification Toggles
        </h4>

        <div className="space-y-3 pt-2">
          <label className="flex items-center gap-3 text-xs font-semibold text-slate-700 cursor-pointer">
            <input
              type="checkbox"
              checked={notifyForecast}
              onChange={() => setNotifyForecast(!notifyForecast)}
              className="w-4 h-4 text-emerald-600 border-slate-350 rounded focus:ring-emerald-500 accent-emerald-600"
            />
            Email alerts on monthly forecast model completions
          </label>
          <label className="flex items-center gap-3 text-xs font-semibold text-slate-700 cursor-pointer">
            <input
              type="checkbox"
              checked={notifyAlerts}
              onChange={() => setNotifyAlerts(!notifyAlerts)}
              className="w-4 h-4 text-emerald-600 border-slate-350 rounded focus:ring-emerald-500 accent-emerald-600"
            />
            Push notifications for cost-overrun warnings and profitability drop thresholds
          </label>
        </div>
      </div>

    </div>
  );
};
