'use client';

import { motion, useScroll, useTransform } from 'framer-motion';
import Link from 'next/link';
import { 
  ArrowRight, 
  Brain, 
  Activity, 
  Shield, 
  Database, 
  Cpu, 
  Globe, 
  ChevronRight,
  Code2,
  Terminal,
  Layers
} from 'lucide-react';
import { useRef } from 'react';

// Fade Up Animation Variant
const fadeUpVariant: any = {
  hidden: { opacity: 0, y: 30 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.8, ease: "easeOut" } }
};

const staggerContainer: any = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.15
    }
  }
};

export default function LandingPage() {
  const containerRef = useRef(null);
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start start", "end end"]
  });

  // Parallax effect for hero background
  const yBackground = useTransform(scrollYProgress, [0, 1], ["0%", "50%"]);

  return (
    <div className="min-h-screen bg-[#030712] text-slate-200 font-sans selection:bg-blue-500/30 overflow-hidden" ref={containerRef}>
      
      {/* Navigation */}
      <motion.nav 
        initial={{ y: -100 }}
        animate={{ y: 0 }}
        transition={{ duration: 0.8, ease: "easeOut" }}
        className="fixed top-0 w-full bg-[#030712]/50 backdrop-blur-xl border-b border-white/5 z-50"
      >
        <div className="max-w-7xl mx-auto px-6 lg:px-8 h-20 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-blue-500 to-cyan-400 flex items-center justify-center shadow-[0_0_20px_rgba(59,130,246,0.5)]">
              <Brain className="text-white w-6 h-6" />
            </div>
            <span className="font-extrabold text-xl tracking-tight text-white">
              Cortex Intel
            </span>
          </div>
          <div className="hidden md:flex items-center gap-8 font-semibold text-sm text-slate-400">
            <a href="#how-it-works" className="hover:text-white transition-colors">Architecture</a>
            <a href="#features" className="hover:text-white transition-colors">Capabilities</a>
            <a href="#tech-stack" className="hover:text-white transition-colors">Tech Stack</a>
          </div>
          <div>
            <Link 
              href="/dashboard"
              className="group relative inline-flex items-center justify-center gap-2 px-6 py-2.5 text-sm font-bold text-white bg-white/10 border border-white/20 rounded-full hover:bg-white/20 transition-all duration-300 overflow-hidden"
            >
              <div className="absolute inset-0 bg-gradient-to-r from-blue-600 to-cyan-600 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
              <span className="relative z-10 flex items-center gap-2">
                Launch Platform <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </span>
            </Link>
          </div>
        </div>
      </motion.nav>

      {/* Hero Section */}
      <section className="relative pt-40 pb-32 lg:pt-56 lg:pb-48 px-6 lg:px-8 max-w-7xl mx-auto flex flex-col items-center text-center">
        {/* Glow Effects */}
        <motion.div style={{ y: yBackground }} className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[800px] pointer-events-none opacity-40">
          <div className="absolute top-1/4 left-1/4 w-[400px] h-[400px] bg-blue-600/30 rounded-full mix-blend-screen filter blur-[100px] animate-pulse"></div>
          <div className="absolute top-1/3 right-1/4 w-[500px] h-[500px] bg-cyan-500/20 rounded-full mix-blend-screen filter blur-[120px] animate-pulse" style={{ animationDelay: '2s' }}></div>
        </motion.div>

        <motion.div 
          variants={staggerContainer}
          initial="hidden"
          animate="visible"
          className="relative z-10 flex flex-col items-center max-w-4xl"
        >
          <motion.div variants={fadeUpVariant} className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-400 text-xs font-bold mb-8 backdrop-blur-md">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-blue-500"></span>
            </span>
            System Live v2.0
          </motion.div>
          
          <motion.h1 variants={fadeUpVariant} className="text-5xl md:text-7xl lg:text-8xl font-black tracking-tight text-white mb-8 leading-[1.05]">
            The Engine for <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 via-cyan-400 to-emerald-400">
              Healthcare Intelligence
            </span>
          </motion.h1>
          
          <motion.p variants={fadeUpVariant} className="text-lg lg:text-xl text-slate-400 mb-12 max-w-2xl leading-relaxed">
            Ingest real-time FDA recalls, analyze global WHO indicators, and run on-device machine learning inference. Built entirely on open data and high-performance serverless edge compute.
          </motion.p>
          
          <motion.div variants={fadeUpVariant} className="flex flex-col sm:flex-row items-center gap-4 w-full justify-center">
            <Link 
              href="/dashboard"
              className="w-full sm:w-auto inline-flex items-center justify-center gap-3 px-8 py-4 text-base font-bold text-slate-900 bg-white rounded-xl hover:bg-slate-100 hover:scale-105 transition-all shadow-[0_0_40px_rgba(255,255,255,0.2)]"
            >
              Access Dashboard <ArrowRight className="w-5 h-5" />
            </Link>
            <a 
              href="#how-it-works"
              className="w-full sm:w-auto inline-flex items-center justify-center gap-3 px-8 py-4 text-base font-bold text-white bg-white/5 border border-white/10 rounded-xl hover:bg-white/10 transition-all"
            >
              View Documentation
            </a>
          </motion.div>
        </motion.div>
      </section>

      {/* How It Works (Documentation) */}
      <section id="how-it-works" className="py-32 relative border-t border-white/5 bg-[#050b14]">
        <div className="max-w-7xl mx-auto px-6 lg:px-8">
          <motion.div 
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-100px" }}
            variants={fadeUpVariant}
            className="text-center mb-24"
          >
            <h2 className="text-4xl lg:text-5xl font-black text-white mb-6">How Cortex Intel Works</h2>
            <p className="text-lg text-slate-400 max-w-2xl mx-auto">
              A transparent, open-source pipeline transforming raw public APIs into actionable clinical intelligence.
            </p>
          </motion.div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 relative">
            {/* Connecting Line (Desktop) */}
            <div className="hidden lg:block absolute top-1/2 left-0 w-full h-[1px] bg-gradient-to-r from-transparent via-blue-500/50 to-transparent -translate-y-1/2 z-0"></div>

            {[
              {
                step: "01",
                icon: Database,
                title: "Data Ingestion (ETL)",
                desc: "FastAPI workers asynchronously poll the openFDA and WHO Athena APIs, mapping raw JSON responses into normalized relational schemas via a local SQLite warehouse."
              },
              {
                step: "02",
                icon: Cpu,
                title: "Machine Learning",
                desc: "Patient input parameters are vectorized and passed through pre-trained Scikit-Learn Random Forest estimators (v1.3.2) to predict diagnostic risk probabilities instantly."
              },
              {
                step: "03",
                icon: Sparkles,
                title: "Generative AI Sync",
                desc: "The React frontend contextually passes ingested metrics to the Gemini 2.5 API, converting complex tabular queries into natural language clinical insights."
              }
            ].map((item, idx) => (
              <motion.div 
                key={idx}
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true, margin: "-50px" }}
                variants={{
                  hidden: { opacity: 0, y: 50 },
                  visible: { opacity: 1, y: 0, transition: { duration: 0.6, delay: idx * 0.2 } }
                }}
                className="relative z-10 group"
              >
                <div className="h-full p-8 rounded-3xl bg-[#0a1122] border border-white/10 hover:border-blue-500/50 transition-colors duration-500 hover:shadow-[0_0_30px_rgba(59,130,246,0.15)]">
                  <div className="text-5xl font-black text-white/5 mb-6 absolute top-4 right-6 group-hover:text-blue-500/10 transition-colors">{item.step}</div>
                  <div className="w-14 h-14 rounded-2xl bg-blue-500/10 flex items-center justify-center mb-8 border border-blue-500/20 group-hover:bg-blue-500 group-hover:border-transparent transition-all duration-500">
                    <item.icon className="w-6 h-6 text-blue-400 group-hover:text-white transition-colors" />
                  </div>
                  <h3 className="text-xl font-bold text-white mb-4">{item.title}</h3>
                  <p className="text-slate-400 leading-relaxed text-sm font-medium">{item.desc}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Core Features */}
      <section id="features" className="py-32 relative">
        <div className="max-w-7xl mx-auto px-6 lg:px-8">
          <motion.div 
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-100px" }}
            variants={fadeUpVariant}
            className="mb-20 md:flex items-end justify-between"
          >
            <div className="max-w-2xl">
              <h2 className="text-4xl lg:text-5xl font-black text-white mb-6">Unrivaled Clinical Capabilities</h2>
              <p className="text-lg text-slate-400">We've built four distinct products into one unified intelligence dashboard.</p>
            </div>
            <Link href="/dashboard" className="hidden md:inline-flex items-center gap-2 text-blue-400 font-bold hover:text-blue-300 transition-colors">
              Explore Dashboard <ChevronRight className="w-4 h-4" />
            </Link>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Feature 1 */}
            <motion.div 
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
              variants={fadeUpVariant}
              className="group p-10 rounded-3xl bg-gradient-to-br from-slate-900 to-[#030712] border border-white/5 hover:border-white/10 transition-all overflow-hidden relative"
            >
              <div className="absolute inset-0 bg-blue-500/0 group-hover:bg-blue-500/5 transition-colors duration-500"></div>
              <Activity className="w-10 h-10 text-blue-400 mb-8" />
              <h3 className="text-2xl font-bold text-white mb-4">FDA Regulatory Intelligence</h3>
              <p className="text-slate-400 mb-8 max-w-sm">Live ingestion of Class I, II, and III medical device and pharmaceutical recalls straight from the FDA database.</p>
              <div className="w-full h-40 bg-[#0a1122] rounded-xl border border-white/10 flex items-center justify-center p-4 group-hover:-translate-y-2 transition-transform duration-500">
                 {/* Abstract UI representation */}
                 <div className="w-full space-y-3">
                   <div className="flex items-center gap-3"><div className="w-2 h-2 rounded-full bg-red-500 animate-pulse"></div><div className="h-2.5 w-3/4 bg-white/10 rounded"></div></div>
                   <div className="flex items-center gap-3"><div className="w-2 h-2 rounded-full bg-amber-500"></div><div className="h-2.5 w-1/2 bg-white/10 rounded"></div></div>
                   <div className="flex items-center gap-3"><div className="w-2 h-2 rounded-full bg-blue-500"></div><div className="h-2.5 w-2/3 bg-white/10 rounded"></div></div>
                 </div>
              </div>
            </motion.div>

            {/* Feature 2 */}
            <motion.div 
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
              variants={fadeUpVariant}
              className="group p-10 rounded-3xl bg-gradient-to-br from-slate-900 to-[#030712] border border-white/5 hover:border-white/10 transition-all overflow-hidden relative"
            >
              <div className="absolute inset-0 bg-cyan-500/0 group-hover:bg-cyan-500/5 transition-colors duration-500"></div>
              <Shield className="w-10 h-10 text-cyan-400 mb-8" />
              <h3 className="text-2xl font-bold text-white mb-4">Patient Risk Estimator</h3>
              <p className="text-slate-400 mb-8 max-w-sm">Input biometric parameters (age, BMI, cholesterol) to estimate cardiovascular and endocrine disease risk via Random Forests.</p>
              <div className="w-full h-40 bg-[#0a1122] rounded-xl border border-white/10 flex items-end justify-center p-4 gap-4 group-hover:-translate-y-2 transition-transform duration-500">
                 {/* Abstract UI representation */}
                 <div className="w-8 h-20 bg-cyan-500/20 rounded-t-sm"></div>
                 <div className="w-8 h-32 bg-cyan-500/50 rounded-t-sm relative"><div className="absolute -top-6 left-1/2 -translate-x-1/2 text-[10px] text-cyan-300 font-bold">85%</div></div>
                 <div className="w-8 h-12 bg-cyan-500/20 rounded-t-sm"></div>
              </div>
            </motion.div>

            {/* Feature 3 */}
            <motion.div 
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
              variants={fadeUpVariant}
              className="md:col-span-2 group p-10 rounded-3xl bg-gradient-to-br from-[#0a1122] to-[#030712] border border-blue-500/20 hover:border-blue-500/40 transition-all overflow-hidden relative flex flex-col md:flex-row items-center gap-10"
            >
              <div className="absolute right-0 top-0 w-[500px] h-[500px] bg-blue-600/10 rounded-full mix-blend-screen filter blur-[100px] pointer-events-none group-hover:bg-blue-600/20 transition-colors duration-1000"></div>
              <div className="flex-1 relative z-10">
                <Brain className="w-12 h-12 text-blue-500 mb-8" />
                <h3 className="text-3xl font-bold text-white mb-4">Cortex AI Copilot</h3>
                <p className="text-slate-400 text-lg mb-8 max-w-xl">
                  Bring your own Gemini API Key. Ask complex questions about the aggregated global health metrics or specific FDA recalls. Cortex Intel formats the data and feeds it to LLMs for deterministic clinical insights.
                </p>
                <ul className="space-y-3 font-semibold text-slate-300">
                  <li className="flex items-center gap-3"><CheckCircle className="w-5 h-5 text-emerald-400" /> Bring Your Own Key Architecture</li>
                  <li className="flex items-center gap-3"><CheckCircle className="w-5 h-5 text-emerald-400" /> Zero Data Retention</li>
                  <li className="flex items-center gap-3"><CheckCircle className="w-5 h-5 text-emerald-400" /> Multi-turn Clinical Dialogue</li>
                </ul>
              </div>
              <div className="w-full md:w-[400px] h-[300px] bg-[#030712]/80 backdrop-blur-xl rounded-2xl border border-white/10 p-6 flex flex-col justify-end relative z-10 group-hover:-translate-y-2 group-hover:shadow-[0_20px_50px_rgba(0,0,0,0.5)] transition-all duration-500">
                <div className="bg-slate-800 text-slate-200 text-xs p-3 rounded-xl rounded-tr-none self-end max-w-[80%] mb-3">Compare Health Expenditure vs Life Expectancy globally.</div>
                <div className="bg-blue-600/20 border border-blue-500/30 text-blue-100 text-xs p-4 rounded-xl rounded-tl-none self-start max-w-[90%] flex gap-3 shadow-inner">
                  <Sparkles className="w-4 h-4 text-blue-400 shrink-0 mt-0.5" />
                  <p>Based on the WHO registry, higher expenditure directly correlates with longer life expectancy in 85% of developed nations. <span className="block mt-2 font-mono text-[9px] text-blue-300">Generated via Gemini 1.5 Pro</span></p>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-white/5 bg-[#030712] py-16 text-center">
        <div className="max-w-7xl mx-auto px-6 lg:px-8">
          <div className="flex items-center justify-center gap-3 mb-6">
            <Brain className="text-blue-500 w-6 h-6" />
            <span className="font-extrabold text-xl tracking-tight text-white">Cortex Intel</span>
          </div>
          <p className="text-sm text-slate-500 font-medium max-w-sm mx-auto">
            100% Free & Open Source Healthcare Intelligence Platform. Built for the future of clinical analytics.
          </p>
        </div>
      </footer>
    </div>
  );
}

// Simple check circle component for UI
function CheckCircle(props: any) {
  return (
    <svg {...props} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
      <polyline points="22 4 12 14.01 9 11.01" />
    </svg>
  );
}

function Sparkles(props: any) {
  return (
    <svg {...props} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M9.937 15.5A2 2 0 0 0 8.5 14.063l-6.135-1.582a.5.5 0 0 1 0-.962L8.5 9.936A2 2 0 0 0 9.937 8.5l1.582-6.135a.5.5 0 0 1 .963 0L14.063 8.5A2 2 0 0 0 15.5 9.937l6.135 1.581a.5.5 0 0 1 0 .964L15.5 14.063a2 2 0 0 0-1.437 1.437l-1.582 6.135a.5.5 0 0 1-.963 0z" />
    </svg>
  );
}
