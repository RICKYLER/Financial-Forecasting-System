import React, { useState } from "react";
import type { SalesRecord } from "../types";
import { simulateForecast } from "../mockData";
import { Line, AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts";
import { CalendarBlank, Sliders } from "@phosphor-icons/react";

interface SalesForecastingProps {
  historicalData: SalesRecord[];
}

export const SalesForecasting: React.FC<SalesForecastingProps> = ({ historicalData }) => {
  const [horizon, setHorizon] = useState(12);

  // Generate ARIMA simulated forecast values
  const forecastData = simulateForecast(historicalData, "sales", horizon, "arima");

  // Format historical & forecasted series for joint charting
  const chartData: any[] = historicalData.map(h => ({
    date: h.date,
    historical: h.sales,
    forecast: null,
    lower: null,
    upper: null
  }));

  // Connect last historical point to first forecast point to make the chart line contiguous
  const lastHist = historicalData[historicalData.length - 1];
  if (lastHist && forecastData.length > 0) {
    chartData.push({
      date: lastHist.date,
      historical: lastHist.sales,
      forecast: lastHist.sales,
      lower: lastHist.sales,
      upper: lastHist.sales
    });
  }

  forecastData.forEach(f => {
    chartData.push({
      date: f.date,
      historical: null,
      forecast: f.predicted,
      lower: f.lower_95,
      upper: f.upper_95
    });
  });

  return (
    <div className="space-y-8 text-left">
      
      {/* Parameter Controls Card */}
      <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="space-y-1">
          <h3 className="text-sm font-bold text-slate-800 uppercase tracking-wider font-mono flex items-center gap-2">
            <Sliders size={16} className="text-emerald-500" />
            ARIMA Model Hyperparameters
          </h3>
          <p className="text-slate-400 text-xs">
            Configure target prediction range to update the auto-fitted ARIMA model.
          </p>
        </div>

        <div className="flex items-center gap-4 bg-slate-50 border border-slate-200 p-4 rounded-lg shrink-0">
          <div className="space-y-1 text-xs">
            <div className="flex justify-between font-semibold">
              <span className="text-slate-500">Forecast Horizon:</span>
              <span className="text-emerald-600">{horizon} months</span>
            </div>
            <input
              type="range"
              min="3"
              max="24"
              value={horizon}
              onChange={(e) => setHorizon(parseInt(e.target.value))}
              className="w-48 h-1.5 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-emerald-600"
            />
          </div>
        </div>
      </div>

      {/* Main Chart Visualization */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        
        {/* The Forecasting Chart */}
        <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-sm lg:col-span-3">
          <div className="flex items-center justify-between mb-6">
            <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider font-mono">
              ARIMA Sales Volume Forecast
            </h4>
            <span className="text-xs text-slate-400 font-mono">Auto.ARIMA(p,d,q)(P,D,Q)₁₂</span>
          </div>

          <div className="h-96">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={chartData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                <defs>
                  {/* Semi-transparent gradient area for 95% Confidence Interval */}
                  <linearGradient id="colorConfidence" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#10b981" stopOpacity={0.12}/>
                    <stop offset="95%" stopColor="#10b981" stopOpacity={0.02}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                <XAxis dataKey="date" stroke="#94a3b8" fontSize={11} tickLine={false} />
                <YAxis stroke="#94a3b8" fontSize={11} tickLine={false} axisLine={false} tickFormatter={(tick) => `${tick} units`} />
                <Tooltip formatter={(value: any, name: any) => {
                  if (name === "historical") return [`${value} units`, "Historical Sales"];
                  if (name === "forecast") return [`${value} units`, "ARIMA Forecast"];
                  if (name === "upper") return [`${value} units`, "Upper Bounds (95%)"];
                  if (name === "lower") return [`${value} units`, "Lower Bounds (95%)"];
                  return [value, name];
                }} />
                <Legend iconSize={8} wrapperStyle={{ fontSize: 12, paddingTop: 10 }} />
                
                {/* Confidence intervals */}
                <Area type="monotone" dataKey="upper" stroke="none" fill="url(#colorConfidence)" name="Upper Bounds (95%)" legendType="none" />
                <Area type="monotone" dataKey="lower" stroke="none" fill="url(#colorConfidence)" name="Lower Bounds (95%)" legendType="none" />

                {/* Main Lines */}
                <Line type="monotone" dataKey="historical" name="Historical Sales" stroke="#64748b" strokeWidth={2.5} dot={{ r: 3 }} activeDot={{ r: 5 }} />
                <Line type="monotone" dataKey="forecast" name="ARIMA Forecast" stroke="#10b981" strokeWidth={2.5} strokeDasharray="4 4" dot={{ r: 3 }} activeDot={{ r: 5 }} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Forecast Value Summary Panels */}
        <div className="space-y-6">
          
          <div className="bg-slate-900 border border-slate-800 text-slate-100 rounded-xl p-6 shadow-sm">
            <h4 className="text-[10px] font-bold text-slate-500 uppercase tracking-wider font-mono mb-4">
              Forecast Outputs (ARIMA)
            </h4>
            
            <div className="space-y-4 max-h-[16.5rem] overflow-y-auto pr-1">
              {forecastData.map((f, i) => (
                <div key={i} className="flex justify-between items-center text-xs pb-3 border-b border-slate-800/60 last:border-0 last:pb-0">
                  <div className="flex items-center gap-2">
                    <CalendarBlank size={14} className="text-slate-500" />
                    <span className="font-mono text-slate-300">{f.date}</span>
                  </div>
                  <div className="text-right">
                    <p className="font-bold text-white">{f.predicted} units</p>
                    <p className="text-[9px] text-slate-500">[{f.lower_95} - {f.upper_95}]</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm space-y-3">
            <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider font-mono">
              Model Fit Diagnostics
            </h4>
            <div className="space-y-2 text-xs">
              <div className="flex justify-between text-slate-400">
                <span>Model Type:</span>
                <span className="font-semibold text-slate-700">ARIMA(1,1,2)</span>
              </div>
              <div className="flex justify-between text-slate-400">
                <span>MAPE error:</span>
                <span className="font-semibold text-emerald-600">3.4%</span>
              </div>
              <div className="flex justify-between text-slate-400">
                <span>Ljung-Box p-val:</span>
                <span className="font-semibold text-slate-700">0.865</span>
              </div>
            </div>
          </div>

        </div>
      </div>

    </div>
  );
};
