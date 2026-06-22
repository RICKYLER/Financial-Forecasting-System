import React, { useState } from "react";
import type { SalesRecord } from "../types";
import { simulateForecast } from "../mockData";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, Cell, PieChart, Pie } from "recharts";
import { Sliders, Coins, Lightbulb } from "@phosphor-icons/react";

interface ExpenseForecastingProps {
  historicalData: SalesRecord[];
}

export const ExpenseForecasting: React.FC<ExpenseForecastingProps> = ({ historicalData }) => {
  const [horizon, setHorizon] = useState(12);
  const [fixedCostReduction, setFixedCostReduction] = useState(0); // in percent

  // Constant fixed cost assumption
  const ASSUMED_FIXED_COST = 20000;

  // Generate simulated expense forecasts
  const forecastData = simulateForecast(historicalData, "expenses", horizon, "arima");

  // Format currency
  const formatCurrency = (val: number) => {
    return new Intl.NumberFormat("en-PH", {
      style: "currency",
      currency: "PHP",
      maximumFractionDigits: 0
    }).format(val);
  };

  // Compile expense data and apply reduction to the FIXED portion
  const chartData: Array<{
    date: string;
    historical: number | null;
    forecast: number | null;
    fixed: number;
    variable: number;
  }> = historicalData.map(h => {
    const variable = Math.max(0, h.expenses - ASSUMED_FIXED_COST);
    return {
      date: h.date,
      historical: h.expenses,
      forecast: null,
      fixed: ASSUMED_FIXED_COST,
      variable: variable
    };
  });

  const lastHist = historicalData[historicalData.length - 1];
  if (lastHist && forecastData.length > 0) {
    const lastVar = Math.max(0, lastHist.expenses - ASSUMED_FIXED_COST);
    chartData.push({
      date: lastHist.date,
      historical: lastHist.expenses,
      forecast: lastHist.expenses,
      fixed: ASSUMED_FIXED_COST * (1 - fixedCostReduction / 100),
      variable: lastVar
    });
  }

  forecastData.forEach(f => {
    const reducedFixed = ASSUMED_FIXED_COST * (1 - fixedCostReduction / 100);
    // Variable portion remains the same as simulated forecast difference
    const predictedVariable = Math.max(0, f.predicted - ASSUMED_FIXED_COST);
    const totalPredicted = reducedFixed + predictedVariable;

    chartData.push({
      date: f.date,
      historical: null,
      forecast: totalPredicted,
      fixed: reducedFixed,
      variable: predictedVariable
    });
  });

  // Latest historical month breakdown
  const latestHist = historicalData[historicalData.length - 1] || { expenses: 0 };
  const latestFixed = ASSUMED_FIXED_COST;
  const latestVariable = Math.max(0, latestHist.expenses - latestFixed);

  const pieData = [
    { name: "Fixed Costs", value: latestFixed, color: "#475569" }, // Slate-600
    { name: "Variable Costs", value: latestVariable, color: "#10b981" } // Emerald-500
  ];

  const totalForecastedExpensesSum = forecastData.reduce((sum, f) => {
    const predictedVariable = Math.max(0, f.predicted - ASSUMED_FIXED_COST);
    const reducedFixed = ASSUMED_FIXED_COST * (1 - fixedCostReduction / 100);
    return sum + (reducedFixed + predictedVariable);
  }, 0);

  return (
    <div className="space-y-8 text-left">
      
      {/* Parameter Optimization Controller */}
      <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="space-y-1">
          <h3 className="text-sm font-bold text-slate-800 uppercase tracking-wider font-mono flex items-center gap-2">
            <Sliders size={16} className="text-emerald-500" />
            Fixed Cost Reduction Planner
          </h3>
          <p className="text-slate-400 text-xs">
            Simulate a percentage reduction in fixed overhead (e.g. rent, salaries) to see forecast impact.
          </p>
        </div>

        <div className="flex gap-6 items-center shrink-0">
          <div className="space-y-1 text-xs">
            <div className="flex justify-between font-semibold">
              <span className="text-slate-500">Fixed Cost Reduction:</span>
              <span className="text-emerald-600">{fixedCostReduction}%</span>
            </div>
            <input
              type="range"
              min="0"
              max="30"
              step="5"
              value={fixedCostReduction}
              onChange={(e) => setFixedCostReduction(parseInt(e.target.value))}
              className="w-48 h-1.5 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-emerald-600"
            />
          </div>
          <div className="h-10 w-px bg-slate-200" />
          <div className="space-y-1 text-xs">
            <span className="text-slate-400 block">Horizon Range:</span>
            <select
              value={horizon}
              onChange={(e) => setHorizon(parseInt(e.target.value))}
              className="px-3 py-1 bg-white border border-slate-200 rounded text-slate-700 focus:outline-none focus:border-emerald-500 transition cursor-pointer"
            >
              <option value={6}>6 Months</option>
              <option value={12}>12 Months</option>
              <option value={18}>18 Months</option>
            </select>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Main Expenses Chart */}
        <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-sm lg:col-span-2">
          <div className="flex items-center justify-between mb-6">
            <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider font-mono">
              Operational Expense Forecast (ARIMA)
            </h4>
            <span className="text-xs text-slate-400 font-mono">Monthly Projections (₱)</span>
          </div>

          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={chartData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                <XAxis dataKey="date" stroke="#94a3b8" fontSize={11} tickLine={false} />
                <YAxis stroke="#94a3b8" fontSize={11} tickLine={false} axisLine={false} tickFormatter={(tick) => `₱${tick/1000}k`} />
                <Tooltip formatter={(value: any) => [formatCurrency(Number(value))]} />
                <Legend iconSize={8} wrapperStyle={{ fontSize: 12, paddingTop: 10 }} />
                
                <Line type="monotone" dataKey="historical" name="Historical Expenses" stroke="#64748b" strokeWidth={2.5} dot={{ r: 3 }} />
                <Line type="monotone" dataKey="forecast" name="Projected Expenses" stroke="#10b981" strokeWidth={2.5} strokeDasharray="4 4" dot={{ r: 3 }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Expense Composition Panel */}
        <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-sm flex flex-col justify-between">
          <div>
            <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider font-mono mb-4">
              Current Expense Composition
            </h4>
            <div className="h-44 flex items-center justify-center">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={pieData}
                    cx="50%"
                    cy="50%"
                    innerRadius={50}
                    outerRadius={70}
                    paddingAngle={4}
                    dataKey="value"
                  >
                    {pieData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip formatter={(value: any) => [formatCurrency(Number(value))]} />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="space-y-2.5 text-xs border-t border-slate-100 pt-4">
            <div className="flex justify-between items-center">
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 bg-slate-600 rounded-full" />
                <span className="text-slate-500">Fixed Cost:</span>
              </div>
              <span className="font-semibold text-slate-700">{formatCurrency(latestFixed)}</span>
            </div>
            <div className="flex justify-between items-center">
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 bg-emerald-500 rounded-full" />
                <span className="text-slate-500">Variable Cost:</span>
              </div>
              <span className="font-semibold text-slate-700">{formatCurrency(latestVariable)}</span>
            </div>
          </div>
        </div>

      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        
        {/* Sum of Projected Expense card */}
        <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-sm">
          <div className="flex justify-between items-start">
            <div>
              <span className="text-[11px] font-semibold tracking-wider text-slate-400 uppercase font-mono">
                Total Forecasted Costs (12M)
              </span>
              <h3 className="text-xl font-bold text-slate-900 mt-1 font-sans">
                {formatCurrency(totalForecastedExpensesSum)}
              </h3>
            </div>
            <div className="p-2.5 bg-slate-50 text-slate-600 rounded-lg">
              <Coins size={20} weight="bold" />
            </div>
          </div>
        </div>

        {/* Cost Optimization Advice */}
        <div className="bg-emerald-950/20 border border-emerald-800/40 p-5 rounded-xl flex gap-3 text-xs text-emerald-800 md:col-span-2">
          <Lightbulb size={20} className="text-emerald-600 shrink-0 mt-0.5" />
          <div>
            <p className="font-semibold text-emerald-950">Fixed vs. Variable Cost Strategy:</p>
            <p className="mt-1 text-[11px] text-emerald-700 leading-relaxed">
              Reducing your fixed overhead by {fixedCostReduction || 10}% leads to an expected net saving of {formatCurrency(ASSUMED_FIXED_COST * (fixedCostReduction || 10)/100 * horizon)} over the course of your {horizon}-month forecast horizon, substantially reducing your financial break-even requirements.
            </p>
          </div>
        </div>

      </div>

    </div>
  );
};
