import React from "react";
import type { SalesRecord } from "../types";
import { simulateProfitForecast } from "../mockData";
import { ComposedChart, Bar, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts";
import { CalendarBlank, Percent } from "@phosphor-icons/react";

interface ProfitAnalysisProps {
  historicalData: SalesRecord[];
}

export const ProfitAnalysis: React.FC<ProfitAnalysisProps> = ({ historicalData }) => {
  const horizon = 12;

  // Generate profit forecast (which jointly forecasts revenue & expenses)
  const forecastData = simulateProfitForecast(historicalData, horizon);

  // Format currency helper
  const formatCurrency = (val: number) => {
    return new Intl.NumberFormat("en-PH", {
      style: "currency",
      currency: "PHP",
      maximumFractionDigits: 0
    }).format(val);
  };

  // Compile historical & forecast datasets for Composed Chart
  const chartData = historicalData.map(h => ({
    date: h.date,
    revenue: h.revenue,
    expenses: h.expenses,
    profit: h.profit,
    margin: parseFloat((h.revenue > 0 ? (h.profit / h.revenue) * 100 : 0).toFixed(1))
  }));

  const lastHist = historicalData[historicalData.length - 1];
  if (lastHist && forecastData.length > 0) {
    chartData.push({
      date: lastHist.date,
      revenue: lastHist.revenue,
      expenses: lastHist.expenses,
      profit: lastHist.profit,
      margin: parseFloat((lastHist.revenue > 0 ? (lastHist.profit / lastHist.revenue) * 100 : 0).toFixed(1))
    });
  }

  forecastData.forEach(f => {
    chartData.push({
      date: f.date,
      revenue: f.predicted_revenue,
      expenses: f.predicted_expenses,
      profit: f.predicted_profit,
      margin: f.predicted_margin
    });
  });

  // Calculate average profit margins
  const avgHistMargin = historicalData.reduce((acc, h) => acc + (h.revenue > 0 ? (h.profit / h.revenue) * 100 : 0), 0) / historicalData.length;
  const avgForecastMargin = forecastData.reduce((acc, f) => acc + f.predicted_margin, 0) / forecastData.length;

  return (
    <div className="space-y-8 text-left">
      
      {/* Margin Summary stats row */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        
        {/* Hist Avg Margin */}
        <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-sm">
          <div className="flex justify-between items-start">
            <div>
              <span className="text-[11px] font-semibold tracking-wider text-slate-400 uppercase font-mono">
                Historical Avg Margin
              </span>
              <h3 className="text-xl font-bold text-slate-900 mt-1 font-sans">
                {avgHistMargin.toFixed(1)}%
              </h3>
            </div>
            <div className="p-2.5 bg-slate-50 text-slate-600 rounded-lg">
              <Percent size={20} />
            </div>
          </div>
        </div>

        {/* Forecast Avg Margin */}
        <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-sm">
          <div className="flex justify-between items-start">
            <div>
              <span className="text-[11px] font-semibold tracking-wider text-slate-400 uppercase font-mono">
                Forecasted Avg Margin (12M)
              </span>
              <h3 className="text-xl font-bold text-slate-900 mt-1 font-sans">
                {avgForecastMargin.toFixed(1)}%
              </h3>
            </div>
            <div className="p-2.5 bg-emerald-50 text-emerald-600 rounded-lg">
              <Percent size={20} weight="bold" />
            </div>
          </div>
        </div>

        {/* Dynamic Margin Margin change alerts */}
        <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-sm flex flex-col justify-center">
          <div className="flex items-center gap-2">
            <span className={`w-2 h-2 rounded-full ${avgForecastMargin >= avgHistMargin ? "bg-emerald-500" : "bg-rose-500"}`} />
            <p className="text-xs font-semibold text-slate-700">
              {avgForecastMargin >= avgHistMargin 
                ? "Profitability expansion projected."
                : "Margin compression warnings flagged."}
            </p>
          </div>
          <p className="text-slate-400 text-[11px] mt-1.5 leading-normal">
            {avgForecastMargin >= avgHistMargin
              ? "Revenues are expanding faster than operating overhead, boosting forecasted net margins."
              : "Fixed and variable expenses are expanding rapidly, compressing forecasted net margin yields."}
          </p>
        </div>

      </div>

      {/* Main Composed Chart */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        
        {/* Composed Chart area */}
        <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-sm lg:col-span-3">
          <div className="flex items-center justify-between mb-6">
            <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider font-mono">
              Composed Profit Performance Matrix (₱)
            </h4>
            <span className="text-xs text-slate-400 font-mono">Revenue/Expense Bars vs Net Profit Lines</span>
          </div>

          <div className="h-96">
            <ResponsiveContainer width="100%" height="100%">
              <ComposedChart data={chartData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                <XAxis dataKey="date" stroke="#94a3b8" fontSize={11} tickLine={false} />
                <YAxis stroke="#94a3b8" fontSize={11} tickLine={false} axisLine={false} tickFormatter={(tick) => `₱${tick/1000}k`} />
                <Tooltip formatter={(value: any, name: any) => {
                  if (name === "revenue") return [formatCurrency(value), "Revenue"];
                  if (name === "expenses") return [formatCurrency(value), "Expenses"];
                  if (name === "profit") return [formatCurrency(value), "Net Profit"];
                  return [value, name];
                }} />
                <Legend iconSize={8} wrapperStyle={{ fontSize: 12, paddingTop: 10 }} />
                
                {/* Bars for volume comparisons */}
                <Bar dataKey="revenue" name="Revenue" fill="#94a3b8" opacity={0.25} barSize={16} />
                <Bar dataKey="expenses" name="Expenses" fill="#cbd5e1" opacity={0.4} barSize={16} />

                {/* Line for target margin representation */}
                <Line type="monotone" dataKey="profit" name="Net Profit" stroke="#10b981" strokeWidth={3} dot={{ r: 3 }} />
              </ComposedChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Prediction Outputs List */}
        <div className="bg-slate-900 border border-slate-800 text-slate-100 rounded-xl p-6 shadow-sm">
          <h4 className="text-[10px] font-bold text-slate-500 uppercase tracking-wider font-mono mb-4">
            Projected Profit Margins
          </h4>
          <div className="space-y-4 max-h-[22rem] overflow-y-auto pr-1">
            {forecastData.map((f, i) => (
              <div key={i} className="flex justify-between items-center text-xs pb-3 border-b border-slate-800/60 last:border-0 last:pb-0">
                <div className="flex items-center gap-2">
                  <CalendarBlank size={14} className="text-slate-500" />
                  <span className="font-mono text-slate-300">{f.date}</span>
                </div>
                <div className="text-right">
                  <p className="font-bold text-white">{formatCurrency(f.predicted_profit)}</p>
                  <p className="text-[10px] text-emerald-500">{f.predicted_margin}% margin</p>
                </div>
              </div>
            ))}
          </div>
        </div>

      </div>

    </div>
  );
};
