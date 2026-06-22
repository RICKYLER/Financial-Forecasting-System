import React from "react";
import type { SalesRecord } from "../types";
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar, Legend } from "recharts";
import { TrendUp, ChartBar, Coin, Warning } from "@phosphor-icons/react";

interface DashboardProps {
  historicalData: SalesRecord[];
}

export const Dashboard: React.FC<DashboardProps> = ({ historicalData }) => {
  // Safe parsing helper
  const formatCurrency = (val: number) => {
    return new Intl.NumberFormat("en-PH", {
      style: "currency",
      currency: "PHP",
      maximumFractionDigits: 0
    }).format(val);
  };

  // Get active month metrics
  const lastIdx = historicalData.length - 1;
  const currentMonthData = historicalData[lastIdx] || { sales: 0, revenue: 0, expenses: 0, profit: 0, date: "" };
  const prevMonthData = historicalData[lastIdx - 1] || { sales: 0, revenue: 0, expenses: 0, profit: 0, date: "" };

  const revenue = currentMonthData.revenue;
  const expenses = currentMonthData.expenses;
  const profit = currentMonthData.profit;
  const profitMargin = revenue > 0 ? (profit / revenue) * 100 : 0;

  // Growth rates compared to previous month
  const revGrowth = prevMonthData.revenue > 0 ? ((revenue - prevMonthData.revenue) / prevMonthData.revenue) * 100 : 0;
  const expGrowth = prevMonthData.expenses > 0 ? ((expenses - prevMonthData.expenses) / prevMonthData.expenses) * 100 : 0;
  const profitGrowth = prevMonthData.profit > 0 ? ((profit - prevMonthData.profit) / prevMonthData.profit) * 100 : 0;

  // Format data for Recharts
  const chartData = historicalData.map(r => ({
    name: r.date,
    revenue: r.revenue,
    expenses: r.expenses,
    profit: r.profit,
    margin: parseFloat((r.revenue > 0 ? (r.profit / r.revenue) * 100 : 0).toFixed(1))
  }));

  return (
    <div className="space-y-8 text-left">
      
      {/* Overview Cards Row */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        
        {/* KPI 1: Revenue */}
        <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-sm">
          <div className="flex justify-between items-start">
            <div>
              <span className="text-[11px] font-semibold tracking-wider text-slate-400 uppercase font-mono">
                Current Month Revenue
              </span>
              <h3 className="text-xl font-bold text-slate-900 mt-1 font-sans">
                {formatCurrency(revenue)}
              </h3>
            </div>
            <div className="p-2.5 bg-emerald-50 text-emerald-600 rounded-lg">
              <Coin size={20} weight="bold" />
            </div>
          </div>
          <div className="flex items-center gap-1.5 mt-4 text-xs font-semibold">
            <span className={`flex items-center ${revGrowth >= 0 ? "text-emerald-600" : "text-rose-600"}`}>
              {revGrowth >= 0 ? "+" : ""}{revGrowth.toFixed(1)}%
            </span>
            <span className="text-slate-400">vs prev. month</span>
          </div>
        </div>

        {/* KPI 2: Expenses */}
        <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-sm">
          <div className="flex justify-between items-start">
            <div>
              <span className="text-[11px] font-semibold tracking-wider text-slate-400 uppercase font-mono">
                Monthly Expenses
              </span>
              <h3 className="text-xl font-bold text-slate-900 mt-1 font-sans">
                {formatCurrency(expenses)}
              </h3>
            </div>
            <div className="p-2.5 bg-slate-50 text-slate-600 rounded-lg">
              <ChartBar size={20} />
            </div>
          </div>
          <div className="flex items-center gap-1.5 mt-4 text-xs font-semibold">
            <span className={`flex items-center ${expGrowth <= 0 ? "text-emerald-600" : "text-rose-600"}`}>
              {expGrowth >= 0 ? "+" : ""}{expGrowth.toFixed(1)}%
            </span>
            <span className="text-slate-400">vs prev. month</span>
          </div>
        </div>

        {/* KPI 3: Net Profit */}
        <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-sm">
          <div className="flex justify-between items-start">
            <div>
              <span className="text-[11px] font-semibold tracking-wider text-slate-400 uppercase font-mono">
                Net Profit
              </span>
              <h3 className="text-xl font-bold text-slate-900 mt-1 font-sans">
                {formatCurrency(profit)}
              </h3>
            </div>
            <div className="p-2.5 bg-emerald-50 text-emerald-600 rounded-lg">
              <Coin size={20} weight="bold" />
            </div>
          </div>
          <div className="flex items-center gap-1.5 mt-4 text-xs font-semibold">
            <span className={`flex items-center ${profitGrowth >= 0 ? "text-emerald-600" : "text-rose-600"}`}>
              {profitGrowth >= 0 ? "+" : ""}{profitGrowth.toFixed(1)}%
            </span>
            <span className="text-slate-400">vs prev. month</span>
          </div>
        </div>

        {/* KPI 4: Margin */}
        <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-sm">
          <div className="flex justify-between items-start">
            <div>
              <span className="text-[11px] font-semibold tracking-wider text-slate-400 uppercase font-mono">
                Net Profit Margin
              </span>
              <h3 className="text-xl font-bold text-slate-900 mt-1 font-sans">
                {profitMargin.toFixed(1)}%
              </h3>
            </div>
            <div className="p-2.5 bg-emerald-50 text-emerald-600 rounded-lg">
              <TrendUp size={20} weight="bold" />
            </div>
          </div>
          <div className="flex items-center gap-1.5 mt-4 text-xs font-semibold text-slate-500">
            <span className="w-2 h-2 bg-emerald-500 rounded-full" />
            <span>Target threshold: &gt;15%</span>
          </div>
        </div>

      </div>

      {/* Expense/Revenue Growth Warning banner */}
      {expGrowth > revGrowth && (
        <div className="bg-rose-50 border border-rose-200 text-rose-800 p-4 rounded-xl flex gap-3 items-center text-xs font-medium">
          <Warning size={18} className="text-rose-600 shrink-0" />
          <div>
            Expense growth ({expGrowth.toFixed(1)}%) is outstripping revenue growth ({revGrowth.toFixed(1)}%) in the last reporting period. Margin contraction detected.
          </div>
        </div>
      )}

      {/* Main Graph Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Revenue vs Expenses Timeline Area Chart */}
        <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-sm lg:col-span-2">
          <div className="flex items-center justify-between mb-6">
            <h4 className="text-sm font-bold text-slate-800 uppercase tracking-wider font-mono">
              Revenue & Expense Trajectory
            </h4>
            <span className="text-xs text-slate-400">Monthly breakdown (₱)</span>
          </div>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={chartData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorRev" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#10b981" stopOpacity={0.15}/>
                    <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                  </linearGradient>
                  <linearGradient id="colorExp" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#64748b" stopOpacity={0.1}/>
                    <stop offset="95%" stopColor="#64748b" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                <XAxis dataKey="name" stroke="#94a3b8" fontSize={11} tickLine={false} />
                <YAxis stroke="#94a3b8" fontSize={11} tickLine={false} axisLine={false} tickFormatter={(tick) => `₱${tick/1000}k`} />
                <Tooltip formatter={(value: any) => [formatCurrency(Number(value))]} />
                <Legend iconSize={8} wrapperStyle={{ fontSize: 12, paddingTop: 10 }} />
                <Area type="monotone" dataKey="revenue" name="Gross Revenue" stroke="#10b981" strokeWidth={2} fillOpacity={1} fill="url(#colorRev)" />
                <Area type="monotone" dataKey="expenses" name="Operational Expenses" stroke="#64748b" strokeWidth={2} fillOpacity={1} fill="url(#colorExp)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Profit Margin Performance Bar Chart */}
        <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-sm">
          <div className="flex items-center justify-between mb-6">
            <h4 className="text-sm font-bold text-slate-800 uppercase tracking-wider font-mono">
              Net Profit Margins (%)
            </h4>
            <span className="text-xs text-slate-400">Monthly percentage</span>
          </div>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData.slice(-12)}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                <XAxis dataKey="name" stroke="#94a3b8" fontSize={11} tickLine={false} />
                <YAxis stroke="#94a3b8" fontSize={11} tickLine={false} axisLine={false} tickFormatter={(tick) => `${tick}%`} />
                <Tooltip formatter={(value: any) => [`${Number(value)}%`, "Margin"]} />
                <Bar dataKey="margin" name="Margin" fill="#10b981" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

      </div>

    </div>
  );
};
