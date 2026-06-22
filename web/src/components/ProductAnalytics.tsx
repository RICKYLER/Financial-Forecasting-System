import React from "react";
import { mockProducts } from "../mockData";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from "recharts";
import { Coins, ShoppingCart } from "@phosphor-icons/react";

export const ProductAnalytics: React.FC = () => {
  const formatCurrency = (val: number) => {
    return new Intl.NumberFormat("en-PH", {
      style: "currency",
      currency: "PHP",
      maximumFractionDigits: 0
    }).format(val);
  };

  // Color array for items
  const colors = ["#475569", "#10b981", "#3b82f6"]; // Slate-600, Emerald-500, Blue-500

  return (
    <div className="space-y-8 text-left font-sans">
      
      {/* Product Analytics Table */}
      <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-sm">
        <div className="flex items-center justify-between mb-6">
          <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider font-mono">
            Product SKU Margin Analysis
          </h4>
          <span className="text-xs text-slate-400">Total units & margin metrics</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-xs text-left">
            <thead>
              <tr className="border-b border-slate-100 text-slate-400 font-mono text-[10px] uppercase pb-2">
                <th className="pb-2 font-semibold">Product Name</th>
                <th className="pb-2 font-semibold text-right">Quantity Sold</th>
                <th className="pb-2 font-semibold text-right">Revenue Generated</th>
                <th className="pb-2 font-semibold text-right">Net Profit</th>
                <th className="pb-2 font-semibold text-right">Profit Margin (%)</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {mockProducts.map((p, idx) => {
                const margin = p.revenue > 0 ? (p.profit / p.revenue) * 100 : 0;
                return (
                  <tr key={p.name} className="text-slate-650 hover:bg-slate-50/50">
                    <td className="py-3 flex items-center gap-2.5 font-semibold text-slate-900">
                      <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: colors[idx] }} />
                      {p.name}
                    </td>
                    <td className="py-3 text-right font-mono">{p.qtySold.toLocaleString()} units</td>
                    <td className="py-3 text-right font-mono">{formatCurrency(p.revenue)}</td>
                    <td className="py-3 text-right font-mono text-emerald-650 font-bold">{formatCurrency(p.profit)}</td>
                    <td className="py-3 text-right font-mono font-semibold">{margin.toFixed(1)}%</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Visual Chart Breakdown */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        
        {/* Quantity Sold Bar Chart */}
        <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-sm">
          <div className="flex items-center gap-2 mb-4">
            <ShoppingCart size={18} className="text-slate-400" />
            <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider font-mono">
              Sales Volume (Units)
            </h4>
          </div>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={mockProducts} layout="vertical" margin={{ left: 10, right: 10 }}>
                <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#e2e8f0" />
                <XAxis type="number" stroke="#94a3b8" fontSize={11} tickLine={false} />
                <YAxis dataKey="name" type="category" stroke="#94a3b8" fontSize={11} tickLine={false} />
                <Tooltip formatter={(value: any) => [`${Number(value).toLocaleString()} units`, "Units Sold"]} />
                <Bar dataKey="qtySold" radius={[0, 4, 4, 0]} barSize={20}>
                  {mockProducts.map((_, idx) => (
                    <Cell key={`cell-${idx}`} fill={colors[idx]} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Profit Generated Bar Chart */}
        <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-sm">
          <div className="flex items-center gap-2 mb-4">
            <Coins size={18} className="text-slate-400" />
            <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider font-mono">
              Net Profit Contribution (₱)
            </h4>
          </div>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={mockProducts} layout="vertical" margin={{ left: 10, right: 10 }}>
                <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#e2e8f0" />
                <XAxis type="number" stroke="#94a3b8" fontSize={11} tickLine={false} />
                <YAxis dataKey="name" type="category" stroke="#94a3b8" fontSize={11} tickLine={false} />
                <Tooltip formatter={(value: any) => [formatCurrency(Number(value)), "Net Profit"]} />
                <Bar dataKey="profit" radius={[0, 4, 4, 0]} barSize={20}>
                  {mockProducts.map((_, idx) => (
                    <Cell key={`cell-${idx}`} fill={colors[idx]} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

      </div>

    </div>
  );
};
