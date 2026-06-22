import React, { useState } from "react";
import { DownloadSimple, FilePdf, FileXls, FileCsv, CheckCircle } from "@phosphor-icons/react";

export const ReportGeneration: React.FC = () => {
  const [format, setFormat] = useState<"pdf" | "excel" | "csv">("pdf");
  const [includeSales, setIncludeSales] = useState(true);
  const [includeRevenue, setIncludeRevenue] = useState(true);
  const [includeExpenses, setIncludeExpenses] = useState(true);
  const [includeProfit, setIncludeProfit] = useState(true);
  const [isExporting, setIsExporting] = useState(false);
  const [successMsg, setSuccessMsg] = useState("");

  const handleExport = () => {
    setIsExporting(true);
    setSuccessMsg("");
    
    // Simulate generation delay
    setTimeout(() => {
      setIsExporting(false);
      const ext = format === "pdf" ? "pdf" : format === "excel" ? "xlsx" : "csv";
      setSuccessMsg(`Report exported successfully as foresight_business_intelligence.${ext}`);
    }, 1500);
  };

  return (
    <div className="space-y-8 text-left font-sans">
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Step 1: Select Scope */}
        <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-sm space-y-4">
          <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider font-mono">
            1. Select Report Scope
          </h4>
          <p className="text-slate-400 text-xs">
            Toggle features to include in the exported report document.
          </p>

          <div className="space-y-3 pt-2">
            <label className="flex items-center gap-3 text-xs font-semibold text-slate-700 cursor-pointer">
              <input
                type="checkbox"
                checked={includeSales}
                onChange={() => setIncludeSales(!includeSales)}
                className="w-4 h-4 text-emerald-600 border-slate-350 rounded focus:ring-emerald-500 accent-emerald-600"
              />
              Sales Forecast Model
            </label>
            <label className="flex items-center gap-3 text-xs font-semibold text-slate-700 cursor-pointer">
              <input
                type="checkbox"
                checked={includeRevenue}
                onChange={() => setIncludeRevenue(!includeRevenue)}
                className="w-4 h-4 text-emerald-600 border-slate-350 rounded focus:ring-emerald-500 accent-emerald-600"
              />
              Revenue Forecast Projections
            </label>
            <label className="flex items-center gap-3 text-xs font-semibold text-slate-700 cursor-pointer">
              <input
                type="checkbox"
                checked={includeExpenses}
                onChange={() => setIncludeExpenses(!includeExpenses)}
                className="w-4 h-4 text-emerald-600 border-slate-350 rounded focus:ring-emerald-500 accent-emerald-600"
              />
              Expense Forecast Calculations
            </label>
            <label className="flex items-center gap-3 text-xs font-semibold text-slate-700 cursor-pointer">
              <input
                type="checkbox"
                checked={includeProfit}
                onChange={() => setIncludeProfit(!includeProfit)}
                className="w-4 h-4 text-emerald-600 border-slate-350 rounded focus:ring-emerald-500 accent-emerald-600"
              />
              Net Profit Margin Analysis
            </label>
          </div>
        </div>

        {/* Step 2: Format selection */}
        <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-sm space-y-4">
          <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider font-mono">
            2. Choose Export Format
          </h4>
          <p className="text-slate-400 text-xs">
            Export formats for presentation slides or spreadsheet calculations.
          </p>

          <div className="grid grid-cols-3 gap-3 pt-2">
            <button
              onClick={() => setFormat("pdf")}
              className={`p-4 border rounded-xl flex flex-col items-center justify-center gap-2 transition cursor-pointer ${
                format === "pdf"
                  ? "border-emerald-500 bg-emerald-50/20 text-emerald-600"
                  : "border-slate-200 hover:border-slate-300 text-slate-500"
              }`}
            >
              <FilePdf size={24} />
              <span className="text-[10px] font-bold uppercase font-mono">PDF Report</span>
            </button>
            <button
              onClick={() => setFormat("excel")}
              className={`p-4 border rounded-xl flex flex-col items-center justify-center gap-2 transition cursor-pointer ${
                format === "excel"
                  ? "border-emerald-500 bg-emerald-50/20 text-emerald-600"
                  : "border-slate-200 hover:border-slate-300 text-slate-500"
              }`}
            >
              <FileXls size={24} />
              <span className="text-[10px] font-bold uppercase font-mono">Excel Sheet</span>
            </button>
            <button
              onClick={() => setFormat("csv")}
              className={`p-4 border rounded-xl flex flex-col items-center justify-center gap-2 transition cursor-pointer ${
                format === "csv"
                  ? "border-emerald-500 bg-emerald-50/20 text-emerald-600"
                  : "border-slate-200 hover:border-slate-300 text-slate-500"
              }`}
            >
              <FileCsv size={24} />
              <span className="text-[10px] font-bold uppercase font-mono">CSV File</span>
            </button>
          </div>
        </div>

        {/* Step 3: Trigger export */}
        <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-sm flex flex-col justify-between">
          <div className="space-y-2">
            <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider font-mono">
              3. Compile & Export
            </h4>
            <p className="text-slate-400 text-xs leading-relaxed">
              Downloads will initiate directly in the browser after R-script table generation compiles successfully.
            </p>
          </div>

          <div className="pt-6">
            <button
              onClick={handleExport}
              disabled={isExporting || (!includeSales && !includeRevenue && !includeExpenses && !includeProfit)}
              className="w-full py-2.5 bg-emerald-600 hover:bg-emerald-500 active:scale-98 text-white font-semibold rounded-lg text-xs transition disabled:opacity-50 flex items-center justify-center gap-2 cursor-pointer shadow-lg shadow-emerald-950/10"
            >
              {isExporting ? (
                <>
                  <span className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  Compiling Report...
                </>
              ) : (
                <>
                  <DownloadSimple size={16} weight="bold" />
                  Generate Download Package
                </>
              )}
            </button>
          </div>
        </div>

      </div>

      {successMsg && (
        <div className="bg-emerald-50 border border-emerald-200 text-emerald-800 p-4 rounded-xl flex gap-3 items-center text-xs font-semibold">
          <CheckCircle size={18} className="text-emerald-500 shrink-0" />
          <span>{successMsg}</span>
        </div>
      )}

    </div>
  );
};
