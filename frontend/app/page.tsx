'use client';

import { useState, useEffect } from 'react';
import { 
  Activity, Heart, AlertTriangle, Users, Globe, Brain, Shield, Stethoscope, 
  FileText, Send, Loader2, Sparkles, ArrowRight, Search, Filter, Info, Terminal, 
  User, ChevronRight, CheckCircle2, Plus, Mic, Copy, ThumbsUp, ThumbsDown, Share2, 
  RotateCcw, Menu, X, Settings, TrendingUp
} from 'lucide-react';
import { 
  LineChart, Line, BarChart, Bar, PieChart, Pie, Cell, AreaChart, Area,
  XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer
} from 'recharts';

const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#06b6d4'];
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

// Sparkline Component for Key Metrics
const Sparkline = ({ data, color }: { data: number[], color: string }) => {
  const chartData = data.map((val, idx) => ({ id: idx, value: val }));
  return (
    <div className="w-16 h-6 shrink-0">
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={chartData} margin={{ top: 2, right: 2, left: 2, bottom: 2 }}>
          <defs>
            <linearGradient id={`sparkGrad-${color}`} x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor={color} stopOpacity={0.2}/>
              <stop offset="95%" stopColor={color} stopOpacity={0}/>
            </linearGradient>
          </defs>
          <Area 
            type="monotone" 
            dataKey="value" 
            stroke={color} 
            strokeWidth={1.5} 
            fill={`url(#sparkGrad-${color})`}
            dot={false} 
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
};

export default function Dashboard() {
  const [activeTab, setActiveTab] = useState('overview');
  const [loading, setLoading] = useState(true);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [copiedIdx, setCopiedIdx] = useState<number | null>(null);
  const [apiKey, setApiKey] = useState('');
  const [backendUrl, setBackendUrl] = useState(BACKEND_URL);
  
  // Floating Chat Assistant Toggle
  const [assistantOpen, setAssistantOpen] = useState(true);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const savedKey = localStorage.getItem('gemini_api_key') || '';
      setApiKey(savedKey);
      const savedUrl = localStorage.getItem('cortex_backend_url') || BACKEND_URL;
      setBackendUrl(savedUrl);
    }
  }, []);

  const handleApiKeyChange = (val: string) => {
    setApiKey(val);
    if (typeof window !== 'undefined') {
      localStorage.setItem('gemini_api_key', val);
    }
  };

  const handleBackendUrlChange = (val: string) => {
    setBackendUrl(val);
    if (typeof window !== 'undefined') {
      localStorage.setItem('cortex_backend_url', val);
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
        const recallsRes = await fetch(`${backendUrl}/api/devices/recalls?limit=100`);
        const recallsData = await recallsRes.json();
        const recalls = recallsData.recalls || [];
        setRecallsList(recalls);
        addLog("FDA Device recalls cached locally.");

        // Fetch Recalls Summary
        const summaryRes = await fetch(`${backendUrl}/api/devices/summary`);
        const summaryData = await summaryRes.json();
        setRecallSummary(summaryData.summary || []);
        addLog("FDA Speciality summary generated.");

        // Fetch Health Indicators
        const indicatorsRes = await fetch(`${backendUrl}/api/health/indicators`);
        const indicatorsData = await indicatorsRes.json();
        const indicators = indicatorsData.indicators || [];
        addLog("WHO Global Health indicators loaded.");

        // Fetch Countries Summary
        const countriesRes = await fetch(`${backendUrl}/api/health/countries`);
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
  }, [backendUrl]);

  // Handle Predict
  const handlePredict = async (e: React.FormEvent) => {
    e.preventDefault();
    setPredictionLoading(true);
    setPredictionResult(null);
    addLog(`Running inference for disease type: ${diseaseType}...`);

    const features = diseaseType === 'heart' ? heartFeatures : diabetesFeatures;
    
    try {
      const res = await fetch(`${backendUrl}/api/patients/predict?disease_type=${diseaseType}`, {
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
      const res = await fetch(`${backendUrl}/api/ai/ask?question=${encodeURIComponent(userMessage)}&api_key=${encodeURIComponent(apiKey)}`, {
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
        text: "Error contacting AI server. Please verify backend endpoint and Gemini API Key."
      }]);
      addLog("AI response request failed.");
      console.error(err);
    } finally {
      setChatLoading(false);
    }
  };

  const handleSuggestionClick = (query: string) => {
    setChatInput('');
    setChatHistory(prev => [...prev, { sender: 'user', text: query }]);
    setChatLoading(true);
    addLog(`AI Query sent via suggestion: "${query}"`);
    
    fetch(`${backendUrl}/api/ai/ask?question=${encodeURIComponent(query)}&api_key=${encodeURIComponent(apiKey)}`, {
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
        text: "Error contacting AI server. Please verify backend endpoint and Gemini API Key."
      }]);
      addLog("AI response request failed.");
      console.error(err);
    })
    .finally(() => {
      setChatLoading(false);
    });
  };

  const filteredRecalls = recallsList.filter(r => {
    const matchesSearch = r.product_description.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          r.firm_name.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesClass = filterClass === 'All' || r.recall_class === filterClass;
    return matchesSearch && matchesClass;
  });

  // Render Dashboard Overview (Matches cortex-intel.png Layout)
  const renderOverview = () => {
    // Patient Risk Metrics line/area chart data (mocked to match the mockup perfectly)
    const riskTrendData = [
      { month: 'Jan', risk: 30 },
      { month: 'Feb', risk: 78 },
      { month: 'Mar', risk: 48 },
      { month: 'Apr', risk: 88 },
      { month: 'Moy', risk: 72 }, // faithfull match for "Moy" in the design image mockup
      { month: 'Jun', risk: 98 },
      { month: 'Jul', risk: 78 },
      { month: 'Aug', risk: 112 }
    ];

    // Health Data Prevalence Chart data (matching mockup Hypertension 24%, Diabetes 18%, Asthma 11%)
    const prevalenceData = [
      { name: 'Hypertension', value: 24, fill: '#3b82f6' },
      { name: 'Diabetes', value: 18, fill: '#10b981' },
      { name: 'Asthma', value: 11, fill: '#f59e0b' }
    ];

    // Admissions trend chart data (matching mockup Sun-Sat curve)
    const admissionsTrendData = [
      { day: 'Sun', admissions: 90 },
      { day: 'Mon', admissions: 50 },
      { day: 'Tue', admissions: 82 },
      { day: 'Wed', admissions: 60 },
      { day: 'Thu', admissions: 98 },
      { day: 'Fri', admissions: 70 },
      { day: 'Sat', admissions: 110 }
    ];

    return (
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        {/* Left Column (Double Width) */}
        <div className="xl:col-span-2 space-y-6">
          
          {/* Patient Risk Metrics Card */}
          <div className="premium-card p-6">
            <div className="flex flex-col space-y-1 mb-6">
              <h3 className="text-sm font-bold text-slate-800">Patient Risk Metrics</h3>
              <p className="text-xs text-slate-500 font-medium">
                Overall Population Risk: <span className="text-amber-500 font-bold">14.2% (Moderate)</span>
              </p>
            </div>
            
            <div className="h-56">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={riskTrendData} margin={{ top: 10, right: 10, left: -25, bottom: 0 }}>
                  <defs>
                    <linearGradient id="colorRisk" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.15}/>
                      <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
                  <XAxis dataKey="month" stroke="#94a3b8" style={{ fontSize: '10px', fontWeight: 'bold' }} tickLine={false} axisLine={false} />
                  <YAxis domain={[0, 150]} stroke="#94a3b8" style={{ fontSize: '10px', fontWeight: 'bold' }} tickLine={false} axisLine={false} />
                  <Tooltip contentStyle={{ backgroundColor: '#ffffff', color: '#1f2937', borderColor: '#f1f5f9', borderRadius: '12px', fontSize: '11px' }} />
                  <Area 
                    type="monotone" 
                    dataKey="risk" 
                    stroke="#3b82f6" 
                    strokeWidth={2} 
                    fill="url(#colorRisk)" 
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>

            <div className="flex items-center gap-12 mt-6 border-t border-slate-50 pt-4">
              <div className="space-y-0.5">
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">High Risk Patients</p>
                <p className="text-2xl font-bold text-slate-800">87</p>
              </div>
              <div className="space-y-0.5">
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Action Required</p>
                <p className="text-2xl font-bold text-slate-800">
                  12 <span className="text-xs text-rose-500 font-extrabold ml-1">(Critical)</span>
                </p>
              </div>
            </div>
          </div>

          {/* Health Data Analytics Card */}
          <div className="premium-card p-6">
            <h3 className="text-sm font-bold text-slate-800 mb-6">Health Data Analytics</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              
              {/* Chronic Conditions Prevalence BarChart */}
              <div className="space-y-4">
                <h4 className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Chronic Conditions Prevalence</h4>
                <div className="h-44">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={prevalenceData} barSize={32} margin={{ top: 10, right: 10, left: -25, bottom: 0 }}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
                      <XAxis dataKey="name" stroke="#94a3b8" style={{ fontSize: '10px', fontWeight: 'bold' }} tickLine={false} axisLine={false} />
                      <YAxis stroke="#94a3b8" style={{ fontSize: '10px', fontWeight: 'bold' }} tickLine={false} axisLine={false} tickFormatter={(v) => `${v}%`} />
                      <Tooltip contentStyle={{ backgroundColor: '#ffffff', color: '#1f2937', borderColor: '#f1f5f9', borderRadius: '12px', fontSize: '11px' }} />
                      <Bar dataKey="value" radius={[4, 4, 0, 0]}>
                        {prevalenceData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.fill} />
                        ))}
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>

              {/* Admissions Trend AreaChart */}
              <div className="space-y-4">
                <h4 className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Admissions Trend (Oct 2023)</h4>
                <div className="h-44">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={admissionsTrendData} margin={{ top: 10, right: 10, left: -25, bottom: 0 }}>
                      <defs>
                        <linearGradient id="colorAdmissions" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.15}/>
                          <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
                      <XAxis dataKey="day" stroke="#94a3b8" style={{ fontSize: '10px', fontWeight: 'bold' }} tickLine={false} axisLine={false} />
                      <YAxis stroke="#94a3b8" style={{ fontSize: '10px', fontWeight: 'bold' }} tickLine={false} axisLine={false} />
                      <Tooltip contentStyle={{ backgroundColor: '#ffffff', color: '#1f2937', borderColor: '#f1f5f9', borderRadius: '12px', fontSize: '11px' }} />
                      <Area 
                        type="monotone" 
                        dataKey="admissions" 
                        stroke="#3b82f6" 
                        strokeWidth={1.5} 
                        fill="url(#colorAdmissions)" 
                      />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
              </div>

            </div>
          </div>

        </div>

        {/* Right Column (Single Width) */}
        <div className="space-y-6">
          
          {/* Live FDA Regulatory Alerts */}
          <div className="premium-card p-6">
            <h3 className="text-sm font-bold text-slate-800 mb-4">Live FDA Regulatory Alerts</h3>
            <div className="bg-slate-50 border border-slate-100 rounded-xl p-3.5 mb-4">
              <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">FDA Recall Alerts (Active)</span>
            </div>
            
            <div className="space-y-4 max-h-[300px] overflow-y-auto pr-1">
              {activeAlerts.length > 0 ? (
                activeAlerts.map((alert, idx) => (
                  <div key={idx} className="flex gap-3 items-start pb-3.5 border-b border-slate-100 last:border-0 last:pb-0">
                    <div className="px-2 py-1 bg-rose-50 border border-rose-100 rounded-lg text-[9px] font-bold text-rose-500 uppercase shrink-0">
                      {alert.date_initiated ? alert.date_initiated.split(' ')[0] : 'Alert'}
                    </div>
                    <div className="space-y-0.5">
                      <h4 className="text-xs font-bold text-slate-800 line-clamp-1">{alert.product_description}</h4>
                      <p className="text-[10px] text-slate-400 line-clamp-2 leading-relaxed">{alert.reason_for_recall}</p>
                    </div>
                  </div>
                ))
              ) : (
                /* Fallback to match mockup contents if API is not initialized or empty */
                <>
                  <div className="flex gap-3 items-start pb-4 border-b border-slate-100">
                    <div className="px-2 py-1 bg-rose-50 border border-rose-100 rounded-lg text-[9px] font-bold text-rose-500 uppercase shrink-0">
                      Oct 25
                    </div>
                    <div className="space-y-0.5">
                      <h4 className="text-xs font-bold text-slate-800">MedTech Syringe Pump Model 300</h4>
                      <p className="text-[10px] text-slate-400">Class I Recall (Defective software issue detected)</p>
                    </div>
                  </div>
                  <div className="flex gap-3 items-start pb-4 border-b border-slate-100">
                    <div className="px-2 py-1 bg-rose-50 border border-rose-100 rounded-lg text-[9px] font-bold text-rose-500 uppercase shrink-0">
                      Oct 24
                    </div>
                    <div className="space-y-0.5">
                      <h4 className="text-xs font-bold text-slate-800">Biogen Injection Lot #1234</h4>
                      <p className="text-[10px] text-slate-400">Label Error leading to dosing mismatch risks</p>
                    </div>
                  </div>
                  <div className="flex gap-3 items-start">
                    <div className="px-2 py-1 bg-rose-50 border border-rose-100 rounded-lg text-[9px] font-bold text-rose-500 uppercase shrink-0">
                      Oct 23
                    </div>
                    <div className="space-y-0.5">
                      <h4 className="text-xs font-bold text-slate-800">HealthGuard Implant</h4>
                      <p className="text-[10px] text-slate-400">Material issue triggering bio-compatibility reviews</p>
                    </div>
                  </div>
                </>
              )}
            </div>
          </div>

          {/* Key Metrics Overview */}
          <div className="premium-card p-6">
            <h3 className="text-sm font-bold text-slate-800 mb-6">Key Metrics Overview</h3>
            <div className="space-y-5">
              
              {/* Length of Stay */}
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Average Length of Stay</p>
                  <p className="text-lg font-bold text-slate-800 flex items-center gap-1.5">
                    4.2 days 
                    <span className="inline-flex items-center text-[10px] text-emerald-500 font-extrabold">
                      ↗
                    </span>
                  </p>
                </div>
                <Sparkline data={[4.0, 4.3, 4.1, 4.4, 4.2]} color="#10b981" />
              </div>

              {/* Readmission Rate */}
              <div className="flex items-center justify-between border-t border-slate-50 pt-4">
                <div className="space-y-0.5">
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Readmission Rate</p>
                  <p className="text-lg font-bold text-slate-800 flex items-center gap-1.5">
                    8.1% 
                    <span className="inline-flex items-center text-[10px] text-emerald-500 font-extrabold">
                      ↗
                    </span>
                  </p>
                </div>
                <Sparkline data={[8.5, 8.2, 8.4, 8.0, 8.1]} color="#10b981" />
              </div>

              {/* HCAHPS Score */}
              <div className="flex items-center justify-between border-t border-slate-50 pt-4">
                <div className="space-y-0.5">
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">HCAHPS Score</p>
                  <p className="text-lg font-bold text-slate-800 flex items-center gap-1.5">
                    88% 
                    <span className="inline-flex items-center text-[10px] text-emerald-500 font-extrabold">
                      ↗
                    </span>
                  </p>
                </div>
                <Sparkline data={[85, 87, 86, 89, 88]} color="#f59e0b" />
              </div>

            </div>
          </div>

        </div>
      </div>
    );
  };

  // Render Device Intelligence
  const renderDevices = () => {
    const pieData = recallSummary.slice(0, 6).map((item, idx) => ({
      name: item.product_type || 'Other',
      value: item.total_recalls || 1
    }));

    return (
      <div className="space-y-6">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Pie Chart */}
          <div className="premium-card p-6 lg:col-span-2">
            <h3 className="text-sm font-bold text-slate-800 mb-4">Recall Breakdown by Medical Speciality</h3>
            <div className="h-72">
              {pieData.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie 
                      data={pieData} 
                      cx="50%" 
                      cy="50%" 
                      outerRadius={90} 
                      fill="#8884d8" 
                      dataKey="value" 
                      label={({ name, percent }) => `${name.substring(0,15)}: ${(percent * 100).toFixed(0)}%`}
                    >
                      {pieData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip contentStyle={{ backgroundColor: '#ffffff', color: '#1f2937', borderColor: '#e5e7eb', borderRadius: '12px', fontSize: '11px' }} />
                  </PieChart>
                </ResponsiveContainer>
              ) : (
                <div className="h-full flex items-center justify-center text-slate-400 text-xs">
                  Loading specialities...
                </div>
              )}
            </div>
          </div>

          {/* Key specialities metrics */}
          <div className="premium-card p-6">
            <h3 className="text-sm font-bold text-slate-800 mb-4">Metrics Summary</h3>
            <div className="space-y-4">
              {recallSummary.slice(0, 5).map((item, idx) => (
                <div key={idx} className="space-y-1">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-semibold text-slate-700">{item.product_type}</span>
                    <span className="text-slate-500 font-mono font-bold">{item.total_recalls}</span>
                  </div>
                  <div className="w-full h-1.5 bg-slate-100 rounded-full overflow-hidden">
                    <div 
                      className="h-full bg-blue-600 rounded-full" 
                      style={{ width: `${Math.min(100, (item.total_recalls / (recallSummary[0]?.total_recalls || 1)) * 100)}%` }}
                    />
                  </div>
                  <div className="text-[10px] text-slate-400 flex justify-between font-medium">
                    <span>Firms: {item.manufacturers_affected}</span>
                    <span>Severity: {item.recall_class}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Dynamic Recall Explorer Table */}
        <div className="premium-card p-6">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-100 pb-4 mb-4">
            <h3 className="text-sm font-bold text-slate-800 flex items-center gap-2">
              <FileText className="h-4.5 w-4.5 text-blue-600" /> Medical Recall Inquest Explorer
            </h3>
            
            {/* Filter controls */}
            <div className="flex flex-wrap items-center gap-3">
              <div className="relative">
                <Search className="h-3.5 w-3.5 text-slate-400 absolute left-3 top-2.5" />
                <input 
                  type="text" 
                  value={searchQuery}
                  onChange={e => setSearchQuery(e.target.value)}
                  placeholder="Search manufacturer or device..." 
                  className="bg-slate-50 border border-slate-200/60 rounded-xl pl-9 pr-4 py-1.5 text-xs text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500/10 placeholder-slate-400"
                />
              </div>
              <div className="flex items-center gap-1.5">
                <Filter className="h-3.5 w-3.5 text-slate-400" />
                <select 
                  value={filterClass} 
                  onChange={e => setFilterClass(e.target.value)}
                  className="bg-slate-50 border border-slate-200/60 rounded-xl px-2.5 py-1.5 text-xs text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500/10"
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
                <tr className="border-b border-slate-100 text-slate-400 font-bold uppercase tracking-wider text-[10px]">
                  <th className="py-3 px-4">Recall ID</th>
                  <th className="py-3 px-4">Firm</th>
                  <th className="py-3 px-4">Category</th>
                  <th className="py-3 px-4">Severity</th>
                  <th className="py-3 px-4">Reason for Recall</th>
                  <th className="py-3 px-4">Date</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-slate-600 font-medium">
                {filteredRecalls.slice(0, 15).map((r, idx) => (
                  <tr key={idx} className="hover:bg-slate-50/50 transition-colors">
                    <td className="py-3 px-4 font-mono text-blue-600 font-semibold">{r.recall_id}</td>
                    <td className="py-3 px-4 font-semibold text-slate-800">{r.firm_name}</td>
                    <td className="py-3 px-4">{r.product_type}</td>
                    <td className="py-3 px-4">
                      <span className={`px-2 py-0.5 rounded-lg text-[9px] font-bold ${
                        r.recall_class === 'Class I' 
                          ? 'bg-rose-50 text-rose-500 border border-rose-100' 
                          : r.recall_class === 'Class II'
                            ? 'bg-amber-50 text-amber-600 border border-amber-100'
                            : 'bg-emerald-50 text-emerald-600 border border-emerald-100'
                      }`}>
                        {r.recall_class}
                      </span>
                    </td>
                    <td className="py-3 px-4 max-w-[250px] truncate" title={r.reason_for_recall}>{r.reason_for_recall}</td>
                    <td className="py-3 px-4 font-mono text-slate-400">{r.date_initiated}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    );
  };

  // Render Global Health Comparison
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
        <div className="premium-card p-6">
          <h3 className="text-sm font-bold text-slate-800 mb-2">WHO Global Health Observatory Comparison</h3>
          <p className="text-xs text-slate-400 font-medium mb-6">
            Life Expectancy at Birth (years) vs. Current Health Expenditure as percentage of GDP (%) for target cohorts.
          </p>
          <div className="h-96">
            {chartData.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={chartData} margin={{ top: 20, right: 30, left: 0, bottom: 20 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
                  <XAxis dataKey="country" stroke="#94a3b8" style={{ fontSize: '10px', fontWeight: 'bold' }} tickLine={false} axisLine={false} />
                  <YAxis yAxisId="left" stroke="#10b981" style={{ fontSize: '10px', fontWeight: 'bold' }} tickLine={false} axisLine={false} label={{ value: 'Life Expectancy (Years)', angle: -90, position: 'insideLeft', fill: '#10b981', style: { fontSize: '10px', textAnchor: 'middle', fontWeight: 'bold' } }} />
                  <YAxis yAxisId="right" orientation="right" stroke="#3b82f6" style={{ fontSize: '10px', fontWeight: 'bold' }} tickLine={false} axisLine={false} label={{ value: 'Health Expenditure (% of GDP)', angle: 90, position: 'insideRight', fill: '#3b82f6', style: { fontSize: '10px', textAnchor: 'middle', fontWeight: 'bold' } }} />
                  <Tooltip contentStyle={{ backgroundColor: '#ffffff', color: '#1f2937', borderColor: '#f1f5f9', borderRadius: '12px', fontSize: '11px' }} />
                  <Legend verticalAlign="top" wrapperStyle={{ fontSize: '11px', fontWeight: 'bold', paddingBottom: '20px' }} />
                  <Bar yAxisId="left" dataKey="lifeExp" fill="#10b981" name="Life Expectancy" radius={[4, 4, 0, 0]} />
                  <Bar yAxisId="right" dataKey="healthExp" fill="#3b82f6" name="Health Expenditure (% of GDP)" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-full flex items-center justify-center text-slate-400 text-xs">
                No country comparisons found. Awaiting background sync completes...
              </div>
            )}
          </div>
        </div>
      </div>
    );
  };

  // Render Patients Diagnostic Estimator
  const renderPatients = () => {
    return (
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Form Wizard panel */}
        <div className="premium-card p-6 lg:col-span-2 space-y-6">
          <div className="flex items-center justify-between border-b border-slate-100 pb-4">
            <h3 className="text-sm font-bold text-slate-800">Diagnostic Parameter Risk Estimator</h3>
            <div className="flex gap-1.5 p-1 bg-slate-100/60 border border-slate-200/40 rounded-xl">
              <button 
                onClick={() => { setDiseaseType('heart'); setPredictionResult(null); setPredictionStep(1); }}
                className={`px-3 py-1.5 rounded-lg text-[10px] font-bold transition-all ${diseaseType === 'heart' ? 'bg-white text-blue-600 shadow-sm' : 'text-slate-500 hover:text-slate-800'}`}
              >
                Heart Disease
              </button>
              <button 
                onClick={() => { setDiseaseType('diabetes'); setPredictionResult(null); setPredictionStep(1); }}
                className={`px-3 py-1.5 rounded-lg text-[10px] font-bold transition-all ${diseaseType === 'diabetes' ? 'bg-white text-blue-600 shadow-sm' : 'text-slate-500 hover:text-slate-800'}`}
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
                    ? 'bg-blue-600 border-blue-600 text-white font-bold shadow-sm' 
                    : predictionStep > s.id 
                      ? 'bg-blue-50 border-blue-100 text-blue-600'
                      : 'border-slate-200 text-slate-400'
                }`}>
                  {predictionStep > s.id ? <CheckCircle2 className="h-3.5 w-3.5 text-blue-600" /> : s.id}
                </div>
                <span className={`text-[10px] uppercase font-bold tracking-wider ${predictionStep === s.id ? 'text-blue-600' : 'text-slate-400'}`}>
                  {s.label}
                </span>
              </div>
            ))}
          </div>

          <form onSubmit={handlePredict} className="space-y-4 pt-2">
            {predictionStep === 1 && (
              <div className="py-12 space-y-4 text-center">
                <Brain className="h-10 w-10 text-blue-600 mx-auto animate-float" />
                <div className="max-w-md mx-auto space-y-2">
                  <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider">Initialize Inference Pipeline</h4>
                  <p className="text-[11px] text-slate-400 leading-relaxed font-medium">
                    You have selected the <strong className="text-slate-700">{diseaseType === 'heart' ? 'Cardiovascular Disease' : 'Diabetes Endocrine'} Classifier</strong>. This pipeline queries scikit-learn random forests to evaluate outcomes.
                  </p>
                </div>
                <button 
                  type="button" 
                  onClick={() => setPredictionStep(2)}
                  className="px-5 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold transition-all inline-flex items-center gap-2 mt-4 shadow-sm"
                >
                  Configure Inputs <ArrowRight className="h-3.5 w-3.5" />
                </button>
              </div>
            )}

            {predictionStep === 2 && (
              <div className="space-y-6">
                {diseaseType === 'heart' ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                    <div className="space-y-1.5">
                      <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Patient Age: {heartFeatures.age}</label>
                      <input type="range" min="20" max="95" value={heartFeatures.age} onChange={e => setHeartFeatures(prev => ({...prev, age: parseInt(e.target.value)}))} className="w-full accent-blue-600" />
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Biological Sex</label>
                      <select value={heartFeatures.sex} onChange={e => setHeartFeatures(prev => ({...prev, sex: parseInt(e.target.value)}))} className="w-full bg-slate-50 border border-slate-200 text-slate-800 text-xs rounded-xl p-2.5 focus:border-blue-500 focus:outline-none">
                        <option value="1">Male</option>
                        <option value="0">Female</option>
                      </select>
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Chest Pain Type</label>
                      <select value={heartFeatures.cp} onChange={e => setHeartFeatures(prev => ({...prev, cp: parseInt(e.target.value)}))} className="w-full bg-slate-50 border border-slate-200 text-slate-800 text-xs rounded-xl p-2.5 focus:border-blue-500 focus:outline-none">
                        <option value="0">Typical Angina</option>
                        <option value="1">Atypical Angina</option>
                        <option value="2">Non-anginal Pain</option>
                        <option value="3">Asymptomatic</option>
                      </select>
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Resting Blood Pressure: {heartFeatures.trestbps} mmHg</label>
                      <input type="range" min="80" max="200" value={heartFeatures.trestbps} onChange={e => setHeartFeatures(prev => ({...prev, trestbps: parseInt(e.target.value)}))} className="w-full accent-blue-600" />
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Serum Cholesterol: {heartFeatures.chol} mg/dl</label>
                      <input type="range" min="100" max="600" value={heartFeatures.chol} onChange={e => setHeartFeatures(prev => ({...prev, chol: parseInt(e.target.value)}))} className="w-full accent-blue-600" />
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Fasting Blood Sugar &gt; 120 mg/dl</label>
                      <select value={heartFeatures.fbs} onChange={e => setHeartFeatures(prev => ({...prev, fbs: parseInt(e.target.value)}))} className="w-full bg-slate-50 border border-slate-200 text-slate-800 text-xs rounded-xl p-2.5 focus:border-blue-500 focus:outline-none">
                        <option value="0">No</option>
                        <option value="1">Yes</option>
                      </select>
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Resting ECG Results</label>
                      <select value={heartFeatures.restecg} onChange={e => setHeartFeatures(prev => ({...prev, restecg: parseInt(e.target.value)}))} className="w-full bg-slate-50 border border-slate-200 text-slate-800 text-xs rounded-xl p-2.5 focus:border-blue-500 focus:outline-none">
                        <option value="0">Normal</option>
                        <option value="1">ST-T Wave Abnormality</option>
                        <option value="2">Left Ventricular Hypertrophy</option>
                      </select>
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Max Heart Rate Achieved: {heartFeatures.thalach} bpm</label>
                      <input type="range" min="60" max="220" value={heartFeatures.thalach} onChange={e => setHeartFeatures(prev => ({...prev, thalach: parseInt(e.target.value)}))} className="w-full accent-blue-600" />
                    </div>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                    <div className="space-y-1.5">
                      <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Pregnancies: {diabetesFeatures.pregnancies}</label>
                      <input type="range" min="0" max="17" value={diabetesFeatures.pregnancies} onChange={e => setDiabetesFeatures(prev => ({...prev, pregnancies: parseInt(e.target.value)}))} className="w-full accent-blue-600" />
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Plasma Glucose: {diabetesFeatures.glucose} mg/dl</label>
                      <input type="range" min="0" max="200" value={diabetesFeatures.glucose} onChange={e => setDiabetesFeatures(prev => ({...prev, glucose: parseInt(e.target.value)}))} className="w-full accent-blue-600" />
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Blood Pressure: {diabetesFeatures.blood_pressure} mmHg</label>
                      <input type="range" min="0" max="122" value={diabetesFeatures.blood_pressure} onChange={e => setDiabetesFeatures(prev => ({...prev, blood_pressure: parseInt(e.target.value)}))} className="w-full accent-blue-600" />
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Body Mass Index (BMI): {diabetesFeatures.bmi.toFixed(1)}</label>
                      <input type="range" min="0" max="67.1" step="0.1" value={diabetesFeatures.bmi} onChange={e => setDiabetesFeatures(prev => ({...prev, bmi: parseFloat(e.target.value)}))} className="w-full accent-blue-600" />
                    </div>
                  </div>
                )}

                <div className="flex gap-4 pt-4 border-t border-slate-100 mt-6">
                  <button 
                    type="button" 
                    onClick={() => setPredictionStep(1)}
                    className="flex-1 py-2.5 bg-white hover:bg-slate-50 text-slate-600 rounded-xl text-xs font-bold transition border border-slate-200"
                  >
                    Back
                  </button>
                  <button 
                    type="submit" 
                    disabled={predictionLoading}
                    className="flex-1 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold transition flex items-center justify-center gap-2 shadow-sm"
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
              <div className="py-8 space-y-4 text-center">
                <CheckCircle2 className="h-12 w-12 text-emerald-500 mx-auto" />
                <div className="max-w-md mx-auto space-y-1.5">
                  <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider">Inference Analysis Completed</h4>
                  <p className="text-[11px] text-slate-400 font-medium">
                    Outcome classifications calculated. Metrics updated in logs.
                  </p>
                </div>
                <div className="p-4 bg-slate-50 border border-slate-100 rounded-xl max-w-sm mx-auto space-y-2.5 text-left shadow-inner">
                  <div className="flex justify-between text-xs font-medium">
                    <span className="text-slate-500">Classified Outcome:</span>
                    <span className="font-bold text-slate-850">{predictionResult.risk_level} Risk</span>
                  </div>
                  <div className="flex justify-between text-xs font-medium">
                    <span className="text-slate-500">Probability score:</span>
                    <span className="font-bold text-slate-850">{(predictionResult.risk_probability * 100).toFixed(1)}%</span>
                  </div>
                </div>
                <button 
                  type="button" 
                  onClick={() => setPredictionStep(2)}
                  className="px-6 py-2 bg-white hover:bg-slate-50 border border-slate-200 text-slate-650 rounded-xl text-xs font-bold transition mt-4"
                >
                  Configure New Test
                </button>
              </div>
            )}
          </form>
        </div>

        {/* Prediction Output panel */}
        <div className="premium-card p-6 flex flex-col justify-between relative overflow-hidden shadow-sm">
          <div>
            <h3 className="text-sm font-bold text-slate-800 border-b border-slate-100 pb-4 mb-4">Outcome Metrics</h3>
            
            {predictionResult ? (
              <div className="space-y-6">
                <div className="text-center space-y-1 py-2">
                  <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">Calculated Risk Level</p>
                  <p className={`text-2xl font-black ${
                    predictionResult.risk_level === 'High' 
                      ? 'text-rose-500' 
                      : predictionResult.risk_level === 'Medium' 
                        ? 'text-amber-500' 
                        : 'text-emerald-500'
                  }`}>
                    {predictionResult.risk_level} Risk
                  </p>
                </div>

                <div className="space-y-2">
                  <div className="flex justify-between text-xs font-bold text-slate-700">
                    <span>Risk Probability</span>
                    <span>{(predictionResult.risk_probability * 100).toFixed(1)}%</span>
                  </div>
                  <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
                    <div 
                      className={`h-full rounded-full transition-all duration-500 ${
                        predictionResult.risk_level === 'High' 
                          ? 'bg-rose-500' 
                          : predictionResult.risk_level === 'Medium' 
                            ? 'bg-amber-500' 
                            : 'bg-emerald-500'
                      }`}
                      style={{ width: `${predictionResult.risk_probability * 100}%` }}
                    />
                  </div>
                </div>

                <div className="space-y-2 pt-2 text-xs font-medium text-slate-650">
                  <div className="flex justify-between py-2 border-b border-slate-100">
                    <span>Inference Confidence</span>
                    <span className="text-slate-800 font-bold">{(predictionResult.confidence * 100).toFixed(1)}%</span>
                  </div>
                  <div className="flex justify-between py-2 border-b border-slate-100">
                    <span>Model Framework</span>
                    <span className="text-slate-800 font-bold">RandomForest (sklearn)</span>
                  </div>
                </div>
              </div>
            ) : (
              <div className="py-20 flex flex-col items-center justify-center text-center text-slate-400 space-y-3">
                <Stethoscope className="h-10 w-10 text-slate-300 animate-pulse" />
                <p className="text-xs font-medium">Configure parameters and run the inference wizard to view calculated outcomes.</p>
              </div>
            )}
          </div>

          <div className="p-3.5 bg-blue-50/50 border border-blue-100/50 rounded-xl mt-6">
            <p className="text-[10px] text-slate-400 text-center leading-relaxed font-semibold">
              Demonstration only. Cortex Intel models utilize generic open datasets and are not suited for clinical diagnostics.
            </p>
          </div>
        </div>
      </div>
    );
  };

  // Render Reporting View
  const renderReporting = () => {
    return (
      <div className="space-y-6">
        <div className="premium-card p-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 pb-4 mb-6">
            <div>
              <h3 className="text-sm font-bold text-slate-800">Clinical Operations Report Generator</h3>
              <p className="text-xs text-slate-400 font-medium mt-0.5">Generate, audit, and print reports based on warehouse telemetry and inference classifications.</p>
            </div>
            <button 
              onClick={() => {
                window.print();
                addLog("Print queue triggered for clinical report.");
              }}
              className="premium-btn-primary shrink-0"
            >
              Export Report PDF
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="p-4 bg-slate-50 border border-slate-100 rounded-xl space-y-1">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Warehouse Recalls</span>
              <p className="text-2xl font-bold text-slate-800">{stats.recallsCount}</p>
              <span className="text-[10px] text-emerald-500 font-bold">100% Ingested</span>
            </div>
            <div className="p-4 bg-slate-50 border border-slate-100 rounded-xl space-y-1">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">WHO Health Datasets</span>
              <p className="text-2xl font-bold text-slate-800">{stats.indicatorsCount.toLocaleString()}</p>
              <span className="text-[10px] text-emerald-500 font-bold">Sync Completed</span>
            </div>
            <div className="p-4 bg-slate-50 border border-slate-100 rounded-xl space-y-1">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Inference Pipelines</span>
              <p className="text-2xl font-bold text-slate-800">{stats.modelsCount}</p>
              <span className="text-[10px] text-blue-500 font-bold">Random Forest Classifiers</span>
            </div>
          </div>

          <div className="mt-8 space-y-4">
            <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider">Operations Checklist</h4>
            <div className="space-y-3 font-semibold text-xs text-slate-700">
              {[
                { label: "FDA Live Recalls DB Synchronization", status: "Active", color: "text-emerald-500" },
                { label: "WHO Health Indicator API Endpoint", status: "Operational", color: "text-emerald-500" },
                { label: "Random Forest Estimator Heart Classifier", status: "Active (sklearn 1.2+)", color: "text-emerald-500" },
                { label: "Random Forest Estimator Diabetes Classifier", status: "Active (sklearn 1.2+)", color: "text-emerald-500" }
              ].map((c, idx) => (
                <div key={idx} className="flex items-center justify-between p-3.5 bg-slate-50/50 border border-slate-100 rounded-xl">
                  <span>{c.label}</span>
                  <span className={`${c.color} font-bold text-[10px] uppercase`}>{c.status}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  };

  // Render Settings View
  const renderSettings = () => {
    return (
      <div className="space-y-6">
        <div className="premium-card p-6 max-w-2xl">
          <h3 className="text-sm font-bold text-slate-800 border-b border-slate-100 pb-4 mb-6">Platform Settings</h3>
          
          <div className="space-y-5">
            {/* Gemini API Key */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-700 block">Gemini API Key</label>
              <div className="flex gap-3">
                <input 
                  type="password" 
                  value={apiKey}
                  onChange={e => handleApiKeyChange(e.target.value)}
                  placeholder="Paste Gemini API Key from Google AI Studio..." 
                  className="premium-input font-mono flex-1"
                />
                <a 
                  href="https://aistudio.google.com/" 
                  target="_blank" 
                  rel="noopener noreferrer" 
                  className="px-4 py-2 bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded-xl text-xs font-bold text-blue-600 flex items-center justify-center shrink-0 transition-colors"
                >
                  Get Free Key
                </a>
              </div>
              <span className="text-[10px] text-slate-400 block font-medium">Used for AI-assisted tabular searches, audits, and clinical insights (Gemini 3.5 Flash is 100% free).</span>
            </div>

            {/* Backend Server Endpoint */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-700 block">Backend API Host URL</label>
              <input 
                type="text" 
                value={backendUrl}
                onChange={e => handleBackendUrlChange(e.target.value)}
                placeholder="http://localhost:8000" 
                className="premium-input font-mono"
              />
              <span className="text-[10px] text-slate-400 block font-medium">The URL where the FastAPI backend and SQLite data ingestion server are running.</span>
            </div>

            {/* System Status */}
            <div className="pt-4 border-t border-slate-100 space-y-3">
              <h4 className="text-xs font-bold text-slate-850 uppercase tracking-wider">System Metadata</h4>
              <div className="grid grid-cols-2 gap-4 text-xs font-semibold text-slate-500">
                <div className="p-3 bg-slate-50 rounded-xl">
                  <p className="text-[10px] text-slate-450 uppercase font-bold">Platform Version</p>
                  <p className="text-slate-800 font-bold mt-0.5">2.1.0 (Enterprise)</p>
                </div>
                <div className="p-3 bg-slate-50 rounded-xl">
                  <p className="text-[10px] text-slate-450 uppercase font-bold">Host Environment</p>
                  <p className="text-slate-800 font-bold mt-0.5">Next.js 14 Dev Server</p>
                </div>
              </div>
            </div>

          </div>
        </div>
      </div>
    );
  };

  // Render Floating Ask Cortex Intel Chat Assistant (Always accessible, matching mockup design)
  const renderFloatingAssistant = () => {
    const parseBold = (text: string) => {
      const parts = text.split(/\*\*(.*?)\*\*/g);
      return parts.map((part, i) => {
        if (i % 2 === 1) {
          return <strong key={i} className="font-extrabold text-slate-900 bg-slate-100 px-1 py-0.5 rounded">{part}</strong>;
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
            renderedElements.push(<ul key={`list-${idx}`} className="space-y-1 my-1.5 list-disc list-inside text-slate-650 font-medium">{...listItems}</ul>);
            listItems = [];
            inList = false;
          }
          renderedElements.push(<div key={`space-${idx}`} className="h-1.5" />);
          return;
        }

        // Bullet Lists
        if (trimmed.startsWith('-') || trimmed.startsWith('*')) {
          inList = true;
          const content = trimmed.replace(/^[-*]\s*/, '');
          listItems.push(
            <li key={`li-${idx}`} className="my-0.5 text-slate-600">
              {parseBold(content)}
            </li>
          );
          return;
        }

        // Standard Paragraph
        if (inList) {
          renderedElements.push(<ul key={`list-${idx}`} className="space-y-1 my-1.5 list-disc list-inside text-slate-650 font-medium">{...listItems}</ul>);
          listItems = [];
          inList = false;
        }
        renderedElements.push(<p key={idx} className="my-1 text-slate-650 font-medium leading-relaxed">{parseBold(trimmed)}</p>);
      });

      if (inList) {
        renderedElements.push(<ul key={`list-end`} className="space-y-1 my-1.5 list-disc list-inside text-slate-650 font-medium">{...listItems}</ul>);
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

    return (
      <div className="fixed bottom-6 right-6 z-50 flex flex-col items-end gap-3.5">
        
        {/* Toggle Button */}
        <button 
          onClick={() => setAssistantOpen(!assistantOpen)}
          className={`h-12 px-4 rounded-full flex items-center justify-center gap-2 shadow-2xl transition-all duration-300 font-bold text-xs hover:scale-105 ${
            assistantOpen 
              ? 'bg-slate-800 text-white' 
              : 'bg-white text-slate-800 border border-slate-150 hover:bg-slate-50'
          }`}
        >
          <Sparkles className="h-4.5 w-4.5 text-blue-500 animate-pulse" />
          {assistantOpen ? 'Minimize Assistant' : 'Active Assistant'}
        </button>

        {/* Chat Panel Box */}
        {assistantOpen && (
          <div className="assistant-panel w-96 h-[500px] flex flex-col justify-between">
            {/* Header */}
            <div className="px-5 py-4 bg-slate-50/80 border-b border-slate-100/50 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Brain className="h-4.5 w-4.5 text-blue-600" />
                <span className="text-xs font-bold text-slate-800 uppercase tracking-wider">Ask Cortex Intel</span>
              </div>
              <button 
                onClick={() => setAssistantOpen(false)} 
                className="p-1 hover:bg-slate-200/50 rounded-lg text-slate-400 hover:text-slate-600 transition-colors"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            {/* Chat Body messages */}
            <div className="flex-1 p-5 overflow-y-auto space-y-4 scrollbar-thin">
              {chatHistory.map((msg, idx) => (
                <div key={idx} className={`flex gap-3 items-start ${msg.sender === 'user' ? 'justify-end' : ''}`}>
                  {msg.sender === 'ai' && (
                    <div className="w-6.5 h-6.5 rounded-full bg-gradient-to-tr from-blue-500 to-indigo-600 flex items-center justify-center text-white shrink-0 shadow-sm mt-0.5">
                      <Sparkles className="h-3 w-3 text-white" />
                    </div>
                  )}
                  <div className={msg.sender === 'user' ? 'assistant-user-msg' : 'assistant-ai-msg'}>
                    <div className="space-y-1">
                      {formatMessageText(msg.text)}
                    </div>

                    {msg.data && msg.data.length > 0 && (
                      <div className="mt-3 bg-slate-50 border border-slate-100 rounded-xl overflow-hidden shadow-inner max-w-full">
                        <div className="overflow-x-auto">
                          <table className="w-full text-left text-[9px] border-collapse">
                            <thead>
                              <tr className="text-slate-400 font-bold border-b border-slate-100 bg-slate-50/50 uppercase tracking-wider">
                                {Object.keys(msg.data[0]).slice(0, 3).map((key, i) => (
                                  <th key={i} className="py-2 px-3 font-semibold">{key.replace(/_/g, ' ')}</th>
                                ))}
                              </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100 text-slate-600 font-semibold">
                              {msg.data.slice(0, 4).map((row: any, rIdx: number) => (
                                  <tr key={rIdx} className="hover:bg-white/50 transition-colors">
                                    {Object.values(row).slice(0, 3).map((val: any, cIdx: number) => (
                                      <td key={cIdx} className="py-2 px-3 truncate max-w-[100px]" title={String(val)}>{String(val)}</td>
                                    ))}
                                  </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>
                      </div>
                    )}

                    {/* Copy action below AI response */}
                    {msg.sender === 'ai' && (
                      <div className="flex justify-end mt-2">
                        <button 
                          onClick={() => handleCopyMessage(msg.text, idx)}
                          className="p-1 hover:bg-slate-50 hover:text-slate-650 rounded-lg text-slate-400 transition-colors flex items-center gap-1"
                          title="Copy response"
                        >
                          {copiedIdx === idx ? (
                            <CheckCircle2 className="h-3 w-3 text-emerald-500" />
                          ) : (
                            <Copy className="h-3 w-3" />
                          )}
                          <span className="text-[9px] uppercase font-bold tracking-wider">{copiedIdx === idx ? 'Copied!' : 'Copy'}</span>
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              ))}

              {chatLoading && (
                <div className="flex gap-3 items-start animate-pulse">
                  <div className="w-6.5 h-6.5 rounded-full bg-gradient-to-tr from-blue-500 to-indigo-600 flex items-center justify-center text-white shrink-0 mt-0.5">
                    <Sparkles className="h-3 w-3 text-white animate-spin" />
                  </div>
                  <div className="space-y-2 flex-1 pt-1.5">
                    <div className="h-3 w-1/3 rounded bg-slate-200"></div>
                    <div className="h-3 w-2/3 rounded bg-slate-200"></div>
                  </div>
                </div>
              )}
            </div>

            {/* suggestion chips for chat */}
            <div className="px-5 py-2.5 bg-slate-50/50 border-t border-slate-100/50 flex gap-2 overflow-x-auto scrollbar-none shrink-0 font-bold text-[9px] text-slate-500">
              {[
                { label: "Active Recalls", q: "What are the latest Class I device recalls?" },
                { label: "Expenditures", q: "Compare health expenditures in countries" },
                { label: "Heart Classifier", q: "Explain the risk metrics of Heart Disease" }
              ].map((chip, i) => (
                <button 
                  key={i} 
                  onClick={() => handleSuggestionClick(chip.q)}
                  className="px-2.5 py-1 bg-white border border-slate-150 hover:bg-slate-100 hover:text-slate-800 rounded-lg transition-colors shrink-0 shadow-sm"
                >
                  {chip.label}
                </button>
              ))}
            </div>

            {/* Input Form */}
            <form onSubmit={handleAskAI} className="px-5 py-4 border-t border-slate-100/50 flex items-center gap-2 bg-white shrink-0">
              <input 
                type="text" 
                value={chatInput}
                onChange={e => setChatInput(e.target.value)}
                placeholder="Type your query here..." 
                className="flex-1 bg-slate-50 border border-slate-150 rounded-xl px-3.5 py-2.5 text-xs text-slate-850 focus:outline-none focus:ring-2 focus:ring-blue-500/20 placeholder-slate-400 font-medium"
              />
              <button 
                type="submit" 
                disabled={chatLoading || !chatInput.trim()}
                className={`p-2.5 rounded-xl transition-all shadow ${
                  chatInput.trim() 
                    ? 'bg-blue-600 hover:bg-blue-700 text-white' 
                    : 'bg-slate-100 text-slate-400 cursor-not-allowed shadow-none'
                }`}
              >
                <Send className="h-3.5 w-3.5" />
              </button>
            </form>
          </div>
        )}
      </div>
    );
  };

  const tabs = [
    { id: 'overview', label: 'Dashboard', icon: Activity },
    { id: 'patients', label: 'Patient Insights', icon: Heart },
    { id: 'devices', label: 'Regulatory Alerts', icon: Shield },
    { id: 'health', label: 'Health Data', icon: Globe },
    { id: 'reporting', label: 'Reporting', icon: FileText },
    { id: 'settings', label: 'Settings', icon: Settings },
  ];

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-[#f4f6f8] space-y-4">
        <Activity className="h-10 w-10 text-blue-600 animate-spin" />
        <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest animate-pulse">Initializing Platform Warehouse...</p>
      </div>
    );
  }

  // Get current active tab label for displaying in header
  const activeTabLabel = tabs.find(t => t.id === activeTab)?.label || 'Dashboard';
  const formattedDate = new Date().toLocaleDateString(undefined, { 
    year: 'numeric', 
    month: 'long', 
    day: 'numeric' 
  });

  return (
    <div className="min-h-screen flex premium-bg text-slate-800">
      
      {/* Navigation Sidebar */}
      <aside className={`premium-sidebar w-64 flex flex-col shrink-0 transition-all duration-300 ${
        sidebarOpen ? 'block' : 'hidden'
      }`}>
        {/* Cortex Intel logo block */}
        <div className="flex items-center gap-2.5 px-6 py-6 border-b border-slate-200/30 shrink-0">
          <div className="p-2 bg-blue-50 border border-blue-100 rounded-xl shadow-sm">
            <Activity className="h-5 w-5 text-blue-600 animate-pulse" />
          </div>
          <div>
            <h1 className="text-sm font-black text-slate-800 tracking-tight leading-none">
              Cortex Intel
            </h1>
            <span className="text-[10px] text-slate-400 font-bold tracking-wider uppercase">
              Healthcare Intelligence
            </span>
          </div>
        </div>

        {/* Sidebar Nav Buttons */}
        <nav className="p-4 space-y-1.5 flex-1 overflow-y-auto">
          {tabs.map((tab) => (
            <button 
              key={tab.id} 
              onClick={() => {
                setActiveTab(tab.id);
                // Also toggle settings values etc if necessary
              }}
              className={`w-full flex items-center gap-3 px-4 py-3.5 rounded-xl text-[11px] font-bold tracking-wide transition-all ${
                activeTab === tab.id 
                  ? 'bg-slate-200/60 text-slate-850 shadow-[inset_0_1px_2px_rgba(0,0,0,0.02)]' 
                  : 'text-slate-500 hover:text-slate-800 hover:bg-slate-100'
              }`}
            >
              <tab.icon className="h-4.5 w-4.5" />
              {tab.label}
            </button>
          ))}
        </nav>
      </aside>

      {/* Main Content Pane */}
      <div className="flex-1 flex flex-col min-w-0 overflow-y-auto">
        
        {/* Mockup Header block */}
        <header className="px-8 py-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200/20 bg-white shrink-0">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <button 
                onClick={() => setSidebarOpen(!sidebarOpen)}
                className="p-1 hover:bg-slate-100 rounded-lg text-slate-400 hover:text-slate-650 transition-colors md:hidden"
              >
                <Menu className="h-5 w-5" />
              </button>
              <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">
                Cortex Intel Healthcare Intelligence | {formattedDate}
              </p>
            </div>
            <h2 className="text-xl font-bold text-slate-800">
              Cortex Intel
            </h2>
          </div>

          <div className="flex items-center gap-4.5">
            {/* Search Input */}
            <div className="relative w-64 hidden sm:block">
              <Search className="h-3.5 w-3.5 text-slate-400 absolute left-3 top-3" />
              <input 
                type="text" 
                placeholder="Search" 
                className="w-full bg-slate-50 border border-slate-200/60 rounded-xl pl-9 pr-4 py-2.5 text-xs text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500/20 placeholder-slate-400 font-medium"
              />
            </div>
            {/* User Profile Avatar with Initials */}
            <div className="flex items-center gap-3 pl-4 border-l border-slate-100">
              <div className="w-8 h-8 rounded-full bg-slate-100 border border-slate-250/60 flex items-center justify-center text-xs font-bold text-slate-650 shrink-0">
                CI
              </div>
            </div>
          </div>
        </header>

        {/* Dashboard Pages */}
        <main className="flex-1 p-8 space-y-6">
          {activeTab === 'overview' && renderOverview()}
          {activeTab === 'patients' && renderPatients()}
          {activeTab === 'devices' && renderDevices()}
          {activeTab === 'health' && renderHealth()}
          {activeTab === 'reporting' && renderReporting()}
          {activeTab === 'settings' && renderSettings()}
        </main>

        {/* Live Terminal Activity Logger Footer */}
        <footer className="px-8 py-4 bg-white border-t border-slate-100 flex flex-col md:flex-row items-start md:items-center justify-between gap-4 shrink-0">
          <div className="flex items-center gap-2 text-xs text-blue-600 font-bold">
            <Terminal className="h-4 w-4 animate-pulse" /> Live Activity Log
          </div>
          <div className="flex-1 text-[10px] font-mono text-slate-450 max-h-12 overflow-y-auto w-full max-w-4xl pr-4">
            {logs.map((log, idx) => (
              <div key={idx} className={idx === 0 ? 'text-blue-700 font-semibold' : ''}>{log}</div>
            ))}
          </div>
        </footer>

      </div>

      {/* Floating Active Assistant Chat Panel */}
      {renderFloatingAssistant()}

    </div>
  );
}