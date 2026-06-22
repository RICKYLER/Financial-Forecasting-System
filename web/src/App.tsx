import { useState } from "react";
import type { User, ActiveTab, SalesRecord } from "./types";
import { initialHistoricalData } from "./mockData";
import { LandingPage } from "./components/LandingPage";
import { LoginPage } from "./components/LoginPage";
import { SidebarLayout } from "./components/SidebarLayout";
import { Dashboard } from "./components/Dashboard";
import { DataUpload } from "./components/DataUpload";
import { SalesForecasting } from "./components/SalesForecasting";
import { RevenueForecasting } from "./components/RevenueForecasting";
import { ExpenseForecasting } from "./components/ExpenseForecasting";
import { ProfitAnalysis } from "./components/ProfitAnalysis";
import { BreakEvenAnalysis } from "./components/BreakEvenAnalysis";
import { ProductAnalytics } from "./components/ProductAnalytics";
import { BusinessIntelligence } from "./components/BusinessIntelligence";
import { AIRecommendations } from "./components/AIRecommendations";
import { ReportGeneration } from "./components/ReportGeneration";
import { SettingsPage } from "./components/SettingsPage";
import "./App.css";

function App() {
  const [user, setUser] = useState<User | null>(null);
  const [pageMode, setPageMode] = useState<"landing" | "login" | "app">("landing");
  const [activeTab, setActiveTab] = useState<ActiveTab>("dashboard");
  const [historicalData, setHistoricalData] = useState<SalesRecord[]>(initialHistoricalData);

  const handleLoginSuccess = (authenticatedUser: User) => {
    setUser(authenticatedUser);
    // Reset defaults based on role accessibility
    if (authenticatedUser.role === "Admin") {
      setActiveTab("dashboard");
    } else {
      setActiveTab("dashboard");
    }
    setPageMode("app");
  };

  const handleLogout = () => {
    setUser(null);
    setPageMode("landing");
  };

  // Main Page Controller Router
  if (pageMode === "landing") {
    return <LandingPage onLoginClick={() => setPageMode("login")} />;
  }

  if (pageMode === "login") {
    return (
      <LoginPage
        onLoginSuccess={handleLoginSuccess}
        onBackToLanding={() => setPageMode("landing")}
      />
    );
  }

  if (pageMode === "app" && user) {
    return (
      <SidebarLayout
        user={user}
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        onLogout={handleLogout}
      >
        {activeTab === "dashboard" && (
          <Dashboard historicalData={historicalData} />
        )}
        {activeTab === "upload" && (
          <DataUpload
            historicalData={historicalData}
            onDataUpdate={setHistoricalData}
          />
        )}
        {activeTab === "sales-forecast" && (
          <SalesForecasting historicalData={historicalData} />
        )}
        {activeTab === "revenue-forecast" && (
          <RevenueForecasting historicalData={historicalData} />
        )}
        {activeTab === "expense-forecast" && (
          <ExpenseForecasting historicalData={historicalData} />
        )}
        {activeTab === "profit-analysis" && (
          <ProfitAnalysis historicalData={historicalData} />
        )}
        {activeTab === "break-even" && (
          <BreakEvenAnalysis />
        )}
        {activeTab === "product-analytics" && (
          <ProductAnalytics />
        )}
        {activeTab === "bi" && (
          <BusinessIntelligence historicalData={historicalData} />
        )}
        {activeTab === "ai-insights" && (
          <AIRecommendations historicalData={historicalData} />
        )}
        {activeTab === "reports" && (
          <ReportGeneration />
        )}
        {activeTab === "settings" && (
          <SettingsPage user={user} onUserUpdate={setUser} />
        )}
      </SidebarLayout>
    );
  }

  return null;
}

export default App;
