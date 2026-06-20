'use client';

import Link from 'next/link';
import { ArrowRight, Brain, Activity, Shield, Sparkles } from 'lucide-react';

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 font-sans selection:bg-blue-500/30">
      {/* Navigation */}
      <nav className="fixed top-0 w-full bg-white/80 backdrop-blur-md border-b border-slate-200 z-50 transition-all duration-300">
        <div className="max-w-7xl mx-auto px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-blue-600 to-indigo-600 flex items-center justify-center shadow-md">
              <Brain className="text-white w-5 h-5" />
            </div>
            <span className="font-extrabold text-lg tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-blue-700 to-indigo-700">
              Cortex Intel
            </span>
          </div>
          <div className="hidden md:flex items-center gap-8 font-medium text-sm text-slate-500">
            <a href="#features" className="hover:text-blue-600 transition-colors">Features</a>
            <a href="#how-it-works" className="hover:text-blue-600 transition-colors">How it works</a>
          </div>
          <div>
            <Link 
              href="/dashboard"
              className="inline-flex items-center justify-center gap-2 px-5 py-2 text-sm font-bold text-white bg-blue-600 rounded-full hover:bg-blue-700 shadow-md hover:shadow-lg transition-all duration-300 transform hover:-translate-y-0.5"
            >
              Enter Dashboard <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <main className="pt-32 pb-20 lg:pt-48 lg:pb-32 px-6 lg:px-8 max-w-7xl mx-auto relative overflow-hidden">
        {/* Background Gradients */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-[600px] opacity-30 pointer-events-none">
          <div className="absolute top-20 left-1/4 w-96 h-96 bg-blue-400 rounded-full mix-blend-multiply filter blur-[128px] animate-blob"></div>
          <div className="absolute top-40 right-1/4 w-96 h-96 bg-indigo-400 rounded-full mix-blend-multiply filter blur-[128px] animate-blob animation-delay-2000"></div>
          <div className="absolute -bottom-20 left-1/2 -translate-x-1/2 w-96 h-96 bg-emerald-400 rounded-full mix-blend-multiply filter blur-[128px] animate-blob animation-delay-4000"></div>
        </div>

        <div className="text-center relative z-10 max-w-3xl mx-auto">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-50 border border-blue-100 text-blue-600 text-xs font-bold mb-8 shadow-sm">
            <Sparkles className="w-3.5 h-3.5" /> 100% Free Open Data & Models
          </div>
          <h1 className="text-5xl lg:text-7xl font-extrabold tracking-tight text-slate-900 mb-8 leading-[1.1]">
            Next-Gen <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-indigo-600">Healthcare</span> Intelligence
          </h1>
          <p className="text-lg lg:text-xl text-slate-500 mb-10 leading-relaxed font-medium">
            A pristine, powerful analytics platform for real-time FDA recalls, global health indicators, and predictive patient risk. Build the future of care.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link 
              href="/dashboard"
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-8 py-4 text-base font-bold text-white bg-slate-900 rounded-xl hover:bg-slate-800 shadow-xl hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-1"
            >
              Launch Dashboard <ArrowRight className="w-5 h-5" />
            </Link>
          </div>
        </div>
      </main>

      {/* Features Grid */}
      <section id="features" className="py-24 bg-white relative z-10">
        <div className="max-w-7xl mx-auto px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-extrabold text-slate-900 mb-4">Unprecedented Analytics Engine</h2>
            <p className="text-slate-500 font-medium max-w-2xl mx-auto">Harness the power of machine learning and open data for seamless decision making.</p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* Card 1 */}
            <div className="glass-card group relative p-8 bg-slate-50/50 rounded-2xl border border-slate-100 overflow-hidden transition-all duration-500 hover:-translate-y-2 hover:shadow-[0_20px_40px_-15px_rgba(0,0,0,0.1)]">
              <div className="absolute inset-0 bg-gradient-to-br from-blue-500/5 to-indigo-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
              <div className="relative z-10">
                <div className="w-12 h-12 rounded-xl bg-blue-100 text-blue-600 flex items-center justify-center mb-6 shadow-sm group-hover:scale-110 transition-transform duration-500">
                  <Activity className="w-6 h-6" />
                </div>
                <h3 className="text-xl font-bold text-slate-900 mb-3 group-hover:text-blue-600 transition-colors">Real-Time FDA Recalls</h3>
                <p className="text-slate-500 text-sm leading-relaxed font-medium">Track and analyze medical device and drug recalls live with direct integration to openFDA APIs.</p>
              </div>
            </div>

            {/* Card 2 */}
            <div className="glass-card group relative p-8 bg-slate-50/50 rounded-2xl border border-slate-100 overflow-hidden transition-all duration-500 hover:-translate-y-2 hover:shadow-[0_20px_40px_-15px_rgba(0,0,0,0.1)]">
              <div className="absolute inset-0 bg-gradient-to-br from-emerald-500/5 to-teal-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
              <div className="relative z-10">
                <div className="w-12 h-12 rounded-xl bg-emerald-100 text-emerald-600 flex items-center justify-center mb-6 shadow-sm group-hover:scale-110 transition-transform duration-500">
                  <Brain className="w-6 h-6" />
                </div>
                <h3 className="text-xl font-bold text-slate-900 mb-3 group-hover:text-emerald-600 transition-colors">Cortex Copilot AI</h3>
                <p className="text-slate-500 text-sm leading-relaxed font-medium">Interact with your healthcare data naturally using your Gemini API key. Instant analytical insights.</p>
              </div>
            </div>

            {/* Card 3 */}
            <div className="glass-card group relative p-8 bg-slate-50/50 rounded-2xl border border-slate-100 overflow-hidden transition-all duration-500 hover:-translate-y-2 hover:shadow-[0_20px_40px_-15px_rgba(0,0,0,0.1)]">
              <div className="absolute inset-0 bg-gradient-to-br from-indigo-500/5 to-purple-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
              <div className="relative z-10">
                <div className="w-12 h-12 rounded-xl bg-indigo-100 text-indigo-600 flex items-center justify-center mb-6 shadow-sm group-hover:scale-110 transition-transform duration-500">
                  <Shield className="w-6 h-6" />
                </div>
                <h3 className="text-xl font-bold text-slate-900 mb-3 group-hover:text-indigo-600 transition-colors">Patient Risk Estimator</h3>
                <p className="text-slate-500 text-sm leading-relaxed font-medium">Deploy offline scikit-learn models to instantly assess clinical input for Heart Disease and Diabetes risks.</p>
              </div>
            </div>
          </div>
        </div>
      </section>
      
      {/* Footer */}
      <footer className="border-t border-slate-200 bg-slate-50 py-12">
        <div className="max-w-7xl mx-auto px-6 lg:px-8 flex flex-col md:flex-row items-center justify-between">
          <div className="flex items-center gap-2 mb-4 md:mb-0">
            <Brain className="text-blue-600 w-5 h-5" />
            <span className="font-extrabold text-sm text-slate-900 tracking-tight">Cortex Intel</span>
          </div>
          <p className="text-xs text-slate-400 font-medium">© 2026 Cortex Intelligence Platform. 100% Free & Open Source.</p>
        </div>
      </footer>
    </div>
  );
}
