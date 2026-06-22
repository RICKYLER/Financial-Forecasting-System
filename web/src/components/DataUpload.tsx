import React, { useState, useRef } from "react";
import type { SalesRecord } from "../types";
import { UploadSimple, FileCsv, CheckCircle, Trash } from "@phosphor-icons/react";


interface DataUploadProps {
  historicalData: SalesRecord[];
  onDataUpdate: (newData: SalesRecord[]) => void;
}

interface ValidationReport {
  missingCount: number;
  duplicateCount: number;
  cleanedRows: SalesRecord[];
  errors: string[];
}

export const DataUpload: React.FC<DataUploadProps> = ({ historicalData, onDataUpdate }) => {
  const [dragActive, setDragActive] = useState(false);
  const [parsedData, setParsedData] = useState<SalesRecord[]>([]);
  const [report, setReport] = useState<ValidationReport | null>(null);
  const [successMsg, setSuccessMsg] = useState("");
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      processFile(e.dataTransfer.files[0]);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      processFile(e.target.files[0]);
    }
  };

  const processFile = (file: File) => {
    setSuccessMsg("");
    setReport(null);
    setParsedData([]);

    const reader = new FileReader();
    reader.onload = (event) => {
      const text = event.target?.result as string;
      parseCSV(text);
    };
    reader.readAsText(file);
  };

  const parseCSV = (text: string) => {
    const lines = text.split("\n").map(line => line.trim()).filter(line => line.length > 0);
    if (lines.length < 2) {
      setReport({
        missingCount: 0,
        duplicateCount: 0,
        cleanedRows: [],
        errors: ["CSV file is empty or missing data rows."]
      });
      return;
    }

    const headers = lines[0].split(",").map(h => h.trim().toLowerCase());
    
    // Validate headers
    const dateIdx = headers.indexOf("date");
    const salesIdx = headers.indexOf("sales");
    const revenueIdx = headers.indexOf("revenue");
    const expensesIdx = headers.indexOf("expenses");

    if (dateIdx === -1 || salesIdx === -1 || revenueIdx === -1 || expensesIdx === -1) {
      setReport({
        missingCount: 0,
        duplicateCount: 0,
        cleanedRows: [],
        errors: ["Invalid headers. CSV must contain 'Date', 'Sales', 'Revenue', and 'Expenses' columns."]
      });
      return;
    }

    const errors: string[] = [];
    let missingCount = 0;
    let duplicateCount = 0;
    const cleanedRows: SalesRecord[] = [];
    const seenDates = new Set<string>();

    // Historical dates set to check duplicates against existing database
    const existingDates = new Set(historicalData.map(r => r.date));

    for (let i = 1; i < lines.length; i++) {
      const cols = lines[i].split(",").map(c => c.trim());
      
      const dateVal = cols[dateIdx];
      const salesVal = cols[salesIdx];
      const revenueVal = cols[revenueIdx];
      const expensesVal = cols[expensesIdx];

      // Missing validation
      if (!dateVal || !salesVal || !revenueVal || !expensesVal) {
        missingCount++;
        continue;
      }

      // Numeric validations
      const sales = parseInt(salesVal);
      const revenue = parseFloat(revenueVal);
      const expenses = parseFloat(expensesVal);

      if (isNaN(sales) || isNaN(revenue) || isNaN(expenses)) {
        errors.push(`Row ${i + 1}: Numeric parameters could not be parsed.`);
        continue;
      }

      // Duplicate validations
      if (seenDates.has(dateVal) || existingDates.has(dateVal)) {
        duplicateCount++;
        // We will skip this to clean duplicates, keeping the first or overwriting
        continue;
      }

      seenDates.add(dateVal);
      cleanedRows.push({
        date: dateVal,
        sales,
        revenue,
        expenses,
        profit: revenue - expenses
      });
    }

    setParsedData(cleanedRows);
    setReport({
      missingCount,
      duplicateCount,
      cleanedRows,
      errors
    });
  };

  const handleIntegrate = () => {
    if (parsedData.length === 0) return;

    // Merge uploaded rows with historical data, sorted by date
    const merged = [...historicalData, ...parsedData].sort((a, b) => 
      a.date.localeCompare(b.date)
    );

    onDataUpdate(merged);
    setSuccessMsg(`Successfully integrated ${parsedData.length} records into the forecasting system!`);
    setParsedData([]);
    setReport(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const handleClear = () => {
    setParsedData([]);
    setReport(null);
    setSuccessMsg("");
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  return (
    <div className="space-y-8 text-left">
      
      <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-sm">
        <h3 className="text-sm font-bold text-slate-800 uppercase tracking-wider font-mono mb-4">
          Import Historical Datasets
        </h3>

        {/* Drag & Drop Area */}
        <div 
          onDragEnter={handleDrag}
          onDragOver={handleDrag}
          onDragLeave={handleDrag}
          onDrop={handleDrop}
          onClick={() => fileInputRef.current?.click()}
          className={`border-2 border-dashed rounded-xl p-10 text-center cursor-pointer transition ${
            dragActive 
              ? "border-emerald-500 bg-emerald-50/20" 
              : "border-slate-300 hover:border-slate-400 bg-slate-50/50"
          }`}
        >
          <input 
            type="file"
            ref={fileInputRef}
            onChange={handleFileChange}
            accept=".csv"
            className="hidden"
          />
          <div className="flex flex-col items-center gap-3">
            <div className="p-3 bg-white rounded-full border border-slate-200 shadow-sm text-slate-400 group-hover:text-slate-600">
              <UploadSimple size={24} />
            </div>
            <div>
              <p className="text-sm font-semibold text-slate-800">
                Click to upload or drag & drop CSV file
              </p>
              <p className="text-xs text-slate-400 mt-1">
                CSV headers must exactly map to: <code className="font-mono text-emerald-600 bg-emerald-50 px-1 py-0.5 rounded font-semibold text-[11px]">Date,Sales,Revenue,Expenses</code>
              </p>
            </div>
          </div>
        </div>

        {/* Demo Template info */}
        <div className="mt-4 p-3 bg-slate-50 border border-slate-200 rounded-lg flex items-start gap-2.5 text-xs text-slate-500">
          <FileCsv size={16} className="text-slate-400 shrink-0 mt-0.5" />
          <div>
            <p className="font-semibold text-slate-700">Sample Row Format:</p>
            <p className="font-mono mt-0.5 text-slate-500">2026-01,120,60000,35000</p>
          </div>
        </div>
      </div>

      {successMsg && (
        <div className="bg-emerald-50 border border-emerald-200 text-emerald-800 p-4 rounded-xl flex gap-3 items-center text-xs font-semibold">
          <CheckCircle size={18} className="text-emerald-500 shrink-0" />
          <span>{successMsg}</span>
        </div>
      )}

      {/* Validation Report details */}
      {report && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          
          {/* Validation Metrics */}
          <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-sm space-y-4">
            <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider font-mono">
              Validation Engine Audit
            </h4>

            <div className="space-y-3">
              <div className="flex justify-between items-center text-xs">
                <span className="text-slate-400">Total Valid Rows:</span>
                <span className="font-semibold text-slate-800">{parsedData.length}</span>
              </div>
              <div className="flex justify-between items-center text-xs">
                <span className="text-slate-400">Duplicate Rows Excluded:</span>
                <span className={`font-semibold ${report.duplicateCount > 0 ? "text-amber-600" : "text-slate-800"}`}>
                  {report.duplicateCount}
                </span>
              </div>
              <div className="flex justify-between items-center text-xs">
                <span className="text-slate-400">Missing Parameters Cleaned:</span>
                <span className={`font-semibold ${report.missingCount > 0 ? "text-amber-600" : "text-slate-800"}`}>
                  {report.missingCount}
                </span>
              </div>
            </div>

            {report.errors.length > 0 && (
              <div className="p-3 bg-rose-50 border border-rose-150 rounded-lg space-y-1">
                <p className="text-[11px] font-bold text-rose-800">Syntax Errors Found:</p>
                <ul className="text-[10px] text-rose-600 list-disc list-inside max-h-20 overflow-y-auto">
                  {report.errors.map((err, i) => (
                    <li key={i}>{err}</li>
                  ))}
                </ul>
              </div>
            )}

            <div className="flex gap-3 pt-2">
              <button
                onClick={handleIntegrate}
                disabled={parsedData.length === 0}
                className="flex-1 py-2 bg-emerald-600 hover:bg-emerald-500 active:scale-98 text-white font-semibold rounded-lg text-xs transition disabled:opacity-50 cursor-pointer text-center"
              >
                Integrate into System
              </button>
              <button
                onClick={handleClear}
                className="p-2 border border-slate-200 hover:bg-slate-50 rounded-lg text-slate-500 transition cursor-pointer"
              >
                <Trash size={16} />
              </button>
            </div>
          </div>

          {/* Parsed Data Preview Table */}
          <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-sm lg:col-span-2">
            <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider font-mono mb-4">
              CSV Parser Table Preview
            </h4>

            {parsedData.length === 0 ? (
              <div className="text-slate-400 text-xs py-8 text-center">
                No valid rows to display. Check formatting requirements.
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-xs text-left">
                  <thead>
                    <tr className="border-b border-slate-100 text-slate-400 font-mono text-[10px] uppercase pb-2">
                      <th className="pb-2 font-semibold">Date</th>
                      <th className="pb-2 font-semibold text-right">Sales</th>
                      <th className="pb-2 font-semibold text-right">Revenue</th>
                      <th className="pb-2 font-semibold text-right">Expenses</th>
                      <th className="pb-2 font-semibold text-right">Net Profit</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {parsedData.map((row, i) => (
                      <tr key={i} className="text-slate-600 hover:bg-slate-50/50">
                        <td className="py-2.5 font-mono">{row.date}</td>
                        <td className="py-2.5 text-right">{row.sales}</td>
                        <td className="py-2.5 text-right">₱{row.revenue.toLocaleString()}</td>
                        <td className="py-2.5 text-right">₱{row.expenses.toLocaleString()}</td>
                        <td className="py-2.5 text-right font-semibold text-emerald-600">
                          ₱{row.profit.toLocaleString()}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>

        </div>
      )}

    </div>
  );
};
