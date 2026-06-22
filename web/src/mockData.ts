import type { SalesRecord, ProductRecord, User } from "./types";

export const mockUsers: User[] = [
  { id: "1", fullname: "Admin User", email: "admin@forecast.com", role: "Admin" },
  { id: "2", fullname: "Sophia Rodriguez", email: "sophia@business.com", role: "Business Owner" },
  { id: "3", fullname: "David Chen", email: "david@analyst.com", role: "Financial Analyst" }
];

export const initialHistoricalData: SalesRecord[] = [
  { date: "2024-01", sales: 80, revenue: 40000, expenses: 28000, profit: 12000 },
  { date: "2024-02", sales: 85, revenue: 42500, expenses: 29000, profit: 13500 },
  { date: "2024-03", sales: 90, revenue: 45000, expenses: 30000, profit: 15000 },
  { date: "2024-04", sales: 95, revenue: 47500, expenses: 31200, profit: 16300 },
  { date: "2024-05", sales: 105, revenue: 52500, expenses: 33000, profit: 19500 },
  { date: "2024-06", sales: 110, revenue: 55000, expenses: 34100, profit: 20900 },
  { date: "2024-07", sales: 100, revenue: 50000, expenses: 32500, profit: 17500 },
  { date: "2024-08", sales: 98, revenue: 49000, expenses: 32000, profit: 17000 },
  { date: "2024-09", sales: 108, revenue: 54000, expenses: 34000, profit: 20000 },
  { date: "2024-10", sales: 115, revenue: 57500, expenses: 35500, profit: 22000 },
  { date: "2024-11", sales: 120, revenue: 60000, expenses: 36800, profit: 23200 },
  { date: "2024-12", sales: 135, revenue: 67500, expenses: 40000, profit: 27500 },
  { date: "2025-01", sales: 100, revenue: 50000, expenses: 33000, profit: 17000 },
  { date: "2025-02", sales: 110, revenue: 55000, expenses: 35000, profit: 20000 },
  { date: "2025-03", sales: 115, revenue: 57500, expenses: 36200, profit: 21300 },
  { date: "2025-04", sales: 125, revenue: 62500, expenses: 38000, profit: 24500 },
  { date: "2025-05", sales: 140, revenue: 70000, expenses: 41200, profit: 28800 },
  { date: "2025-06", sales: 145, revenue: 72500, expenses: 42000, profit: 30500 },
  { date: "2025-07", sales: 130, revenue: 65000, expenses: 39500, profit: 25500 },
  { date: "2025-08", sales: 128, revenue: 64000, expenses: 39000, profit: 25000 },
  { date: "2025-09", sales: 138, revenue: 69000, expenses: 41000, profit: 28000 },
  { date: "2025-10", sales: 148, revenue: 74000, expenses: 43200, profit: 30800 },
  { date: "2025-11", sales: 155, revenue: 77500, expenses: 45000, profit: 32500 },
  { date: "2025-12", sales: 175, revenue: 87500, expenses: 49500, profit: 38000 }
];

export const mockProducts: ProductRecord[] = [
  { name: "Coffee", qtySold: 1250, revenue: 187500, profit: 93750 },
  { name: "Milk", qtySold: 850, revenue: 85000, profit: 34000 },
  { name: "Rice", qtySold: 1800, revenue: 216000, profit: 64800 }
];

// Helper to simulate forecast based on historical data using exponential growth + seasonality + noise
export function simulateForecast(
  history: SalesRecord[],
  key: "sales" | "revenue" | "expenses",
  monthsCount: number = 12,
  modelType: "arima" | "prophet" = "arima"
) {
  const lastRecord = history[history.length - 1];
  
  // Calculate average monthly growth rate in last 12 months
  const lastYear = history.slice(-12);
  const growthRate = (lastYear[lastYear.length - 1][key] - lastYear[0][key]) / lastYear[0][key] / 12;
  
  // Base value to project from
  let baseValue = lastRecord[key];
  
  // Parse last date
  const [yearStr, monthStr] = lastRecord.date.split("-");
  let curYear = parseInt(yearStr);
  let curMonth = parseInt(monthStr);
  
  const predictions = [];
  
  for (let i = 1; i <= monthsCount; i++) {
    curMonth++;
    if (curMonth > 12) {
      curMonth = 1;
      curYear++;
    }
    const dateLabel = `${curYear}-${String(curMonth).padStart(2, "0")}`;
    
    // Add trend
    const trendFactor = 1 + (growthRate * i);
    
    // Add seasonal factor (e.g. December spike, July dip)
    let seasonalFactor = 1.0;
    if (curMonth === 12) seasonalFactor = 1.15; // Dec bump
    else if (curMonth === 5 || curMonth === 6) seasonalFactor = 1.05; // Mid-year bump
    else if (curMonth === 7 || curMonth === 8) seasonalFactor = 0.93; // Late summer dip
    
    // Introduce model variance
    let modelVariation = 1.0;
    if (modelType === "prophet") {
      // Prophet is typically smoother with slightly more weight on weekly/yearly cycles
      modelVariation = 1.0 + 0.02 * Math.sin(i / 1.5);
    } else {
      // ARIMA is slightly more reactive to local shocks
      modelVariation = 1.0 + 0.03 * Math.cos(i / 2);
    }
    
    const predictedVal = Math.round(baseValue * trendFactor * seasonalFactor * modelVariation);
    
    // Confidence bounds
    const uncertainty = 0.05 + (0.015 * i); // Grows wider over time
    const lower = Math.round(predictedVal * (1 - uncertainty));
    const upper = Math.round(predictedVal * (1 + uncertainty));
    
    predictions.push({
      date: dateLabel,
      predicted: predictedVal,
      lower_95: lower,
      upper_95: upper
    });
  }
  
  return predictions;
}

export interface ProfitForecastResult {
  date: string;
  predicted_revenue: number;
  predicted_expenses: number;
  predicted_profit: number;
  predicted_margin: number;
}

export function simulateProfitForecast(
  history: SalesRecord[],
  monthsCount: number = 12
): ProfitForecastResult[] {
  const revForecast = simulateForecast(history, "revenue", monthsCount, "arima");
  const expForecast = simulateForecast(history, "expenses", monthsCount, "arima");
  
  return revForecast.map((rf, idx) => {
    const ef = expForecast[idx];
    const profit = rf.predicted - ef.predicted;
    const margin = rf.predicted > 0 ? (profit / rf.predicted) * 100 : 0;
    
    return {
      date: rf.date,
      predicted_revenue: rf.predicted,
      predicted_expenses: ef.predicted,
      predicted_profit: profit,
      predicted_margin: parseFloat(margin.toFixed(2))
    };
  });
}
