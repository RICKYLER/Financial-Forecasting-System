import React from "react";
import type { SalesRecord } from "../types";
import { TrendUp, TrendDown, Briefcase } from "@phosphor-icons/react";


interface BusinessIntelligenceProps {
  historicalData: SalesRecord[];
}

export const BusinessIntelligence: React.FC<BusinessIntelligenceProps> = ({ historicalData }) => {
  const lastIdx = historicalData.length - 1;
  const current = historicalData[lastIdx] || { revenue: 0, expenses: 0, profit: 0, sales: 0 };
  const prev = historicalData[lastIdx - 1] || { revenue: 0, expenses: 0, profit: 0, sales: 0 };

  // Calculate MoM KPIs
  const revChange = prev.revenue > 0 ? ((current.revenue - prev.revenue) / prev.revenue) * 100 : 0;
  const expChange = prev.expenses > 0 ? ((current.expenses - prev.expenses) / prev.expenses) * 100 : 0;
  const profitChange = prev.profit > 0 ? ((current.profit - prev.profit) / prev.profit) * 100 : 0;
  const salesChange = prev.sales > 0 ? ((current.sales - prev.sales) / prev.sales) * 100 : 0;

  const kpis = [
    {
      name: "Revenue Growth",
      value: `${revChange >= 0 ? "+" : ""}${revChange.toFixed(1)}%`,
      isPositive: revChange >= 0,
      description: "MoM changes in gross product sales and service receipts."
    },
    {
      name: "Expense Growth",
      value: `${expChange >= 0 ? "+" : ""}${expChange.toFixed(1)}%`,
      // Expense growth is negative (positive for business if expenses drop)
      isPositive: expChange <= 0,
      description: "Changes in raw inputs, rent, and monthly variable costs."
    },
    {
      name: "Profit Growth",
      value: `${profitChange >= 0 ? "+" : ""}${profitChange.toFixed(1)}%`,
      isPositive: profitChange >= 0,
      description: "MoM net profit yield expansion before taxation."
    },
    {
      name: "Customer Volume Growth",
      value: `${salesChange >= 0 ? "+" : ""}${salesChange.toFixed(1)}%`,
      isPositive: salesChange >= 0,
      description: "Customer purchasing volume trends based on order metrics."
    }
  ];

  return (
    <div className="space-y-8 text-left font-sans">
      
      {/* BI KPI Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {kpis.map((kpi) => (
          <div key={kpi.name} className="bg-white border border-slate-200 rounded-xl p-6 shadow-sm flex flex-col justify-between">
            <div className="flex justify-between items-start">
              <div>
                <span className="text-[11px] font-semibold tracking-wider text-slate-400 uppercase font-mono">
                  BI KPI Indicators
                </span>
                <h4 className="text-md font-bold text-slate-800 mt-1">
                  {kpi.name}
                </h4>
              </div>

              {/* Status Badge */}
              <div className={`px-2.5 py-1 rounded-full text-xs font-semibold flex items-center gap-1 ${
                kpi.isPositive 
                  ? "bg-emerald-50 text-emerald-700 border border-emerald-150" 
                  : "bg-rose-50 text-rose-700 border border-rose-150"
              }`}>
                {kpi.isPositive ? <TrendUp size={14} weight="bold" /> : <TrendDown size={14} weight="bold" />}
                <span>{kpi.isPositive ? "▲ Positive" : "▼ Negative"}</span>
              </div>
            </div>

            <div className="mt-6 flex items-baseline gap-2">
              <span className="text-3xl font-extrabold text-slate-900 tracking-tight">
                {kpi.value}
              </span>
              <span className="text-[11px] text-slate-400">Rate of change</span>
            </div>

            <p className="text-xs text-slate-500 mt-2 leading-relaxed">
              {kpi.description}
            </p>
          </div>
        ))}
      </div>

      {/* BI Summary text analysis */}
      <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-sm flex items-start gap-4">
        <div className="p-3 bg-slate-50 text-slate-600 rounded-lg shrink-0">
          <Briefcase size={22} />
        </div>
        <div className="space-y-2">
          <h4 className="text-sm font-bold text-slate-800 uppercase tracking-wider font-mono">
            Quarterly Aggregate Summary
          </h4>
          <p className="text-xs text-slate-500 leading-relaxed">
            The composite Business Intelligence Index indicates stable operational momentum. Net sales volumes remain resilient; however, continuous evaluation of key expense indices (variable processing overheads) is crucial to sustain the target net margin thresholds exceeding 15.0%.
          </p>
        </div>
      </div>

    </div>
  );
};
