export type UserRole = "Admin" | "Business Owner" | "Financial Analyst";

export interface User {
  id: string;
  fullname: string;
  email: string;
  role: UserRole;
}

export interface SalesRecord {
  date: string; // YYYY-MM
  sales: number;
  revenue: number;
  expenses: number;
  profit: number;
}

export interface ForecastPoint {
  date: string; // YYYY-MM
  predicted: number;
  lower_95: number;
  upper_95: number;
}

export interface ProfitForecastPoint {
  date: string;
  predicted_revenue: number;
  predicted_expenses: number;
  predicted_profit: number;
  predicted_margin: number;
}

export interface ProductRecord {
  name: string;
  qtySold: number;
  revenue: number;
  profit: number;
}

export type ActiveTab =
  | "dashboard"
  | "upload"
  | "sales-forecast"
  | "revenue-forecast"
  | "expense-forecast"
  | "profit-analysis"
  | "break-even"
  | "product-analytics"
  | "bi"
  | "ai-insights"
  | "reports"
  | "settings";
