import React, { useState } from "react";
import type { SalesRecord } from "../types";
import { simulateForecast } from "../mockData";
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts";
import { CalendarBlank, Coins, ChartLine, Lightbulb } from "@phosphor-icons/react";

interface RevenueForecastingProps {
  historicalData: SalesRecord[];
}

export const RevenueForecasting: React.FC<RevenueForecastingProps> = ({ historicalData }) => {
  const horizon = 12;
  const [activeModel, setActiveModel] = useState<"both" | "arima" | "prophet">("both");

  // Get ARIMA and Prophet projections
  const arimaForecast = simulateForecast(historicalData, "revenue", horizon, "arima");
  const prophetForecast = simulateForecast(historicalData, "revenue", horizon, "prophet");

  // Format currency helpers
  const formatCurrency = (val: number) => {
    return new Intl.NumberFormat("en-PH", {
      style: "currency",
      currency: "PHP",
      maximumFractionDigits: 0
    }).format(val);
  };

  // Compile data for Recharts
  const chartData: any[] = historicalData.map(h => ({
    date: h.date,
    historical: h.revenue,
    arima: null,
    prophet: null
  }));

  const lastHist = historicalData[historicalData.length - 1];
  if (lastHist && arimaForecast.length > 0) {
    chartData.push({
      date: lastHist.date,
      historical: lastHist.revenue,
      arima: lastHist.revenue,
      prophet: lastHist.revenue
    });
  }

  arimaForecast.forEach((f, idx) => {
    const pf = prophetForecast[idx];
    chartData.push({
      date: f.date,
      historical: null,
      arima: f.predicted,
      prophet: pf ? pf.predicted : null
    });
  });

  // Calculate annual projections (sum of next 12 months forecast)
  const totalArimaAnnual = arimaForecast.slice(0, 12).reduce((sum, f) => sum + f.predicted, 0);
  const totalProphetAnnual = prophetForecast.slice(0, 12).reduce((sum, f) => sum + f.predicted, 0);

  return (
    <div className="space-y-8 text-left">
      
      {/* Annual Summary Row */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        
        {/* Model Selection Controller */}
        <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-sm flex flex-col justify-between">
          <div>
            <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider font-mono">
              Model Filter Configuration
            </h4>
            <p className="text-slate-400 text-xs mt-1">
              Select model to render comparison projections.
            </p>
          </div>
          <div className="flex gap-2 mt-4">
            <button
              onClick={() => setActiveModel("both")}
              className={`flex-1 py-1.5 text-xs font-semibold rounded ${
                activeModel === "both" 
                  ? "bg-slate-900 text-emerald-400 border border-slate-800" 
                  : "bg-slate-100 hover:bg-slate-200 text-slate-600"
              }`}
            >
              Both
            </button>
            <button
              onClick={() => setActiveModel("arima")}
              className={`flex-1 py-1.5 text-xs font-semibold rounded ${
                activeModel === "arima" 
                  ? "bg-slate-900 text-emerald-400 border border-slate-800" 
                  : "bg-slate-100 hover:bg-slate-200 text-slate-600"
              }`}
            >
              ARIMA
            </button>
            <button
              onClick={() => setActiveModel("prophet")}
              className={`flex-1 py-1.5 text-xs font-semibold rounded ${
                activeModel === "prophet" 
                  ? "bg-slate-900 text-emerald-400 border border-slate-800" 
                  : "bg-slate-100 hover:bg-slate-200 text-slate-600"
              }`}
            >
              Prophet
            </button>
          </div>
        </div>

        {/* ARIMA Annual Projection */}
        <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-sm">
          <div className="flex justify-between items-start">
            <div>
              <span className="text-[11px] font-semibold tracking-wider text-slate-400 uppercase font-mono">
                Projected 12M Revenue (ARIMA)
              </span>
              <h3 className="text-xl font-bold text-slate-900 mt-1 font-sans">
                {formatCurrency(totalArimaAnnual)}
              </h3>
            </div>
            <div className="p-2.5 bg-emerald-50 text-emerald-600 rounded-lg">
              <Coins size={20} weight="bold" />
            </div>
          </div>
          <div className="flex items-center gap-1 mt-3.5 text-xs text-slate-500 font-semibold">
            <ChartLine size={16} className="text-emerald-500" />
            <span>Linear trend extrapolation</span>
          </div>
        </div>

        {/* Prophet Annual Projection */}
        <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-sm">
          <div className="flex justify-between items-start">
            <div>
              <span className="text-[11px] font-semibold tracking-wider text-slate-400 uppercase font-mono">
                Projected 12M Revenue (Prophet)
              </span>
              <h3 className="text-xl font-bold text-slate-900 mt-1 font-sans">
                {formatCurrency(totalProphetAnnual)}
              </h3>
            </div>
            <div className="p-2.5 bg-emerald-50 text-emerald-600 rounded-lg">
              <Coins size={20} weight="bold" />
            </div>
          </div>
          <div className="flex items-center gap-1 mt-3.5 text-xs text-slate-500 font-semibold">
            <ChartLine size={16} className="text-emerald-500" />
            <span>Additive non-linear seasonality</span>
          </div>
        </div>

      </div>

      {/* Main Charts area */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        
        {/* Recharts area */}
        <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-sm lg:col-span-3">
          <div className="flex items-center justify-between mb-6">
            <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider font-mono">
              Model Comparison Timeline (₱)
            </h4>
            <span className="text-xs text-slate-400 font-mono">Historical vs Forecast Projections</span>
          </div>

          <div className="h-96">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={chartData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorArima" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#10b981" stopOpacity={0.15}/>
                    <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                  </linearGradient>
                  <linearGradient id="colorProphet" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.15}/>
                    <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                <XAxis dataKey="date" stroke="#94a3b8" fontSize={11} tickLine={false} />
                <YAxis stroke="#94a3b8" fontSize={11} tickLine={false} axisLine={false} tickFormatter={(tick) => `₱${tick/1000}k`} />
                <Tooltip formatter={(value: any, name: any) => {
                  if (name === "historical") return [formatCurrency(value), "Historical Revenue"];
                  if (name === "arima") return [formatCurrency(value), "ARIMA Forecast"];
                  if (name === "prophet") return [formatCurrency(value), "Prophet Forecast"];
                  return [value, name];
                }} />
                <Legend iconSize={8} wrapperStyle={{ fontSize: 12, paddingTop: 10 }} />
                
                {/* Historical Area */}
                <Area type="monotone" dataKey="historical" name="Historical Revenue" stroke="#64748b" strokeWidth={2.5} fill="none" dot={{ r: 3 }} />

                {/* ARIMA Model Line/Area */}
                {(activeModel === "both" || activeModel === "arima") && (
                  <Area type="monotone" dataKey="arima" name="ARIMA Forecast" stroke="#10b981" strokeWidth={2.5} fill="url(#colorArima)" strokeDasharray="4 4" dot={{ r: 3 }} />
                )}

                {/* Prophet Model Line/Area */}
                {(activeModel === "both" || activeModel === "prophet") && (
                  <Area type="monotone" dataKey="prophet" name="Prophet Forecast" stroke="#3b82f6" strokeWidth={2.5} fill="url(#colorProphet)" strokeDasharray="4 4" dot={{ r: 3 }} />
                )}
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Info & Side lists */}
        <div className="space-y-6">
          <div className="bg-slate-900 border border-slate-800 text-slate-100 rounded-xl p-6 shadow-sm">
            <h4 className="text-[10px] font-bold text-slate-500 uppercase tracking-wider font-mono mb-4">
              Revenue Predictions (ARIMA)
            </h4>
            <div className="space-y-4 max-h-[16.5rem] overflow-y-auto pr-1">
              {arimaForecast.map((f, i) => (
                <div key={i} className="flex justify-between items-center text-xs pb-3 border-b border-slate-800/60 last:border-0 last:pb-0">
                  <div className="flex items-center gap-2">
                    <CalendarBlank size={14} className="text-slate-500" />
                    <span className="font-mono text-slate-300">{f.date}</span>
                  </div>
                  <span className="font-bold text-white">{formatCurrency(f.predicted)}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-emerald-950/20 border border-emerald-800/40 p-4 rounded-xl flex gap-2.5 text-xs text-emerald-800">
            <Lightbulb size={18} className="text-emerald-600 shrink-0 mt-0.5" />
            <div>
              <p className="font-semibold text-emerald-950">Engine Recommendation:</p>
              <p className="mt-1 text-[11px] text-emerald-700 leading-normal">
                Prophet indicators capture standard holiday/end-of-year sales seasonal variations slightly better than ARIMA models in high-growth environments.
              </p>
            </div>
          </div>
        </div>

      </div>

    </div>
  );
};
