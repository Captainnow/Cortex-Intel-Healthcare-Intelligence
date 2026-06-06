'use client';

import { useState, useEffect } from 'react';
import { 
  Activity, Heart, AlertTriangle, TrendingUp, Users, Globe, 
  Brain, Shield, Stethoscope, FileText, Send, Loader2, Sparkles,
  ArrowRight, Search, Filter, Info, Terminal, User, ChevronRight, CheckCircle2,
  Plus, Mic, Copy, ThumbsUp, ThumbsDown, Share2, RotateCcw, Menu
} from 'lucide-react';
import { 
  LineChart, Line, BarChart, Bar, PieChart, Pie, Cell, 
  XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer
} from 'recharts';

const COLORS = ['#6366f1', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#06b6d4'];
const BACKEND_URL = 'http://localhost:8000';

interface RecallRecord {
  recall_id: string;
  product_description: string;
  product_type: string;
  recall_class: string;
  reason_for_recall: string;
  firm_name: string;
  status: string;
  quantity: string;
  date_initiated: string;
  state: string;
  country: string;
  source: string;
  api_endpoint: string;
  last_updated: string;
}

interface ChatMessage {
  sender: 'ai' | 'user';
  text: string;
  data?: any[];
}

export default function Dashboard() {
  const [activeTab, setActiveTab] = useState('overview');
  const [loading, setLoading] = useState(true);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [copiedIdx, setCopiedIdx] = useState<number | null>(null);
  const [apiKey, setApiKey] = useState('');

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const savedKey = localStorage.getItem('gemini_api_key') || '';
      setApiKey(savedKey);
    }
  }, []);

  const handleApiKeyChange = (val: string) => {
    setApiKey(val);
    if (typeof window !== 'undefined') {
      localStorage.setItem('gemini_api_key', val);
    }
  };
  
  // Dashboard Metrics
  const [stats, setStats] = useState({
    recallsCount: 0,
    indicatorsCount: 0,
    patientsCount: 0,
    modelsCount: 4
  });

  // Data lists
  const [recallsList, setRecallsList] = useState<RecallRecord[]>([]);
  const [recallSummary, setRecallSummary] = useState<any[]>([]);
  const [countriesSummary, setCountriesSummary] = useState<any[]>([]);
  const [activeAlerts, setActiveAlerts] = useState<RecallRecord[]>([]);
  
  // Search & Filter State
  const [searchQuery, setSearchQuery] = useState('');
  const [filterClass, setFilterClass] = useState('All');
  
  // Live Activity Logs
  const [logs, setLogs] = useState<string[]>([
    "System initialized. Awaiting API handshakes...",
  ]);

  // Patient Prediction State
  const [diseaseType, setDiseaseType] = useState<'heart' | 'diabetes'>('heart');
  const [predictionStep, setPredictionStep] = useState(1);
  const [predictionLoading, setPredictionLoading] = useState(false);
  const [predictionResult, setPredictionResult] = useState<any>(null);
  const [heartFeatures, setHeartFeatures] = useState({
    age: 55, sex: 1, cp: 1, trestbps: 130, chol: 240, fbs: 0,
    restecg: 1, thalach: 145, exang: 0, oldpeak: 1.2, slope: 1, ca: 0, thal: 2
  });
  const [diabetesFeatures, setDiabetesFeatures] = useState({
    pregnancies: 2, glucose: 110, blood_pressure: 70, 
    skin_thickness: 20, insulin: 80, bmi: 26.5, diabetes_pedigree: 0.45, age: 35
  });

  // AI Chat State
  const [chatHistory, setChatHistory] = useState<ChatMessage[]>([
    {
      sender: 'ai',
      text: "Cortex Intel operational. I am routed to your local SQLite warehouse and scikit-learn classifiers. Ask me about recalls, country indicator indexes, or predict outcomes."
    }
  ]);
  const [chatInput, setChatInput] = useState('');
  const [chatLoading, setChatLoading] = useState(false);

  // Helper to add logs
  const addLog = (msg: string) => {
    const time = new Date().toLocaleTimeString();
    setLogs(prev => [`[${time}] ${msg}`, ...prev].slice(0, 10));
  };

  // Fetch initial data
  useEffect(() => {
    async function fetchInitialData() {
      try {
        setLoading(true);
        addLog("Initiating handshakes with openFDA...");
        
        // Fetch Recalls
        const recallsRes = await fetch(`${BACKEND_URL}/api/devices/recalls?limit=100`);
        const recallsData = await recallsRes.json();
        const recalls = recallsData.recalls || [];
        setRecallsList(recalls);
        addLog("FDA Device recalls cached locally.");

        // Fetch Recalls Summary
        const summaryRes = await fetch(`${BACKEND_URL}/api/devices/summary`);
        const summaryData = await summaryRes.json();
        setRecallSummary(summaryData.summary || []);
        addLog("FDA Speciality summary generated.");

        // Fetch Health Indicators
        const indicatorsRes = await fetch(`${BACKEND_URL}/api/health/indicators`);
        const indicatorsData = await indicatorsRes.json();
        const indicators = indicatorsData.indicators || [];
        addLog("WHO Global Health indicators loaded.");

        // Fetch Countries Summary
        const countriesRes = await fetch(`${BACKEND_URL}/api/health/countries`);
        const countriesData = await countriesRes.json();
        setCountriesSummary(countriesData.countries || []);
        addLog("Comparative country expenditure indexes loaded.");

        // Filter Class I recalls
        const classIAlerts = recalls.filter((r: RecallRecord) => r.recall_class === 'Class I').slice(0, 5);
        setActiveAlerts(classIAlerts);

        setStats({
          recallsCount: recalls.length,
          indicatorsCount: indicators.length || 1860,
          patientsCount: 6581,
          modelsCount: 4
        });
        addLog("System fully loaded. Welcome to Cortex Intel Dashboard.");

      } catch (err) {
        addLog("Initialization failed. Verification recommended.");
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    fetchInitialData();
  }, []);

  // Handle Predict
  const handlePredict = async (e: React.FormEvent) => {
    e.preventDefault();
    setPredictionLoading(true);
    setPredictionResult(null);
    addLog(`Running inference for disease type: ${diseaseType}...`);

    const features = diseaseType === 'heart' ? heartFeatures : diabetesFeatures;
    
    try {
      const res = await fetch(`${BACKEND_URL}/api/patients/predict?disease_type=${diseaseType}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(features)
      });
      const data = await res.json();
      setPredictionResult(data);
      setPredictionStep(3); // Go to results step
      addLog(`Inference completed. Risk probability: ${(data.risk_probability * 100).toFixed(1)}%.`);
    } catch (err) {
      addLog("Inference request failed.");
      console.error(err);
    } finally {
      setPredictionLoading(false);
    }
  };

  // Handle AI Chat
  const handleAskAI = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!chatInput.trim() || chatLoading) return;

    const userMessage = chatInput;
    setChatInput('');
    setChatHistory(prev => [...prev, { sender: 'user', text: userMessage }]);
    setChatLoading(true);
    addLog(`AI Query sent: "${userMessage.substring(0, 30)}..."`);

    try {
      const res = await fetch(`${BACKEND_URL}/api/ai/ask?question=${encodeURIComponent(userMessage)}&api_key=${encodeURIComponent(apiKey)}`, {
        method: 'POST'
      });
      const data = await res.json();
      setChatHistory(prev => [...prev, { 
        sender: 'ai', 
        text: data.insight || "No insights found.",
        data: data.data || null
      }]);
      addLog("AI response delivered successfully.");
    } catch (err) {
      setChatHistory(prev => [...prev, { 
        sender: 'ai', 
        text: "Error contacting AI server."
      }]);
      addLog("AI response request failed.");
      console.error(err);
    } finally {
      setChatLoading(false);
    }
  };

  const filteredRecalls = recallsList.filter(r => {
    const matchesSearch = r.product_description.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          r.firm_name.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesClass = filterClass === 'All' || r.recall_class === filterClass;
    return matchesSearch && matchesClass;
  });

  const renderOverview = () => (
    <div className="space-y-6">
      {/* Top Banner Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
        {[
          { title: "Live FDA Recalls", count: stats.recallsCount, icon: Shield, desc: "Direct openFDA feed", color: "from-indigo-500/10 to-indigo-500/5", stroke: "text-blue-600" },
          { title: "WHO Indicators", count: stats.indicatorsCount, icon: Globe, desc: "Global Health Observatory", color: "from-emerald-500/10 to-emerald-500/5", stroke: "text-teal-600" },
          { title: "Patient Records", count: stats.patientsCount, icon: Users, desc: "UCI & Kaggle cohorts", color: "from-purple-500/10 to-purple-500/5", stroke: "text-purple-400" },
          { title: "Inference Classifiers", count: stats.modelsCount, icon: Brain, desc: "Active ML Random Forests", color: "from-pink-500/10 to-pink-500/5", stroke: "text-pink-400" }
        ].map((c, i) => (
          <div key={i} className={`saas-card p-5 rounded-2xl bg-gradient-to-br ${c.color} border border-gray-200 relative overflow-hidden transition-all duration-300 hover:scale-[1.02]`}>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-[10px] text-gray-500 uppercase tracking-widest font-bold">{c.title}</p>
                <p className="text-3xl font-black text-gray-900 mt-1.5">{c.count.toLocaleString()}</p>
              </div>
              <div className="p-3 bg-gray-50/40 border border-gray-200 rounded-xl">
                <c.icon className={`h-5 w-5 ${c.stroke}`} />
              </div>
            </div>
            <div className="flex items-center gap-1.5 mt-4 text-[10px] text-gray-500 font-medium">
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-ping"></span>
              {c.desc}
            </div>
          </div>
        ))}
      </div>

      {/* Main Split Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Dynamic Alerts */}
        <div className="saas-card p-6 rounded-2xl lg:col-span-2 space-y-4">
          <div className="flex items-center justify-between border-b border-gray-200 pb-3">
            <h3 className="text-sm font-bold text-gray-900 flex items-center gap-2">
              <AlertTriangle className="h-4 w-4 text-rose-500" /> Active Class I Threat Feed
            </h3>
            <span className="text-[9px] bg-rose-500/15 border border-rose-500/30 text-rose-600 px-2 py-0.5 rounded-full font-bold">
              CRITICAL MONITORED
            </span>
          </div>
          <div className="space-y-3 max-h-[350px] overflow-y-auto pr-1">
            {activeAlerts.length > 0 ? (
              activeAlerts.map((alert, idx) => (
                <div key={idx} className="p-4 bg-gray-50/40 border border-gray-200 rounded-xl space-y-2 relative overflow-hidden transition-colors hover:bg-white">
                  <div className="absolute left-0 top-0 bottom-0 w-1 bg-red-500"></div>
                  <div className="flex items-center justify-between">
                    <span className="text-[9px] bg-red-500/10 text-red-400 font-bold border border-red-500/20 px-2 py-0.5 rounded-md">
                      CLASS I RISK
                    </span>
                    <span className="text-[10px] text-gray-400">{alert.date_initiated}</span>
                  </div>
                  <h4 className="text-xs font-bold text-gray-800 line-clamp-1">{alert.product_description}</h4>
                  <p className="text-[11px] text-gray-500 leading-normal line-clamp-2">
                    <strong className="text-gray-700">Reason:</strong> {alert.reason_for_recall}
                  </p>
                  <div className="flex items-center justify-between text-[9px] text-gray-400 border-t border-gray-200 pt-2 mt-1">
                    <span>Firm: {alert.firm_name}</span>
                    <span>State: {alert.state || 'Global'}</span>
                  </div>
                </div>
              ))
            ) : (
              <div className="py-12 text-center text-gray-400 text-xs">
                No active Class I recalls detected. All monitored categories are within safety limits.
              </div>
            )}
          </div>
        </div>

        {/* Workflow Diagram */}
        <div className="saas-card p-6 rounded-2xl flex flex-col justify-between space-y-4">
          <div>
            <h3 className="text-sm font-bold text-gray-900 flex items-center gap-2 border-b border-gray-200 pb-3">
              <Sparkles className="h-4 w-4 text-blue-600" /> Platform Architecture
            </h3>
            <p className="text-[11px] text-gray-500 leading-relaxed mt-3">
              Cortex Intel manages an automated local database synchronization pipeline connecting official endpoints to inference classifiers.
            </p>
            
            {/* SVG Visual Workflow Diagram */}
            <div className="mt-5 space-y-4">
              {[
                { step: "1", title: "API Ingestion", desc: "Downloads records from openFDA & WHO APIs" },
                { step: "2", title: "SQLite Warehouse", desc: "Ingests data to fact_device_recalls" },
                { step: "3", title: "ML Inference", desc: "Runs random forest classifier models" },
                { step: "4", title: "AI Assistant", desc: "Generates custom tabular insights" }
              ].map((s, i) => (
                <div key={i} className="flex gap-3 items-start relative">
                  {i < 3 && <div className="absolute left-3 top-7 bottom-0 w-0.5 bg-gray-200"></div>}
                  <div className="w-6 h-6 rounded-full bg-indigo-500/10 border border-indigo-500/30 flex items-center justify-center text-[10px] font-bold text-blue-600 flex-shrink-0">
                    {s.step}
                  </div>
                  <div>
                    <h4 className="text-[11px] font-bold text-gray-800">{s.title}</h4>
                    <p className="text-[10px] text-gray-400 mt-0.5">{s.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  const renderDevices = () => {
    const pieData = recallSummary.slice(0, 6).map((item, idx) => ({
      name: item.product_type || 'Other',
      value: item.total_recalls || 1
    }));

    return (
      <div className="space-y-6">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Pie Chart */}
          <div className="saas-card p-6 rounded-2xl lg:col-span-2 space-y-4">
            <h3 className="text-sm font-bold text-gray-900">Recall Breakdown by Medical Speciality</h3>
            <div className="h-72">
              {pieData.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie 
                      data={pieData} 
                      cx="50%" 
                      cy="50%" 
                      outerRadius={80} 
                      fill="#8884d8" 
                      dataKey="value" 
                      label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                    >
                      {pieData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip contentStyle={{ backgroundColor: '#ffffff', color: '#1f2937', borderColor: '#e5e7eb', borderRadius: '12px' }} />
                  </PieChart>
                </ResponsiveContainer>
              ) : (
                <div className="h-full flex items-center justify-center text-gray-400 text-xs">
                  Loading specialities...
                </div>
              )}
            </div>
          </div>

          {/* Key specialities metrics */}
          <div className="saas-card p-6 rounded-2xl space-y-4">
            <h3 className="text-sm font-bold text-gray-900">Metrics Summary</h3>
            <div className="space-y-3">
              {recallSummary.slice(0, 5).map((item, idx) => (
                <div key={idx} className="space-y-1">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-semibold text-gray-700">{item.product_type}</span>
                    <span className="text-gray-500 font-mono">{item.total_recalls}</span>
                  </div>
                  <div className="w-full h-1 bg-gray-200 rounded-full overflow-hidden">
                    <div 
                      className="h-full bg-indigo-500 rounded-full" 
                      style={{ width: `${Math.min(100, (item.total_recalls / (recallSummary[0]?.total_recalls || 1)) * 100)}%` }}
                    />
                  </div>
                  <div className="text-[10px] text-gray-400 flex justify-between">
                    <span>Firms: {item.manufacturers_affected}</span>
                    <span>Severity: {item.recall_class}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Dynamic Recall Explorer Table */}
        <div className="saas-card p-6 rounded-2xl space-y-4">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-gray-200 pb-4">
            <h3 className="text-sm font-bold text-gray-900 flex items-center gap-2">
              <FileText className="h-4 w-4 text-blue-600" /> Medical Recall Inquest Explorer
            </h3>
            
            {/* Filter controls */}
            <div className="flex flex-wrap items-center gap-3">
              <div className="relative">
                <Search className="h-3.5 w-3.5 text-gray-400 absolute left-3 top-2.5" />
                <input 
                  type="text" 
                  value={searchQuery}
                  onChange={e => setSearchQuery(e.target.value)}
                  placeholder="Search manufacturer or device..." 
                  className="bg-gray-50 border border-gray-200 rounded-lg pl-9 pr-4 py-1.5 text-xs text-gray-800 focus:outline-none focus:border-indigo-500 placeholder-gray-400"
                />
              </div>
              <div className="flex items-center gap-1.5">
                <Filter className="h-3.5 w-3.5 text-gray-400" />
                <select 
                  value={filterClass} 
                  onChange={e => setFilterClass(e.target.value)}
                  className="bg-gray-50 border border-gray-200 rounded-lg px-2 py-1.5 text-xs text-gray-800 focus:outline-none focus:border-indigo-500"
                >
                  <option value="All">All Classes</option>
                  <option value="Class I">Class I (Critical)</option>
                  <option value="Class II">Class II (Medium)</option>
                  <option value="Class III">Class III (Low)</option>
                </select>
              </div>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="border-b border-gray-200 text-gray-500 font-semibold">
                  <th className="py-3 px-4">Recall ID</th>
                  <th className="py-3 px-4">Firm</th>
                  <th className="py-3 px-4">Category</th>
                  <th className="py-3 px-4">Severity</th>
                  <th className="py-3 px-4">Reason for Recall</th>
                  <th className="py-3 px-4">Date</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 text-gray-700">
                {filteredRecalls.slice(0, 15).map((r, idx) => (
                  <tr key={idx} className="hover:bg-white/30 transition-colors">
                    <td className="py-3 px-4 font-mono text-blue-600">{r.recall_id}</td>
                    <td className="py-3 px-4 font-semibold text-gray-900">{r.firm_name}</td>
                    <td className="py-3 px-4">{r.product_type}</td>
                    <td className="py-3 px-4">
                      <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                        r.recall_class === 'Class I' 
                          ? 'bg-red-500/10 text-red-400 border border-red-500/20' 
                          : r.recall_class === 'Class II'
                            ? 'bg-amber-500/10 text-amber-600 border border-amber-500/20'
                            : 'bg-emerald-500/10 text-teal-600 border border-emerald-500/20'
                      }`}>
                        {r.recall_class}
                      </span>
                    </td>
                    <td className="py-3 px-4 max-w-[250px] truncate" title={r.reason_for_recall}>{r.reason_for_recall}</td>
                    <td className="py-3 px-4 font-mono text-gray-500">{r.date_initiated}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    );
  };

  const renderHealth = () => {
    const chartDataMap: { [key: string]: { country: string, lifeExp?: number, healthExp?: number } } = {};
    
    countriesSummary.forEach(item => {
      const countryCode = item.country;
      if (!chartDataMap[countryCode]) {
        chartDataMap[countryCode] = { country: countryCode };
      }
      
      const name = item.indicator_name.toLowerCase();
      if (name.includes('life expectancy')) {
        chartDataMap[countryCode].lifeExp = parseFloat(item.avg_value);
      } else if (name.includes('expenditure')) {
        chartDataMap[countryCode].healthExp = parseFloat(item.avg_value);
      }
    });

    const chartData = Object.values(chartDataMap).filter(item => item.lifeExp || item.healthExp);

    return (
      <div className="space-y-6">
        <div className="saas-card p-6 rounded-2xl space-y-4">
          <h3 className="text-sm font-bold text-gray-900">WHO Global Health Observatory Comparison</h3>
          <p className="text-xs text-gray-500">
            Life Expectancy at Birth (years) vs. Current Health Expenditure as percentage of GDP (%) for the 20 target countries.
          </p>
          <div className="h-96">
            {chartData.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={chartData} margin={{ top: 20, right: 30, left: 20, bottom: 20 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                  <XAxis dataKey="country" stroke="#64748b" style={{ fontSize: '11px' }} />
                  <YAxis yAxisId="left" stroke="#10b981" style={{ fontSize: '11px' }} label={{ value: 'Life Expectancy (Years)', angle: -90, position: 'insideLeft', fill: '#10b981', style: { fontSize: '11px', textAnchor: 'middle' } }} />
                  <YAxis yAxisId="right" orientation="right" stroke="#6366f1" style={{ fontSize: '11px' }} label={{ value: 'Health Expenditure (% of GDP)', angle: 90, position: 'insideRight', fill: '#6366f1', style: { fontSize: '11px', textAnchor: 'middle' } }} />
                  <Tooltip contentStyle={{ backgroundColor: '#ffffff', color: '#1f2937', borderColor: '#e5e7eb', borderRadius: '12px' }} />
                  <Legend />
                  <Bar yAxisId="left" dataKey="lifeExp" fill="#10b981" name="Life Expectancy" radius={[4, 4, 0, 0]} />
                  <Bar yAxisId="right" dataKey="healthExp" fill="#6366f1" name="Health Expenditure (% of GDP)" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-full flex items-center justify-center text-gray-400 text-xs">
                No country comparisons found. Awaiting background sync completes...
              </div>
            )}
          </div>
        </div>
      </div>
    );
  };

  const renderPatients = () => {
    return (
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Form Wizard panel */}
        <div className="saas-card p-6 rounded-2xl lg:col-span-2 space-y-5">
          <div className="flex items-center justify-between border-b border-gray-200 pb-3">
            <h3 className="text-sm font-bold text-gray-900">Diagnostic Parameter Risk Estimator</h3>
            <div className="flex gap-1.5 p-1 bg-gray-50 border border-gray-200 rounded-lg">
              <button 
                onClick={() => { setDiseaseType('heart'); setPredictionResult(null); setPredictionStep(1); }}
                className={`px-3 py-1 rounded-md text-xs font-semibold transition-colors ${diseaseType === 'heart' ? 'bg-indigo-500 text-white shadow' : 'text-gray-500 hover:text-gray-800'}`}
              >
                Heart Disease
              </button>
              <button 
                onClick={() => { setDiseaseType('diabetes'); setPredictionResult(null); setPredictionStep(1); }}
                className={`px-3 py-1 rounded-md text-xs font-semibold transition-colors ${diseaseType === 'diabetes' ? 'bg-indigo-500 text-white shadow' : 'text-gray-500 hover:text-gray-800'}`}
              >
                Diabetes
              </button>
            </div>
          </div>

          {/* Stepper indicators */}
          <div className="flex items-center justify-center gap-12 py-2">
            {[
              { id: 1, label: "Select Disease" },
              { id: 2, label: "Clinical Inputs" },
              { id: 3, label: "Risk Report" }
            ].map(s => (
              <div key={s.id} className="flex items-center gap-2">
                <div className={`w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-bold border transition-colors ${
                  predictionStep === s.id 
                    ? 'bg-indigo-500 border-indigo-500 text-white font-black' 
                    : predictionStep > s.id 
                      ? 'bg-indigo-500/10 border-indigo-500/20 text-blue-600'
                      : 'border-gray-200 text-gray-400'
                }`}>
                  {predictionStep > s.id ? <CheckCircle2 className="h-3.5 w-3.5" /> : s.id}
                </div>
                <span className={`text-[10px] uppercase font-bold tracking-wider ${predictionStep === s.id ? 'text-blue-600' : 'text-gray-400'}`}>
                  {s.label}
                </span>
              </div>
            ))}
          </div>

          <form onSubmit={handlePredict} className="space-y-4 pt-2">
            {predictionStep === 1 && (
              <div className="py-6 space-y-4 text-center">
                <Brain className="h-10 w-10 text-blue-600 mx-auto animate-float" />
                <div className="max-w-md mx-auto space-y-2">
                  <h4 className="text-xs font-bold text-gray-900 uppercase tracking-wider">Initialize Inference Pipeline</h4>
                  <p className="text-[11px] text-gray-500 leading-relaxed">
                    You have selected the <strong className="text-gray-800">{diseaseType === 'heart' ? 'Cardiovascular Disease' : 'Diabetes Endocrine'} Classifier</strong>. This pipeline queries scikit-learn random forests to evaluate outcomes.
                  </p>
                </div>
                <button 
                  type="button" 
                  onClick={() => setPredictionStep(2)}
                  className="px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold transition inline-flex items-center gap-2 mt-4"
                >
                  Configure Inputs <ArrowRight className="h-3.5 w-3.5" />
                </button>
              </div>
            )}

            {predictionStep === 2 && (
              <div className="space-y-4">
                {diseaseType === 'heart' ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-1">
                      <label className="text-[10px] font-bold uppercase tracking-wider text-gray-500">Patient Age: {heartFeatures.age}</label>
                      <input type="range" min="20" max="95" value={heartFeatures.age} onChange={e => setHeartFeatures(prev => ({...prev, age: parseInt(e.target.value)}))} className="w-full accent-indigo-500" />
                    </div>
                    <div className="space-y-1">
                      <label className="text-[10px] font-bold uppercase tracking-wider text-gray-500">Biological Sex</label>
                      <select value={heartFeatures.sex} onChange={e => setHeartFeatures(prev => ({...prev, sex: parseInt(e.target.value)}))} className="w-full bg-gray-50 border border-gray-200 text-gray-800 text-xs rounded-lg p-2 focus:border-indigo-500">
                        <option value="1">Male</option>
                        <option value="0">Female</option>
                      </select>
                    </div>
                    <div className="space-y-1">
                      <label className="text-[10px] font-bold uppercase tracking-wider text-gray-500">Chest Pain Type</label>
                      <select value={heartFeatures.cp} onChange={e => setHeartFeatures(prev => ({...prev, cp: parseInt(e.target.value)}))} className="w-full bg-gray-50 border border-gray-200 text-gray-800 text-xs rounded-lg p-2 focus:border-indigo-500">
                        <option value="0">Typical Angina</option>
                        <option value="1">Atypical Angina</option>
                        <option value="2">Non-anginal Pain</option>
                        <option value="3">Asymptomatic</option>
                      </select>
                    </div>
                    <div className="space-y-1">
                      <label className="text-[10px] font-bold uppercase tracking-wider text-gray-500">Resting Blood Pressure: {heartFeatures.trestbps} mmHg</label>
                      <input type="range" min="80" max="200" value={heartFeatures.trestbps} onChange={e => setHeartFeatures(prev => ({...prev, trestbps: parseInt(e.target.value)}))} className="w-full accent-indigo-500" />
                    </div>
                    <div className="space-y-1">
                      <label className="text-[10px] font-bold uppercase tracking-wider text-gray-500">Serum Cholesterol: {heartFeatures.chol} mg/dl</label>
                      <input type="range" min="100" max="600" value={heartFeatures.chol} onChange={e => setHeartFeatures(prev => ({...prev, chol: parseInt(e.target.value)}))} className="w-full accent-indigo-500" />
                    </div>
                    <div className="space-y-1">
                      <label className="text-[10px] font-bold uppercase tracking-wider text-gray-500">Fasting Blood Sugar &gt; 120 mg/dl</label>
                      <select value={heartFeatures.fbs} onChange={e => setHeartFeatures(prev => ({...prev, fbs: parseInt(e.target.value)}))} className="w-full bg-gray-50 border border-gray-200 text-gray-800 text-xs rounded-lg p-2 focus:border-indigo-500">
                        <option value="0">No</option>
                        <option value="1">Yes</option>
                      </select>
                    </div>
                    <div className="space-y-1">
                      <label className="text-[10px] font-bold uppercase tracking-wider text-gray-500">Resting ECG Results</label>
                      <select value={heartFeatures.restecg} onChange={e => setHeartFeatures(prev => ({...prev, restecg: parseInt(e.target.value)}))} className="w-full bg-gray-50 border border-gray-200 text-gray-800 text-xs rounded-lg p-2 focus:border-indigo-500">
                        <option value="0">Normal</option>
                        <option value="1">ST-T Wave Abnormality</option>
                        <option value="2">Left Ventricular Hypertrophy</option>
                      </select>
                    </div>
                    <div className="space-y-1">
                      <label className="text-[10px] font-bold uppercase tracking-wider text-gray-500">Max Heart Rate Achieved: {heartFeatures.thalach} bpm</label>
                      <input type="range" min="60" max="220" value={heartFeatures.thalach} onChange={e => setHeartFeatures(prev => ({...prev, thalach: parseInt(e.target.value)}))} className="w-full accent-indigo-500" />
                    </div>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-1">
                      <label className="text-[10px] font-bold uppercase tracking-wider text-gray-500">Pregnancies: {diabetesFeatures.pregnancies}</label>
                      <input type="range" min="0" max="17" value={diabetesFeatures.pregnancies} onChange={e => setDiabetesFeatures(prev => ({...prev, pregnancies: parseInt(e.target.value)}))} className="w-full accent-indigo-500" />
                    </div>
                    <div className="space-y-1">
                      <label className="text-[10px] font-bold uppercase tracking-wider text-gray-500">Plasma Glucose: {diabetesFeatures.glucose} mg/dl</label>
                      <input type="range" min="0" max="200" value={diabetesFeatures.glucose} onChange={e => setDiabetesFeatures(prev => ({...prev, glucose: parseInt(e.target.value)}))} className="w-full accent-indigo-500" />
                    </div>
                    <div className="space-y-1">
                      <label className="text-[10px] font-bold uppercase tracking-wider text-gray-500">Blood Pressure: {diabetesFeatures.blood_pressure} mmHg</label>
                      <input type="range" min="0" max="122" value={diabetesFeatures.blood_pressure} onChange={e => setDiabetesFeatures(prev => ({...prev, blood_pressure: parseInt(e.target.value)}))} className="w-full accent-indigo-500" />
                    </div>
                    <div className="space-y-1">
                      <label className="text-[10px] font-bold uppercase tracking-wider text-gray-500">Body Mass Index (BMI): {diabetesFeatures.bmi.toFixed(1)}</label>
                      <input type="range" min="0" max="67.1" step="0.1" value={diabetesFeatures.bmi} onChange={e => setDiabetesFeatures(prev => ({...prev, bmi: parseFloat(e.target.value)}))} className="w-full accent-indigo-500" />
                    </div>
                  </div>
                )}

                <div className="flex gap-3 pt-4 border-t border-gray-200/60 mt-4">
                  <button 
                    type="button" 
                    onClick={() => setPredictionStep(1)}
                    className="flex-1 py-2 bg-white hover:bg-gray-100 text-gray-700 rounded-xl text-xs font-bold transition border border-gray-200"
                  >
                    Back
                  </button>
                  <button 
                    type="submit" 
                    disabled={predictionLoading}
                    className="flex-1 py-2 bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 text-white rounded-xl text-xs font-bold transition flex items-center justify-center gap-2"
                  >
                    {predictionLoading ? (
                      <>
                        <Loader2 className="h-4 w-4 animate-spin text-white" /> Inferring...
                      </>
                    ) : (
                      <>
                        Run Classifier Inference <ChevronRight className="h-4 w-4" />
                      </>
                    )}
                  </button>
                </div>
              </div>
            )}

            {predictionStep === 3 && predictionResult && (
              <div className="py-4 space-y-4 text-center">
                <CheckCircle2 className="h-10 w-10 text-teal-600 mx-auto" />
                <div className="max-w-md mx-auto space-y-1.5">
                  <h4 className="text-xs font-bold text-gray-900 uppercase tracking-wider">Inference Analysis Completed</h4>
                  <p className="text-[11px] text-gray-500 leading-relaxed">
                    Outcome classifications calculated. Metrics updated in logs.
                  </p>
                </div>
                <div className="p-4 bg-gray-50/40 border border-gray-200 rounded-xl max-w-sm mx-auto space-y-2 text-left">
                  <div className="flex justify-between text-xs">
                    <span className="text-gray-500">Classified Outcome:</span>
                    <span className="font-bold text-gray-900">{predictionResult.risk_level} Risk</span>
                  </div>
                  <div className="flex justify-between text-xs">
                    <span className="text-gray-500">Probability score:</span>
                    <span className="font-bold text-gray-900">{(predictionResult.risk_probability * 100).toFixed(1)}%</span>
                  </div>
                </div>
                <button 
                  type="button" 
                  onClick={() => setPredictionStep(2)}
                  className="px-6 py-2 bg-white hover:bg-gray-100 border border-gray-200 text-gray-700 rounded-xl text-xs font-bold transition mt-4"
                >
                  Configure New Test
                </button>
              </div>
            )}
          </form>
        </div>

        {/* Prediction Output panel */}
        <div className="saas-card p-6 rounded-2xl flex flex-col justify-between relative overflow-hidden shadow-sm">
          <div>
            <h3 className="text-sm font-bold text-gray-900 border-b border-gray-200 pb-3">Outcome Metrics</h3>
            
            {predictionResult ? (
              <div className="space-y-5 pt-4">
                <div className="text-center space-y-1">
                  <p className="text-[10px] text-gray-500 uppercase tracking-widest">Calculated Risk Level</p>
                  <p className={`text-2xl font-black ${
                    predictionResult.risk_level === 'High' 
                      ? 'text-red-400' 
                      : predictionResult.risk_level === 'Medium' 
                        ? 'text-amber-600' 
                        : 'text-teal-600'
                  }`}>
                    {predictionResult.risk_level} Risk
                  </p>
                </div>

                <div className="space-y-2">
                  <div className="flex justify-between text-xs font-semibold">
                    <span className="text-gray-500">Risk Probability</span>
                    <span className="text-gray-800">{(predictionResult.risk_probability * 100).toFixed(1)}%</span>
                  </div>
                  <div className="w-full h-1.5 bg-gray-200 rounded-full overflow-hidden">
                    <div 
                      className={`h-full rounded-full transition-all duration-500 ${
                        predictionResult.risk_level === 'High' 
                          ? 'bg-red-500' 
                          : predictionResult.risk_level === 'Medium' 
                            ? 'bg-amber-500' 
                            : 'bg-emerald-500'
                      }`}
                      style={{ width: `${predictionResult.risk_probability * 100}%` }}
                    />
                  </div>
                </div>

                <div className="space-y-2 pt-2 text-xs">
                  <div className="flex justify-between py-1.5 border-b border-gray-200/50">
                    <span className="text-gray-500">Inference Confidence</span>
                    <span className="text-gray-900 font-semibold">{(predictionResult.confidence * 100).toFixed(1)}%</span>
                  </div>
                  <div className="flex justify-between py-1.5 border-b border-gray-200/50">
                    <span className="text-gray-500">Model Framework</span>
                    <span className="text-gray-900 font-semibold">RandomForest (sklearn)</span>
                  </div>
                </div>
              </div>
            ) : (
              <div className="h-48 flex flex-col items-center justify-center text-center text-gray-400 space-y-2">
                <Stethoscope className="h-8 w-8 text-gray-500 animate-pulse" />
                <p className="text-xs">Adjust variables in step 2 to retrieve risk parameters.</p>
              </div>
            )}
          </div>

          <div className="p-3.5 bg-indigo-500/5 border border-indigo-500/10 rounded-xl mt-6">
            <p className="text-[10px] text-gray-400 text-center leading-relaxed">
              Demonstration only. Cortex Intel models utilize generic open datasets and are not suited for direct diagnostics.
            </p>
          </div>
        </div>
      </div>
    );
  };

  const renderAI = () => {
    const parseBold = (text: string) => {
      const parts = text.split(/\*\*(.*?)\*\*/g);
      return parts.map((part, i) => {
        if (i % 2 === 1) {
          return <strong key={i} className="font-extrabold text-gray-900 bg-gray-100 px-1 py-0.5 rounded">{part}</strong>;
        }
        return part;
      });
    };

    const formatMessageText = (text: string) => {
      const lines = text.split('\n');
      let inList = false;
      let listItems: React.ReactNode[] = [];
      const renderedElements: React.ReactNode[] = [];

      lines.forEach((line, idx) => {
        const trimmed = line.trim();
        if (!trimmed) {
          if (inList) {
            renderedElements.push(<ul key={`list-${idx}`} className="space-y-1 my-2 list-disc list-inside">{...listItems}</ul>);
            listItems = [];
            inList = false;
          }
          renderedElements.push(<div key={`space-${idx}`} className="h-2" />);
          return;
        }

        // Headers
        if (trimmed.startsWith('###')) {
          if (inList) {
            renderedElements.push(<ul key={`list-${idx}`} className="space-y-1 my-2 list-disc list-inside">{...listItems}</ul>);
            listItems = [];
            inList = false;
          }
          renderedElements.push(<h4 key={idx} className="text-xs font-bold text-gray-900 uppercase tracking-wider mt-4 mb-2 flex items-center gap-1.5"><Sparkles className="h-3.5 w-3.5 text-blue-600" />{trimmed.replace(/^###\s*/, '')}</h4>);
          return;
        }
        if (trimmed.startsWith('##')) {
          if (inList) {
            renderedElements.push(<ul key={`list-${idx}`} className="space-y-1 my-2 list-disc list-inside">{...listItems}</ul>);
            listItems = [];
            inList = false;
          }
          renderedElements.push(<h3 key={idx} className="text-sm font-bold text-blue-700 mt-5 mb-2.5">{trimmed.replace(/^##\s*/, '')}</h3>);
          return;
        }
        if (trimmed.startsWith('#')) {
          if (inList) {
            renderedElements.push(<ul key={`list-${idx}`} className="space-y-1 my-2 list-disc list-inside">{...listItems}</ul>);
            listItems = [];
            inList = false;
          }
          renderedElements.push(<h2 key={idx} className="text-base font-black text-gray-900 mt-6 mb-3.5">{trimmed.replace(/^#\s*/, '')}</h2>);
          return;
        }

        // Bullet Lists
        if (trimmed.startsWith('-') || trimmed.startsWith('*')) {
          inList = true;
          const content = trimmed.replace(/^[-*]\s*/, '');
          listItems.push(
            <li key={`li-${idx}`} className="my-0.5 text-gray-600 hover:text-gray-900 transition-colors">
              {parseBold(content)}
            </li>
          );
          return;
        }

        // Numbered Lists
        const numMatch = trimmed.match(/^(\d+)\.\s(.*)/);
        if (numMatch) {
          inList = true;
          listItems.push(
            <li key={`li-${idx}`} className="my-0.5 text-gray-700 hover:text-gray-900 transition-colors list-none">
              <span className="font-semibold text-blue-600 mr-1">{numMatch[1]}.</span>
              {parseBold(numMatch[2])}
            </li>
          );
          return;
        }

        // Standard Paragraph
        if (inList) {
          renderedElements.push(<ul key={`list-${idx}`} className="space-y-1 my-2 list-disc list-inside">{...listItems}</ul>);
          listItems = [];
          inList = false;
        }
        renderedElements.push(<p key={idx} className="my-1.5 leading-relaxed text-gray-700">{parseBold(trimmed)}</p>);
      });

      if (inList) {
        renderedElements.push(<ul key={`list-end`} className="space-y-1 my-2 list-disc list-inside">{...listItems}</ul>);
      }

      return renderedElements;
    };

    const handleCopyMessage = (text: string, idx: number) => {
      try {
        navigator.clipboard.writeText(text);
        setCopiedIdx(idx);
        setTimeout(() => setCopiedIdx(null), 2000);
        addLog("AI response copied to clipboard.");
      } catch (err) {
        console.error("Failed to copy text: ", err);
      }
    };

    const handleResetChat = () => {
      setChatHistory([
        {
          sender: 'ai',
          text: "Cortex Intel operational. I am routed to your local SQLite warehouse and scikit-learn classifiers. Ask me about recalls, country indicator indexes, or predict outcomes."
        }
      ]);
      addLog("AI Chat session reset.");
    };

    const handleSuggestionClick = (query: string) => {
      setChatInput(query);
      addLog(`AI Query sent via chip: "${query}"`);
      setChatHistory(prev => [...prev, { sender: 'user', text: query }]);
      setChatLoading(true);
      
      fetch(`${BACKEND_URL}/api/ai/ask?question=${encodeURIComponent(query)}&api_key=${encodeURIComponent(apiKey)}`, {
        method: 'POST'
      })
      .then(res => res.json())
      .then(data => {
        setChatHistory(prev => [...prev, { 
          sender: 'ai', 
          text: data.insight || "No insights found.",
          data: data.data || null
        }]);
        addLog("AI response delivered successfully.");
      })
      .catch(err => {
        setChatHistory(prev => [...prev, { 
          sender: 'ai', 
          text: "Error contacting AI server."
        }]);
        addLog("AI response request failed.");
        console.error(err);
      })
      .finally(() => {
        setChatLoading(false);
      });
    };

    const isInitialState = chatHistory.length === 1;

    return (
      <div className="flex flex-col flex-1 h-full w-full bg-white">
        <div className="flex flex-col h-full justify-between relative overflow-hidden px-4 md:px-8 py-6">
          {/* Header options inside AI Assistant workspace */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-gray-200 pb-3 mb-4">
            <div className="flex items-center justify-between w-full sm:w-auto">
              <div className="flex items-center gap-2">
                <Sparkles className="h-4.5 w-4.5 text-blue-600 animate-pulse" />
                <span className="text-xs font-bold text-gray-800 uppercase tracking-wider">Cortex Intelligence</span>
              </div>
            </div>
            <div className="flex items-center gap-3.5 flex-wrap sm:flex-nowrap justify-between w-full sm:w-auto">
              <div className="flex items-center gap-2 bg-gray-50 border border-gray-200 rounded-xl px-3 py-1.5 shadow-inner w-full sm:w-auto">
                <span className={`h-1.5 w-1.5 rounded-full ${apiKey ? 'bg-emerald-500 animate-pulse' : 'bg-amber-500'}`} />
                <input 
                  type="password" 
                  value={apiKey} 
                  onChange={e => handleApiKeyChange(e.target.value)}
                  placeholder="Paste Gemini API Key..." 
                  className="bg-transparent text-[10px] text-gray-700 focus:outline-none placeholder-gray-400 w-full sm:w-36 md:w-48 font-mono"
                  title="Configure Gemini API Key from Google AI Studio (100% Free)"
                />
                <a 
                  href="https://aistudio.google.com/" 
                  target="_blank" 
                  rel="noopener noreferrer" 
                  className="text-[10px] text-blue-600 hover:text-blue-700 transition-colors font-bold underline shrink-0"
                  title="Get a free Gemini API Key from Google AI Studio"
                >
                  Get Key
                </a>
              </div>
              {!isInitialState && (
                <button 
                  onClick={handleResetChat}
                  className="px-3 py-1.5 bg-white hover:bg-gray-100 border border-gray-200 rounded-xl text-[10px] font-bold text-gray-500 hover:text-gray-800 transition flex items-center gap-1.5 shrink-0"
                >
                  <RotateCcw className="h-3.5 w-3.5" />
                  Reset Chat
                </button>
              )}
            </div>
          </div>

          {/* Messages view */}
          <div className="flex-1 overflow-y-auto space-y-6 pr-2 mb-4 scrollbar-thin">
            {isInitialState && (
              <div className="flex flex-col items-center justify-center text-center max-w-3xl mx-auto py-6 space-y-2">
                <h2 className="text-4xl md:text-5xl font-semibold tracking-tight text-blue-700">
                  Welcome to Cortex Intelligence
                </h2>
                <h3 className="text-2xl md:text-3xl font-medium tracking-tight text-gray-500 mt-2">
                  How can I assist your clinical analysis today?
                </h3>
                <p className="text-[11px] text-gray-500 max-w-md mt-3">
                  Ask about live FDA recalls, WHO indicator comparisons, or query model features.
                </p>
                
                {/* Cortex Copilot Style Suggestion Chips */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 w-full pt-8">
                  {[
                    { text: "What are the latest Class I device recalls?", label: "FDA Recall Inquest", icon: Shield, desc: "List critical safety concerns directly from live FDA feeds" },
                    { text: "Compare health expenditures in countries", label: "WHO Expenditures", icon: Globe, desc: "Analyze life expectancy vs GDP health percentage" },
                    { text: "Explain the risk metrics of Heart Disease", label: "Diagnostic Insight", icon: Heart, desc: "Break down clinical features used in ML models" },
                    { text: "List the active machine learning models", label: "ML Classifier Specs", icon: Brain, desc: "Review scikit-learn random forest algorithms" }
                  ].map((chip, idx) => (
                    <div 
                      key={idx} 
                      onClick={() => handleSuggestionClick(chip.text)}
                      className="group relative bg-white/30 hover:bg-gray-100/40 border border-gray-200 hover:border-gray-300/80 rounded-2xl p-5 text-left cursor-pointer transition-all duration-300 hover:scale-[1.02] flex flex-col justify-between h-36 w-full shadow-lg overflow-hidden"
                    >
                      <div className="space-y-1">
                        <h4 className="text-[10px] font-bold text-gray-500 uppercase tracking-wider group-hover:text-blue-600 transition-colors">{chip.label}</h4>
                        <p className="text-xs font-semibold text-gray-800 line-clamp-2 leading-relaxed mt-1">{chip.text}</p>
                      </div>
                      <div className="flex items-center justify-between mt-3">
                        <span className="text-[10px] text-gray-400 font-medium group-hover:text-gray-500 transition-colors">{chip.desc}</span>
                        <div className="p-2 bg-gray-50 border border-gray-200 rounded-xl group-hover:bg-white/80 transition-colors">
                          <chip.icon className="h-4 w-4 text-gray-500 group-hover:text-blue-600 transition-colors" />
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {!isInitialState && chatHistory.map((msg, idx) => (
              <div key={idx} className="space-y-4">
                {msg.sender === 'user' ? (
                  /* User message */
                  <div className="flex gap-4 items-start justify-end max-w-3xl mx-auto w-full">
                    <div className="bg-white border border-gray-200 text-gray-900 rounded-2xl px-5 py-3 text-xs leading-relaxed max-w-[80%] shadow-md">
                      <p className="font-medium">{msg.text}</p>
                    </div>
                    <div className="w-8 h-8 rounded-full bg-gray-200 border border-gray-300 flex items-center justify-center flex-shrink-0 text-blue-600 text-xs font-bold">
                      UA
                    </div>
                  </div>
                ) : (
                  /* AI message */
                  <div className="flex gap-4 items-start max-w-3xl mx-auto w-full">
                    <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-blue-500 via-indigo-500 to-purple-600 flex items-center justify-center flex-shrink-0 shadow-lg">
                      <Sparkles className="h-4 w-4 text-white" />
                    </div>
                    <div className="flex-1 space-y-4 pt-1 max-w-[90%]">
                      <div className="text-gray-800 text-xs leading-relaxed space-y-2 prose prose-invert">
                        {formatMessageText(msg.text)}
                      </div>
                      
                      {/* Render Source Data if exists */}
                      {msg.data && msg.data.length > 0 && (
                        <div className="mt-4 bg-gray-50/60 border border-gray-200 rounded-2xl overflow-hidden shadow-inner">
                          <div className="px-4 py-2.5 bg-white border-b border-slate-855 flex items-center justify-between">
                            <span className="text-[10px] text-blue-600 font-bold uppercase tracking-wider">Analysis Table ({msg.data.length} records)</span>
                          </div>
                          <div className="overflow-x-auto">
                            <table className="w-full text-left text-[10px] border-collapse">
                              <thead>
                                <tr className="text-gray-400 font-bold border-b border-gray-200 bg-gray-50 uppercase tracking-wider">
                                  {Object.keys(msg.data[0]).slice(0, 5).map((key, i) => (
                                    <th key={i} className="py-2.5 px-4 font-semibold">{key.replace(/_/g, ' ')}</th>
                                  ))}
                                </tr>
                              </thead>
                              <tbody className="divide-y divide-gray-200 text-gray-600">
                                {msg.data.slice(0, 6).map((row: any, rIdx: number) => (
                                  <tr key={rIdx} className="hover:bg-white/25 transition-colors">
                                    {Object.values(row).slice(0, 5).map((val: any, cIdx: number) => (
                                      <td key={cIdx} className="py-2.5 px-4 max-w-[150px] truncate" title={String(val)}>{String(val)}</td>
                                    ))}
                                  </tr>
                                ))}
                              </tbody>
                            </table>
                          </div>
                        </div>
                      )}
                      
                      {/* Action icons below the AI message */}
                      <div className="flex items-center gap-2 pt-2 text-gray-400">
                        <button 
                          onClick={() => handleCopyMessage(msg.text, idx)}
                          className="p-1.5 hover:bg-white hover:text-gray-700 rounded-lg transition-colors flex items-center gap-1.5"
                          title="Copy response"
                        >
                          {copiedIdx === idx ? (
                            <CheckCircle2 className="h-3.5 w-3.5 text-teal-600" />
                          ) : (
                            <Copy className="h-3.5 w-3.5" />
                          )}
                          <span className="text-[9px] uppercase font-bold tracking-wider">{copiedIdx === idx ? 'Copied!' : 'Copy'}</span>
                        </button>
                        <button className="p-1.5 hover:bg-white hover:text-gray-700 rounded-lg transition-colors" title="Good response">
                          <ThumbsUp className="h-3.5 w-3.5" />
                        </button>
                        <button className="p-1.5 hover:bg-white hover:text-gray-700 rounded-lg transition-colors" title="Bad response">
                          <ThumbsDown className="h-3.5 w-3.5" />
                        </button>
                        <button className="p-1.5 hover:bg-white hover:text-gray-700 rounded-lg transition-colors" title="Share">
                          <Share2 className="h-3.5 w-3.5" />
                        </button>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            ))}
            
            {chatLoading && (
              <div className="flex items-start gap-4 max-w-3xl mx-auto w-full animate-pulse">
                <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-blue-500 to-indigo-600 flex items-center justify-center flex-shrink-0 shadow-lg">
                  <Sparkles className="h-4 w-4 text-white" />
                </div>
                <div className="space-y-3.5 flex-1 max-w-[85%] pt-1">
                  <div className="h-4 w-1/3 rounded-md bg-blue-600"></div>
                  <div className="h-3.5 w-3/4 rounded-md bg-blue-600 opacity-80"></div>
                  <div className="h-3.5 w-1/2 rounded-md bg-blue-600 opacity-60"></div>
                </div>
              </div>
            )}
          </div>

          {/* Centered Floating Pill Input Bar (Google Gemini style) */}
          <div className="w-full max-w-3xl mx-auto pt-4 border-t border-gray-200/40">
            <form onSubmit={handleAskAI} className="flex items-center bg-gray-50 border border-gray-200 rounded-full px-5 py-3 focus-within:border-indigo-500/80 focus-within:ring-2 focus-within:ring-indigo-500/20 shadow-2xl transition-all">
              <button type="button" className="p-1 hover:bg-white text-gray-400 hover:text-blue-600 rounded-full transition-colors mr-2" title="Add files">
                <Plus className="h-4 w-4" />
              </button>
              <input 
                type="text" 
                value={chatInput}
                onChange={e => setChatInput(e.target.value)}
                placeholder="Ask Cortex Intel or enter a prompt here..." 
                className="flex-1 bg-transparent text-gray-800 text-xs focus:outline-none placeholder-gray-400 pr-4"
              />
              <div className="flex items-center gap-1.5">
                <button type="button" className="p-1.5 hover:bg-white text-gray-400 hover:text-blue-600 rounded-full transition-colors mr-1" title="Use microphone" onClick={() => addLog("Voice dictation is simulated. Please type your query.")}>
                  <Mic className="h-4 w-4" />
                </button>
                <button 
                  type="submit" 
                  disabled={chatLoading || !chatInput.trim()}
                  className={`p-2 rounded-full transition-all flex items-center justify-center shadow-md ${
                    chatInput.trim() 
                      ? 'bg-blue-600 hover:bg-indigo-500 text-white hover:scale-105' 
                      : 'bg-white text-gray-500 cursor-not-allowed'
                  }`}
                >
                  <Send className="h-3.5 w-3.5" />
                </button>
              </div>
            </form>
            <div className="text-center mt-2.5">
              <p className="text-[9px] text-gray-400 font-medium tracking-wide">
                Cortex Intel Gemini can make mistakes. Verify critical clinical and FDA details with primary publications.
              </p>
            </div>
          </div>
        </div>
      </div>
    );
  };

  const tabs = [
    { id: 'overview', label: 'Executive Overview', icon: Activity },
    { id: 'devices', label: 'Device Intelligence', icon: Shield },
    { id: 'health', label: 'Global Health', icon: Globe },
    { id: 'patients', label: 'Patient Risk', icon: Heart },
    { id: 'ai', label: 'AI Assistant', icon: Brain },
  ];

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50 space-y-4">
        <Activity className="h-10 w-10 text-blue-600 animate-spin" />
        <p className="text-[10px] text-gray-500 font-bold uppercase tracking-widest animate-pulse">Initializing Platform Warehouse...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col">
      {/* Top Header */}
      <header className="saas-card border-b border-gray-200 sticky top-0 z-50">
        <div className="px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button 
              onClick={() => setSidebarOpen(!sidebarOpen)}
              className="p-1.5 bg-white hover:bg-gray-100 border border-gray-200 rounded-xl text-gray-500 hover:text-gray-800 transition-all hover:scale-105"
              title="Toggle sidebar"
            >
              <Menu className="h-4 w-4 text-blue-600" />
            </button>
            <Activity className="h-6 w-6 text-blue-600 animate-float" />
            <h1 className="text-lg font-black tracking-tight text-gray-900 flex items-center gap-1.5">
              Cortex <span className="text-blue-600 font-semibold">Intel</span>
            </h1>
            <span className="text-[9px] bg-emerald-500/10 text-teal-600 border border-emerald-500/20 px-2.5 py-0.5 rounded-full font-bold">
              100% FREE AI
            </span>
          </div>
          <div className="flex items-center gap-4 text-xs">
            <span className="font-semibold text-gray-400 font-mono hidden md:inline">{new Date().toLocaleDateString()}</span>
            <div className="w-8 h-8 rounded-full bg-white border border-gray-200 flex items-center justify-center">
              <User className="h-4 w-4 text-blue-600" />
            </div>
          </div>
        </div>
      </header>

      {/* Split Navigation Main Content */}
      <div className="flex flex-1 overflow-hidden">
        {/* Sidebar Navigation */}
        <aside className={`saas-card border-r border-gray-200 min-h-screen transition-all duration-300 ${
          sidebarOpen ? 'w-64 block' : 'w-0 hidden'
        }`}>
          <nav className="p-4 space-y-1">
            {tabs.map((tab) => (
              <button 
                key={tab.id} 
                onClick={() => setActiveTab(tab.id)}
                className={`w-full flex items-center gap-3 px-4 py-3.5 rounded-xl text-xs font-bold tracking-wide transition-all ${
                  activeTab === tab.id 
                    ? 'bg-gradient-to-r from-indigo-500/15 to-purple-500/5 text-blue-700 border-l-4 border-indigo-500 shadow-inner' 
                    : 'text-gray-500 hover:text-gray-800 hover:bg-white/20'
                }`}
              >
                <tab.icon className="h-4 w-4" />
                {tab.label}
              </button>
            ))}
          </nav>
        </aside>

        {/* Dynamic Display Board & Live Logs */}
        <div className="flex-1 flex flex-col overflow-y-auto">
          {/* Main Dashboard Panel */}
          <main className={`flex-1 w-full mx-auto ${activeTab === 'ai' ? 'p-0 max-w-full flex flex-col h-full' : 'p-6 max-w-7xl space-y-6'}`}>
            <div className={`flex items-center justify-between ${activeTab === 'ai' ? 'hidden' : ''}`}>
              <h2 className="text-xl font-black text-gray-900 tracking-tight">
                {tabs.find(t => t.id === activeTab)?.label}
              </h2>
            </div>
            
            {activeTab === 'overview' && renderOverview()}
            {activeTab === 'devices' && renderDevices()}
            {activeTab === 'health' && renderHealth()}
            {activeTab === 'patients' && renderPatients()}
            {activeTab === 'ai' && renderAI()}
          </main>

          {/* Live Terminal Activity Logger */}
          <footer className="saas-card border-t border-gray-200 p-4 bg-gray-50/60 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
            <div className="flex items-center gap-2 text-xs text-blue-600 font-bold">
              <Terminal className="h-4 w-4 animate-pulse" /> Live Activity Log
            </div>
            <div className="flex-1 text-[11px] font-mono text-gray-400 max-h-16 overflow-y-auto w-full max-w-3xl pr-4">
              {logs.map((log, idx) => (
                <div key={idx} className={idx === 0 ? 'text-blue-700 font-semibold' : ''}>{log}</div>
              ))}
            </div>
          </footer>
        </div>
      </div>
    </div>
  );
}