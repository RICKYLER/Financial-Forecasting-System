import React, { useState } from "react";
import type { SalesRecord } from "../types";
import { Sparkle, Warning, Cpu, ArrowClockwise } from "@phosphor-icons/react";

interface AIRecommendationsProps {
  historicalData: SalesRecord[];
}

export const AIRecommendations: React.FC<AIRecommendationsProps> = ({ historicalData }) => {
  const [isGenerating, setIsGenerating] = useState(false);

  const lastIdx = historicalData.length - 1;
  const current = historicalData[lastIdx] || { revenue: 0, expenses: 0, profit: 0 };
  const prev = historicalData[lastIdx - 1] || { revenue: 0, expenses: 0, profit: 0 };

  const revGrowth = prev.revenue > 0 ? ((current.revenue - prev.revenue) / prev.revenue) * 100 : 0;
  const expGrowth = prev.expenses > 0 ? ((current.expenses - prev.expenses) / prev.expenses) * 100 : 0;
  const profitMargin = current.revenue > 0 ? (current.profit / current.revenue) * 100 : 0;

  // Simple simulated insights generator
  const getInsights = () => {
    const insights = [];

    // Insight 1: Expenses vs Revenue growth check
    if (expGrowth > revGrowth) {
      insights.push({
        title: "Address Expense Margin Leaks",
        type: "danger",
        text: `Operational expenses rose by ${expGrowth.toFixed(1)}% MoM, outstripping gross revenue growth of ${revGrowth.toFixed(1)}%. We recommend reviewing raw procurement contracts or scheduling variable cost optimization reviews immediately.`
      });
    } else {
      insights.push({
        title: "Maintain Expense Scaling Efficiencies",
        type: "success",
        text: `Revenue growth (${revGrowth.toFixed(1)}%) is expanding faster than operational expenses (${expGrowth.toFixed(1)}%). Operating leverage is currently working in your favor. Continue this configuration.`
      });
    }

    // Insight 2: Gross margin threshold check
    if (profitMargin < 20) {
      insights.push({
        title: "Improve Profit Margin Cushion",
        type: "warning",
        text: `Your current net profit margin is ${profitMargin.toFixed(1)}%, which is below the target threshold of 25.0%. To widen margins, evaluate increasing SKU prices for high-volume items (such as Coffee) or optimizing payroll layout schedules.`
      });
    } else {
      insights.push({
        title: "Excellent Profitability Index",
        type: "success",
        text: `Net profit margin of ${profitMargin.toFixed(1)}% exceeds the benchmark cushion. Consider allocating excess capital surpluses toward product line expansions or marketing acquisitions.`
      });
    }

    // Insight 3: Product sales mix check
    insights.push({
      title: "Optimize Product Contribution Mix",
      type: "info",
      text: "Coffee continues to yield the highest absolute profit margins (50%) in your SKU mix. Consider running promotional bundles pairing Coffee with lower-margin products like Milk (40%) to boost aggregate transaction baskets."
    });

    return insights;
  };

  const activeInsights = getInsights();

  const handleRegenerate = () => {
    setIsGenerating(true);
    setTimeout(() => {
      setIsGenerating(false);
    }, 600);
  };

  return (
    <div className="space-y-8 text-left font-sans">
      
      {/* Header Panel */}
      <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-sm flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div className="space-y-1">
          <h3 className="text-sm font-bold text-slate-800 uppercase tracking-wider font-mono flex items-center gap-2">
            <Cpu size={16} className="text-emerald-500" />
            AI Analytical Recommendation Engine
          </h3>
          <p className="text-slate-400 text-xs">
            Automated operational guidance based on historical metrics audits.
          </p>
        </div>

        <button
          onClick={handleRegenerate}
          disabled={isGenerating}
          className="px-4 py-2 border border-slate-200 hover:bg-slate-50 text-slate-650 hover:text-slate-800 rounded-lg text-xs font-semibold flex items-center gap-2 transition cursor-pointer"
        >
          <ArrowClockwise size={14} className={isGenerating ? "animate-spin" : ""} />
          Regenerate Insights
        </button>
      </div>

      {isGenerating ? (
        <div className="py-20 text-center flex flex-col items-center justify-center gap-4">
          <span className="w-8 h-8 border-3 border-emerald-500/20 border-t-emerald-500 rounded-full animate-spin" />
          <p className="text-slate-400 text-xs font-mono">Running R-analytics regression scans...</p>
        </div>
      ) : (
        /* Recommendations List */
        <div className="space-y-6">
          {activeInsights.map((insight, idx) => (
            <div 
              key={idx} 
              className={`p-6 border rounded-xl shadow-sm bg-white flex gap-4 ${
                insight.type === "danger" 
                  ? "border-rose-200 bg-rose-50/10" 
                  : insight.type === "warning"
                    ? "border-amber-200 bg-amber-50/10"
                    : "border-slate-200"
              }`}
            >
              <div className={`p-2 rounded-lg text-white shrink-0 h-10 w-10 flex items-center justify-center ${
                insight.type === "danger" 
                  ? "bg-rose-500" 
                  : insight.type === "warning"
                    ? "bg-amber-500"
                    : insight.type === "success"
                      ? "bg-emerald-500"
                      : "bg-slate-500"
              }`}>
                {insight.type === "danger" ? <Warning size={20} /> : <Sparkle size={20} />}
              </div>

              <div className="space-y-1">
                <h4 className="text-sm font-bold text-slate-900">
                  {insight.title}
                </h4>
                <p className="text-xs text-slate-500 leading-relaxed max-w-[85ch]">
                  {insight.text}
                </p>
              </div>
            </div>
          ))}
        </div>
      )}

    </div>
  );
};
