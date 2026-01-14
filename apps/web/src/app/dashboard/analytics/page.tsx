"use client";

import { useEffect, useState, useCallback } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import { TrendingUp, AlertCircle, CheckCircle, Map, Info, Loader2, RefreshCw } from 'lucide-react';
import { motion } from 'framer-motion';
import { useRouter } from 'next/navigation';

export default function AnalyticsDashboard() {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  const fetchMetrics = useCallback(async () => {
    setLoading(true);
    setError(null);
    
    try {
      const token = localStorage.getItem('token');

      // ✅ 1. Token Validation Check
      if (!token || token === 'undefined' || token === 'null') {
        console.error("No valid token found in storage");
        router.push('/login');
        return;
      }

      // ✅ 2. Strict Header Formatting
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/metrics`, {
        method: 'GET',
        headers: { 
          'Authorization': `Bearer ${token.replace(/"/g, '')}`, // Removes accidental quotes
          'Content-Type': 'application/json'
        }
      });

      if (res.status === 401 || res.status === 403) {
        localStorage.removeItem('token');
        router.push('/login');
        return;
      }

      if (!res.ok) {
        const errorText = await res.text();
        throw new Error(errorText || "Failed to fetch metrics");
      }

      const result = await res.json();
      setData(result);
    } catch (err: any) {
      console.error("Analytics Fetch Error:", err);
      setError(err.message || "Connection to Delta Node failed");
    } finally {
      setLoading(false);
    }
  }, [router]);

  useEffect(() => {
    fetchMetrics();
  }, [fetchMetrics]);

  if (loading) return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4">
      <Loader2 className="w-12 h-12 text-blue-600 animate-spin" />
      <p className="text-slate-500 font-bold uppercase tracking-widest text-xs animate-pulse">Synchronizing Data...</p>
    </div>
  );

  if (error) return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] p-8 text-center">
      <div className="bg-red-50 p-6 rounded-[2rem] border border-red-100 max-w-sm">
        <AlertCircle className="text-red-500 mx-auto mb-4" size={40} />
        <h2 className="text-lg font-black text-slate-900 uppercase tracking-tight">Security Sync Error</h2>
        <p className="text-slate-500 text-sm mt-2 mb-6">{error}</p>
        <button 
          onClick={() => fetchMetrics()} 
          className="w-full py-3 bg-slate-900 text-white rounded-xl font-bold text-xs uppercase tracking-widest flex items-center justify-center gap-2"
        >
          <RefreshCw size={14} /> Retry Connection
        </button>
      </div>
    </div>
  );

  const chartData = data?.vaccineStats?.filter((s: any) => s.status === 'COMPLETED').map((stat: any) => ({
    name: stat.vaccineName,
    administered: stat._count.id,
  }));

  return (
    <div className="space-y-8 fade-in pb-20 max-w-6xl mx-auto p-4 md:p-8">
      {/* HEADER SECTION */}
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-4xl font-black text-slate-900 tracking-tighter italic">HEALTH INTELLIGENCE</h1>
          <p className="text-slate-500 font-medium flex items-center gap-2 mt-1">
            <Map size={16} className="text-blue-600"/> Delta State Immunization Coverage
          </p>
        </div>
        <div className="hidden md:flex bg-emerald-50 px-4 py-2 rounded-2xl border border-emerald-100 items-center gap-3">
            <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse" />
            <span className="text-[10px] font-black text-emerald-700 uppercase tracking-widest leading-none">Live Central Feed</span>
        </div>
      </header>

      {/* TOP STAT CARDS */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <StatCard 
          icon={<TrendingUp className="text-blue-600" />} 
          label="Coverage Rate" 
          value={data?.overallCoverage || "0%"} 
          sub="Target: 95%"
          color="bg-blue-50/50" 
        />
        <StatCard 
          icon={<AlertCircle className="text-red-600" />} 
          label="Hotspot Alerts" 
          value={data?.hotspots?.length || "0"} 
          sub="Missed Doses Areas"
          color="bg-red-50/50" 
        />
        <StatCard 
          icon={<CheckCircle className="text-emerald-600" />} 
          label="Total Given" 
          value={data?.vaccineStats?.reduce((acc: number, curr: any) => curr.status === 'COMPLETED' ? acc + curr._count.id : acc, 0)} 
          sub="Obiaruku Node"
          color="bg-emerald-50/50" 
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* CHART SECTION */}
        <div className="lg:col-span-2 bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-xl shadow-slate-200/30">
            <div className="flex items-center justify-between mb-8">
                <h3 className="text-xl font-black text-slate-900 tracking-tight">Vaccine Performance</h3>
                <div className="p-2 bg-slate-50 rounded-lg"><Info size={16} className="text-slate-400" /></div>
            </div>
            <div className="h-[350px] w-full">
            <ResponsiveContainer width="100%" height="100%">
                <BarChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis 
                    dataKey="name" 
                    axisLine={false} 
                    tickLine={false} 
                    tick={{fill: '#94a3b8', fontSize: 11, fontWeight: 800}} 
                    dy={10} 
                />
                <YAxis axisLine={false} tickLine={false} tick={{fill: '#94a3b8', fontSize: 11}} />
                <Tooltip 
                    cursor={{fill: '#f8fafc'}}
                    contentStyle={{borderRadius: '20px', border: 'none', boxShadow: '0 20px 25px -5px rgb(0 0 0 / 0.1)'}}
                />
                <Bar dataKey="administered" radius={[10, 10, 0, 0]} barSize={40}>
                    {chartData?.map((entry: any, index: number) => (
                    <Cell key={`cell-${index}`} fill={['#2563eb', '#10b981', '#f59e0b', '#ef4444'][index % 4]} />
                    ))}
                </Bar>
                </BarChart>
            </ResponsiveContainer>
            </div>
        </div>

        {/* HOTSPOT LIST */}
        <div className="bg-slate-900 p-8 rounded-[2.5rem] text-white shadow-2xl">
            <h3 className="text-lg font-black mb-6 flex items-center gap-2">
            <AlertCircle size={20} className="text-red-400" /> Critical Hotspots
            </h3>
            <div className="space-y-4">
            {data?.hotspots?.length > 0 ? data.hotspots.map((spot: any, i: number) => (
                <div key={i} className="p-5 bg-white/5 rounded-[2rem] border border-white/10">
                    <div className="flex justify-between items-center mb-3">
                        <span className="font-bold text-sm truncate uppercase tracking-tighter">{spot.clinicName || "Obiaruku Sector"}</span>
                        <span className="text-red-400 font-black text-xs px-2 py-1 bg-red-400/10 rounded-lg">{spot._count.id} MISSING</span>
                    </div>
                    <div className="w-full bg-white/10 h-1 rounded-full overflow-hidden">
                        <motion.div 
                            initial={{ width: 0 }}
                            animate={{ width: `${Math.min((spot._count.id / 20) * 100, 100)}%` }}
                            className="bg-red-500 h-full"
                        />
                    </div>
                </div>
            )) : (
                <div className="text-center py-10 opacity-40">
                    <CheckCircle className="mx-auto mb-2" />
                    <p className="text-xs font-bold uppercase tracking-widest">Zero hotspots detected</p>
                </div>
            )}
            </div>
            
            <button className="w-full mt-8 py-5 bg-blue-600 rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-blue-500 shadow-xl shadow-blue-600/20 active:scale-95 transition-all">
                Export Strategic Data
            </button>
        </div>
      </div>
    </div>
  );
}

function StatCard({ icon, label, value, color, sub }: any) {
  return (
    <motion.div whileHover={{ scale: 1.02 }} className={`${color} p-7 rounded-[2.5rem] border border-slate-100 shadow-sm`}>
      <div className="bg-white w-14 h-14 rounded-2xl flex items-center justify-center shadow-md mb-6">
        {icon}
      </div>
      <p className="text-slate-500 text-[11px] font-black uppercase tracking-widest leading-none">{label}</p>
      <h2 className="text-4xl font-black text-slate-900 mt-2 tracking-tighter">{value}</h2>
      <p className="text-[10px] font-bold text-slate-400 mt-2 uppercase">{sub}</p>
    </motion.div>
  );
}