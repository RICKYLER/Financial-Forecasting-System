import React, { useState } from "react";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, ReferenceDot } from "recharts";
import { Sliders, Calculator, Tag } from "@phosphor-icons/react";

export const BreakEvenAnalysis: React.FC = () => {
  const [fixedCost, setFixedCost] = useState(50000);
  const [sellingPrice, setSellingPrice] = useState(150);
  const [variableCost, setVariableCost] = useState(80);

  // Math Calculations
  const contributionMargin = sellingPrice - variableCost;
  const breakEvenUnits = contributionMargin > 0 ? Math.ceil(fixedCost / contributionMargin) : 0;
  const breakEvenRevenue = breakEvenUnits * sellingPrice;

  // Format currency
  const formatCurrency = (val: number) => {
    return new Intl.NumberFormat("en-PH", {
      style: "currency",
      currency: "PHP",
      maximumFractionDigits: 0
    }).format(val);
  };

  // Compile data points for line chart (from 0 units to 2 * break-even units)
  const chartData: any[] = [];
  const maxUnits = breakEvenUnits > 0 ? Math.ceil(breakEvenUnits * 1.8) : 1000;
  const steps = 10;
  const stepSize = Math.max(1, Math.round(maxUnits / steps));

  for (let i = 0; i <= steps; i++) {
    const units = i * stepSize;
    const totalCost = fixedCost + (variableCost * units);
    const revenue = sellingPrice * units;
    chartData.push({
      units,
      totalCost,
      revenue,
      fixedCost
    });
  }

  // Ensure exact break-even units is in the chart data for precision line crossing
  if (breakEvenUnits > 0 && !chartData.some(d => d.units === breakEvenUnits)) {
    const totalCost = fixedCost + (variableCost * breakEvenUnits);
    const revenue = sellingPrice * breakEvenUnits;
    chartData.push({
      units: breakEvenUnits,
      totalCost,
      revenue,
      fixedCost
    });
    chartData.sort((a, b) => a.units - b.units);
  }

  return (
    <div className="space-y-8 text-left font-sans">
      
      {/* Inputs & Stats Cards Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Sliders Input Control Panel */}
        <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-sm space-y-5 lg:col-span-1">
          <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider font-mono flex items-center gap-2">
            <Sliders size={16} className="text-emerald-500" />
            Calculator Variables
          </h3>

          {/* Input: Fixed Cost */}
          <div className="space-y-1.5 text-xs">
            <div className="flex justify-between font-semibold">
              <span className="text-slate-500">Fixed Cost:</span>
              <span className="text-slate-850 font-bold">{formatCurrency(fixedCost)}</span>
            </div>
            <input
              type="range"
              min="10000"
              max="200000"
              step="5000"
              value={fixedCost}
              onChange={(e) => setFixedCost(parseInt(e.target.value))}
              className="w-full h-1.5 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-emerald-600"
            />
          </div>

          {/* Input: Selling Price */}
          <div className="space-y-1.5 text-xs">
            <div className="flex justify-between font-semibold">
              <span className="text-slate-500">Selling Price per Unit:</span>
              <span className="text-slate-850 font-bold">{formatCurrency(sellingPrice)}</span>
            </div>
            <input
              type="range"
              min="50"
              max="1000"
              step="10"
              value={sellingPrice}
              onChange={(e) => setSellingPrice(parseInt(e.target.value))}
              className="w-full h-1.5 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-emerald-600"
            />
          </div>

          {/* Input: Variable Cost */}
          <div className="space-y-1.5 text-xs">
            <div className="flex justify-between font-semibold">
              <span className="text-slate-500">Variable Cost per Unit:</span>
              <span className="text-slate-850 font-bold">{formatCurrency(variableCost)}</span>
            </div>
            <input
              type="range"
              min="10"
              max="Math.min(900, sellingPrice - 1)"
              value={variableCost}
              onChange={(e) => setVariableCost(Math.min(sellingPrice - 1, parseInt(e.target.value)))}
              className="w-full h-1.5 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-emerald-600"
            />
          </div>
        </div>

        {/* Results Panels (Dynamic Cards) */}
        <div className="lg:col-span-2 grid grid-cols-1 sm:grid-cols-2 gap-6">
          
          {/* Break-even Units Card */}
          <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-sm flex flex-col justify-between">
            <div className="flex justify-between items-start">
              <div>
                <span className="text-[11px] font-semibold tracking-wider text-slate-400 uppercase font-mono">
                  Break-even Units
                </span>
                <h3 className="text-3xl font-bold text-slate-900 mt-1 font-sans">
                  {breakEvenUnits.toLocaleString()} units
                </h3>
              </div>
              <div className="p-2.5 bg-emerald-50 text-emerald-600 rounded-lg">
                <Calculator size={20} weight="bold" />
              </div>
            </div>
            <p className="text-slate-400 text-xs mt-4">
              Sales threshold required to cover both operating overhead and unit manufacturing variable costs.
            </p>
          </div>

          {/* Break-even Revenue Card */}
          <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-sm flex flex-col justify-between">
            <div className="flex justify-between items-start">
              <div>
                <span className="text-[11px] font-semibold tracking-wider text-slate-400 uppercase font-mono">
                  Break-even Revenue
                </span>
                <h3 className="text-3xl font-bold text-slate-900 mt-1 font-sans">
                  {formatCurrency(breakEvenRevenue)}
                </h3>
              </div>
              <div className="p-2.5 bg-slate-50 text-slate-600 rounded-lg">
                <Tag size={20} />
              </div>
            </div>
            <p className="text-slate-400 text-xs mt-4">
              Gross sales income required. Contribution margin ratio:{" "}
              <span className="font-semibold text-slate-700">
                {sellingPrice > 0 ? ((contributionMargin / sellingPrice) * 100).toFixed(1) : 0}%
              </span>
            </p>
          </div>

        </div>
      </div>

      {/* Break-Even Intersection Chart */}
      <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-sm">
        <div className="flex items-center justify-between mb-6">
          <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider font-mono">
            Break-even Cost vs Revenue Intersection (₱)
          </h4>
          <span className="text-xs text-slate-400 font-mono">X-Axis = Quantity (Units)</span>
        </div>

        {contributionMargin <= 0 ? (
          <div className="text-rose-600 text-xs font-semibold py-12 text-center">
            Error: Variable cost per unit exceeds or equals the selling price. A contribution margin is required to break-even.
          </div>
        ) : (
          <div className="h-96">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={chartData} margin={{ top: 10, right: 10, left: 10, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                <XAxis dataKey="units" stroke="#94a3b8" fontSize={11} tickLine={false} />
                <YAxis stroke="#94a3b8" fontSize={11} tickLine={false} axisLine={false} tickFormatter={(tick) => `₱${tick/1000}k`} />
                <Tooltip formatter={(value: any) => [formatCurrency(value), undefined]} />
                <Legend iconSize={8} wrapperStyle={{ fontSize: 12, paddingTop: 10 }} />
                
                {/* Fixed Cost reference boundary line */}
                <Line type="monotone" dataKey="fixedCost" name="Fixed Overhead" stroke="#cbd5e1" strokeWidth={1.5} strokeDasharray="4 4" dot={false} />

                {/* Total Cost Curve */}
                <Line type="monotone" dataKey="totalCost" name="Total Expenses" stroke="#64748b" strokeWidth={2.5} dot={false} />

                {/* Sales Revenue Curve */}
                <Line type="monotone" dataKey="revenue" name="Sales Revenue" stroke="#10b981" strokeWidth={2.5} dot={false} />

                {/* Intersection Reference Marker */}
                {breakEvenUnits > 0 && (
                  <ReferenceDot
                    x={breakEvenUnits}
                    y={breakEvenRevenue}
                    r={6}
                    fill="#ef4444"
                    stroke="#ffffff"
                    strokeWidth={2}
                    label={{ value: "Break-even", fill: "#ef4444", fontSize: 10, position: "top", fontWeight: "bold" }}
                  />
                )}
              </LineChart>
            </ResponsiveContainer>
          </div>
        )}
      </div>

    </div>
  );
};
