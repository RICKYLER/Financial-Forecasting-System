import React from "react";
import { ArrowRight, ChartLineUp, Database, Brain, Sparkle, ShieldCheck, PresentationChart } from "@phosphor-icons/react";

interface LandingPageProps {
  onLoginClick: () => void;
}

export const LandingPage: React.FC<LandingPageProps> = ({ onLoginClick }) => {
  return (
    <div className="min-h-screen bg-slate-900 text-slate-100 flex flex-col font-sans">
      {/* Premium Header */}
      <header className="border-b border-slate-800 bg-slate-950/80 backdrop-blur-md sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="bg-emerald-600 p-2 rounded-lg text-white">
              <PresentationChart size={24} weight="bold" />
            </div>
            <span className="font-bold text-lg tracking-tight text-white font-sans">
              ForeSight <span className="text-emerald-500 font-normal text-sm ml-1 px-1.5 py-0.5 bg-emerald-950 rounded border border-emerald-800/40">R-Engine</span>
            </span>
          </div>
          
          <button 
            onClick={onLoginClick}
            className="px-4 py-2 text-sm font-semibold text-white bg-emerald-600 hover:bg-emerald-500 active:scale-98 transition duration-150 rounded-lg shadow-md shadow-emerald-900/20"
          >
            Access Platform
          </button>
        </div>
      </header>

      {/* Hero Section */}
      <main className="flex-1">
        <section className="relative py-20 lg:py-28 overflow-hidden bg-gradient-to-b from-slate-950 to-slate-900">
          <div className="max-w-7xl mx-auto px-6 grid lg:grid-cols-12 gap-12 items-center">
            
            {/* Left side text copy */}
            <div className="lg:col-span-7 flex flex-col items-start text-left">
              <div className="inline-flex items-center gap-2 px-3 py-1 text-xs font-mono text-emerald-400 bg-emerald-950/50 rounded-full border border-emerald-800/30 mb-6">
                <Sparkle size={14} className="animate-pulse" />
                Advanced Business Intelligence & Forecasting
              </div>
              
              <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold tracking-tight text-white leading-none mb-6">
                Predict your business performance with <span className="text-emerald-500">precision</span>
              </h1>
              
              <p className="text-base md:text-lg text-slate-400 leading-relaxed max-w-[55ch] mb-8">
                Empower your business with auto-fitting ARIMA and Prophet forecasting engines running in R. Uncover future sales margins, project revenues, and model expense patterns effortlessly.
              </p>
              
              <div className="flex flex-col sm:flex-row gap-4 w-full sm:w-auto">
                <button
                  onClick={onLoginClick}
                  className="inline-flex items-center justify-center gap-2 px-6 py-3 text-sm font-semibold text-white bg-emerald-600 hover:bg-emerald-500 active:scale-98 transition duration-150 rounded-lg shadow-lg shadow-emerald-950/40 cursor-pointer"
                >
                  Start Forecasting <ArrowRight size={16} weight="bold" />
                </button>
                <a 
                  href="#features"
                  className="inline-flex items-center justify-center gap-2 px-6 py-3 text-sm font-semibold text-slate-300 hover:text-white border border-slate-700 hover:border-slate-500 rounded-lg transition duration-150"
                >
                  Explore Capabilities
                </a>
              </div>
            </div>

            {/* Right side mock graphic dashboard card */}
            <div className="lg:col-span-5 relative">
              <div className="relative bg-slate-950 rounded-xl border border-slate-800 p-6 shadow-2xl overflow-hidden group">
                <div className="absolute inset-0 bg-gradient-to-tr from-emerald-950/10 via-transparent to-transparent pointer-events-none" />
                
                {/* Header Mock */}
                <div className="flex items-center justify-between border-b border-slate-850 pb-4 mb-4">
                  <div className="flex items-center gap-2">
                    <div className="w-2.5 h-2.5 rounded-full bg-rose-500" />
                    <div className="w-2.5 h-2.5 rounded-full bg-amber-500" />
                    <div className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
                  </div>
                  <span className="text-xs font-mono text-slate-500">model_forecast.R</span>
                </div>

                {/* Body Mock values */}
                <div className="space-y-4 font-mono text-xs text-slate-400">
                  <div className="flex justify-between">
                    <span className="text-slate-500">&gt; arima_fit &lt;- auto.arima(sales_ts)</span>
                    <span className="text-emerald-500">OK</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">&gt; forecast(arima_fit, h = 12)</span>
                    <span className="text-emerald-500">Calculated</span>
                  </div>
                  
                  <div className="bg-slate-900/80 rounded-lg border border-slate-800 p-4 space-y-2 mt-4">
                    <div className="flex justify-between text-slate-500 border-b border-slate-800 pb-1.5 mb-1.5">
                      <span>Period</span>
                      <span>Arima (₱)</span>
                      <span>Prophet (₱)</span>
                    </div>
                    <div className="flex justify-between text-white font-semibold">
                      <span>Jan 2027</span>
                      <span>210,000</span>
                      <span>214,500</span>
                    </div>
                    <div className="flex justify-between text-slate-300">
                      <span>Feb 2027</span>
                      <span>225,000</span>
                      <span>228,100</span>
                    </div>
                    <div className="flex justify-between text-slate-400">
                      <span>Mar 2027</span>
                      <span>240,000</span>
                      <span>245,600</span>
                    </div>
                  </div>

                  <div className="flex justify-between text-slate-500 mt-2 text-[10px]">
                    <span>AICc: 245.2</span>
                    <span>MAPE: 3.12%</span>
                    <span>R²: 0.965</span>
                  </div>
                </div>
              </div>
            </div>

          </div>
        </section>

        {/* Capabilities Grid */}
        <section id="features" className="py-20 bg-slate-950 border-t border-slate-900">
          <div className="max-w-7xl mx-auto px-6 text-center">
            <h2 className="text-2xl md:text-3xl font-bold tracking-tight text-white mb-2">
              Engineered for data-driven decisions
            </h2>
            <p className="text-slate-400 max-w-[60ch] mx-auto mb-12 text-sm md:text-base">
              Say goodbye to guesswork. Leverage standard econometric packages to project core business components.
            </p>
            
            <div className="grid md:grid-cols-3 gap-8 text-left">
              
              {/* Feature 1 */}
              <div className="bg-slate-900 border border-slate-800 p-6 rounded-xl hover:border-slate-700 transition duration-150">
                <div className="w-10 h-10 rounded-lg bg-emerald-950/80 border border-emerald-800/40 text-emerald-400 flex items-center justify-center mb-4">
                  <ChartLineUp size={20} weight="bold" />
                </div>
                <h3 className="text-lg font-semibold text-white mb-2">Time-Series Forecasts</h3>
                <p className="text-slate-400 text-sm leading-relaxed">
                  Generate sales and revenue forecasts for the next 12 months using R-fitted ARIMA and Facebook Prophet models.
                </p>
              </div>

              {/* Feature 2 */}
              <div className="bg-slate-900 border border-slate-800 p-6 rounded-xl hover:border-slate-700 transition duration-150">
                <div className="w-10 h-10 rounded-lg bg-emerald-950/80 border border-emerald-800/40 text-emerald-400 flex items-center justify-center mb-4">
                  <Database size={20} weight="bold" />
                </div>
                <h3 className="text-lg font-semibold text-white mb-2">Clean CSV Upload</h3>
                <p className="text-slate-400 text-sm leading-relaxed">
                  Import sales sheets instantly. The validation engine flags missing variables, duplicate records, and cleans entries automatically.
                </p>
              </div>

              {/* Feature 3 */}
              <div className="bg-slate-900 border border-slate-800 p-6 rounded-xl hover:border-slate-700 transition duration-150">
                <div className="w-10 h-10 rounded-lg bg-emerald-950/80 border border-emerald-800/40 text-emerald-400 flex items-center justify-center mb-4">
                  <Brain size={20} weight="bold" />
                </div>
                <h3 className="text-lg font-semibold text-white mb-2">AI-Driven Insights</h3>
                <p className="text-slate-400 text-sm leading-relaxed">
                  Get automated narrative reports summarizing gross margin expansion, break-even targets, and product mix performance.
                </p>
              </div>

            </div>
          </div>
        </section>

        {/* Security & Validation trust row */}
        <section className="py-12 bg-slate-900/60 border-t border-slate-850">
          <div className="max-w-7xl mx-auto px-6 flex flex-wrap justify-center items-center gap-10 md:gap-16 text-slate-500 font-semibold text-sm">
            <div className="flex items-center gap-2">
              <ShieldCheck size={18} className="text-emerald-500" />
              <span>Secure JWT Session Gate</span>
            </div>
            <div className="flex items-center gap-2">
              <Database size={18} className="text-emerald-500" />
              <span>Neon PostgreSQL Store</span>
            </div>
            <div className="flex items-center gap-2">
              <Sparkle size={18} className="text-emerald-500" />
              <span>R Script Integration Engine</span>
            </div>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="border-t border-slate-850 bg-slate-950 py-8 text-center text-slate-500 text-xs">
        <div className="max-w-7xl mx-auto px-6">
          &copy; 2026 ForeSight Analytics Corp. All rights reserved. R Forecasting, Prophet, and ARIMA model libraries licensed open-source.
        </div>
      </footer>
    </div>
  );
};
