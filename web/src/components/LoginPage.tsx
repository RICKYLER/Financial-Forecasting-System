import React, { useState } from "react";
import type { UserRole, User } from "../types";
import { mockUsers } from "../mockData";
import { PresentationChart, Lock, Envelope, Shield } from "@phosphor-icons/react";

interface LoginPageProps {
  onLoginSuccess: (user: User) => void;
  onBackToLanding: () => void;
}

export const LoginPage: React.FC<LoginPageProps> = ({ onLoginSuccess, onBackToLanding }) => {
  const [email, setEmail] = useState("sophia@business.com");
  const [password, setPassword] = useState("password123");
  const [selectedRole, setSelectedRole] = useState<UserRole>("Business Owner");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    
    if (!email || !password) {
      setError("Please fill in all fields.");
      return;
    }

    setIsLoading(true);

    // Simulate network delay for JWT validation
    setTimeout(() => {
      setIsLoading(false);
      
      // Match from mock users based on selected role
      const matchedUser = mockUsers.find(u => u.role === selectedRole);
      
      if (matchedUser) {
        // Mock token generation and login success
        onLoginSuccess({
          ...matchedUser,
          email: email // Keep entered email for visual consistency
        });
      } else {
        setError("Invalid credentials or role mismatch.");
      }
    }, 800);
  };

  const handleQuickFill = (role: UserRole) => {
    const matched = mockUsers.find(u => u.role === role);
    if (matched) {
      setEmail(matched.email);
      setSelectedRole(role);
      setError("");
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex items-center justify-center p-6 font-sans">
      <div className="w-full max-w-md bg-slate-900 border border-slate-800 rounded-xl p-8 shadow-2xl relative">
        
        {/* Back Button */}
        <button 
          onClick={onBackToLanding}
          className="absolute top-6 right-6 text-xs text-slate-400 hover:text-slate-200 transition"
        >
          Cancel
        </button>

        <div className="flex flex-col items-center mb-8">
          <div className="bg-emerald-600 p-3 rounded-lg text-white mb-3">
            <PresentationChart size={32} weight="bold" />
          </div>
          <h2 className="text-2xl font-bold tracking-tight text-white">Welcome Back</h2>
          <p className="text-slate-400 text-xs mt-1 text-center">
            Sign in to access forecast dashboards & analytics
          </p>
        </div>

        {error && (
          <div className="mb-6 p-3 rounded bg-rose-950/40 border border-rose-900/60 text-rose-200 text-xs">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-5">
          
          {/* Email input */}
          <div className="space-y-1.5 text-left">
            <label className="block text-xs font-semibold text-slate-300">
              Email Address
            </label>
            <div className="relative">
              <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-slate-500">
                <Envelope size={16} />
              </span>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full pl-9 pr-3 py-2 text-sm bg-slate-950 border border-slate-800 rounded-lg text-slate-100 placeholder-slate-600 focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 transition"
                placeholder="you@company.com"
              />
            </div>
          </div>

          {/* Password input */}
          <div className="space-y-1.5 text-left">
            <label className="block text-xs font-semibold text-slate-300">
              Password
            </label>
            <div className="relative">
              <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-slate-500">
                <Lock size={16} />
              </span>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full pl-9 pr-3 py-2 text-sm bg-slate-950 border border-slate-800 rounded-lg text-slate-100 placeholder-slate-600 focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 transition"
                placeholder="••••••••"
              />
            </div>
          </div>

          {/* Role selector */}
          <div className="space-y-1.5 text-left">
            <label className="block text-xs font-semibold text-slate-300">
              Simulated User Role
            </label>
            <div className="relative">
              <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-slate-500">
                <Shield size={16} />
              </span>
              <select
                value={selectedRole}
                onChange={(e) => setSelectedRole(e.target.value as UserRole)}
                className="w-full pl-9 pr-3 py-2 text-sm bg-slate-950 border border-slate-800 rounded-lg text-slate-100 focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 transition appearance-none cursor-pointer"
              >
                <option value="Business Owner">Business Owner (Sophia)</option>
                <option value="Admin">System Administrator</option>
                <option value="Financial Analyst">Financial Analyst (David)</option>
              </select>
            </div>
          </div>

          {/* Submit CTA */}
          <button
            type="submit"
            disabled={isLoading}
            className="w-full py-2.5 bg-emerald-600 hover:bg-emerald-500 active:scale-98 text-white text-sm font-semibold rounded-lg shadow-lg shadow-emerald-950/20 transition disabled:opacity-70 disabled:cursor-not-allowed flex items-center justify-center gap-2 cursor-pointer"
          >
            {isLoading ? (
              <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            ) : "Authenticate Session"}
          </button>
        </form>

        {/* Quick Fill Quick-Links */}
        <div className="mt-8 pt-6 border-t border-slate-850">
          <span className="text-[10px] uppercase tracking-wider text-slate-500 font-mono block mb-2.5">
            Quick Simulation Accounts
          </span>
          <div className="flex gap-2 flex-wrap">
            <button
              onClick={() => handleQuickFill("Business Owner")}
              className="px-2 py-1 bg-slate-950 border border-slate-850 hover:border-slate-700 rounded text-[11px] text-slate-400 hover:text-white transition"
            >
              Sophia (Owner)
            </button>
            <button
              onClick={() => handleQuickFill("Financial Analyst")}
              className="px-2 py-1 bg-slate-950 border border-slate-850 hover:border-slate-700 rounded text-[11px] text-slate-400 hover:text-white transition"
            >
              David (Analyst)
            </button>
            <button
              onClick={() => handleQuickFill("Admin")}
              className="px-2 py-1 bg-slate-950 border border-slate-850 hover:border-slate-700 rounded text-[11px] text-slate-400 hover:text-white transition"
            >
              Admin
            </button>
          </div>
        </div>

      </div>
    </div>
  );
};
