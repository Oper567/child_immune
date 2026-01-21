"use client";

import { useEffect, useState, useCallback } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import { TrendingUp, AlertCircle, CheckCircle, Map, Info, Loader2, RefreshCw, Download } from 'lucide-react';
import { motion } from 'framer-motion';
import { useRouter } from 'next/navigation';

const API_BASE = process.env.NEXT_PUBLIC_API_URL || '$\{process\.env\.NEXT_PUBLIC_API_URL\}';

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

      if (!token) {
        router.push('/login');
        return;
      }

      // Clean token and ensure standard headers
      const res = await fetch(`${API_BASE}/api/metrics`, {
        method: 'GET',
        headers: { 
          'Authorization': `Bearer ${token.replace(/"/g, '')}`,
          'Content-Type': 'application/json'
        }
      });

      if (res.status === 401) {
        localStorage.removeItem('token');
        router.push('/login');
        return;
      }

      if (!res.ok) throw new Error("Failed to synchronize with Delta Node");

      const result = await res.json();
      setData(result);
    } catch (err: any) {
      setError(err.message || "Connection failed");
    } finally {
      setLoading(false);
    }
  }, [router]);

  useEffect(() => {
    fetchMetrics();
  }, [fetchMetrics]);

  if (loading) return (
    <div className="flex flex-col items-center justify-center min-h-[80vh] gap-4">
      <Loader2 className="w-12 h-12 text-blue-600 animate-spin" />
      <p className="text-slate-500 font-black uppercase tracking-widest text-[10px] animate-pulse">Synchronizing Data Feed...</p>
    </div>
  );

  if (error) return (
    <div className="flex flex-col items-center justify-center min-h-[80vh] p-8 text-center">
      <div className="bg-red-50 p-8 rounded-[3rem] border border-red-100 max-w-sm shadow-xl shadow-red-100/50">
        <AlertCircle className="text-red-500 mx-auto mb-4" size={48} />
        <h2 className="text-xl font-black text-slate-900 uppercase tracking-tighter">Sync Failed</h2>
        <p className="text-slate-500 text-sm mt-2 mb-8 leading-relaxed">{error}</p>
        <button 
          onClick={() => fetchMetrics()} 
          className="w-full py-4 bg-slate-900 text-white rounded-2xl font-black text-xs uppercase tracking-widest flex items-center justify-center gap-2 hover:bg-slate-800 transition-all active:scale-95"
        >
          <RefreshCw size={14} /> Retry Connection
        </button>
      </div>
    </div>
  );

  // Prepare chart data: Only show completed doses for performance tracking
  const chartData = data?.vaccineStats
    ?.filter((s: any) => s.status === 'COMPLETED')
    .map((stat: any) => ({
      name: stat.vaccineName,
      administered: stat._count.id || stat._count, // Handle different Prisma return structures
    })) || [];

  return (
    <div className="space-y-8 fade-in pb-20 max-w-7xl mx-auto p-4 md:p-8">
      {/* --- HEADER --- */}
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h1 className="text-5xl font-black text-slate-900 tracking-tighter italic">HEALTH INTEL</h1>
          <p className="text-slate-500 font-bold flex items-center gap-2 mt-1 uppercase text-xs tracking-wider">
            <Map size={14} className="text-blue-600"/> Delta State Coverage Hub
          </p>
        </div>
        <div className="flex bg-emerald-50 px-5 py-3 rounded-2xl border border-emerald-100 items-center gap-3 self-start md:self-center">
            <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse" />
            <span className="text-[10px] font-black text-emerald-700 uppercase tracking-[0.2em] leading-none">Live Central Feed</span>
        </div>
      </header>

      {/* --- TOP STAT CARDS --- */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <StatCard 
          icon={<TrendingUp className="text-blue-600" />} 
          label="Coverage Rate" 
          value={data?.overallCoverage || "0%"} 
          sub="Delta Target: 95%"
          color="bg-blue-50/50" 
        />
        <StatCard 
          icon={<AlertCircle className="text-red-600" />} 
          label="Hotspot Alerts" 
          value={data?.hotspots?.length || "0"} 
          sub="Action Required Areas"
          color="bg-red-50/50" 
        />
        <StatCard 
          icon={<CheckCircle className="text-emerald-600" />} 
          label="Total Administered" 
          value={data?.totalCompleted || "0"} 
          sub="Delta Sector Total"
          color="bg-emerald-50/50" 
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* --- CHART SECTION --- */}
        <div className="lg:col-span-2 bg-white p-8 rounded-[3rem] border border-slate-100 shadow-2xl shadow-slate-200/40">
            <div className="flex items-center justify-between mb-10">
                <div>
                    <h3 className="text-2xl font-black text-slate-900 tracking-tight">Vaccine Performance</h3>
                    <p className="text-slate-400 text-xs font-bold uppercase mt-1">Doses successfully administered</p>
                </div>
                <div className="p-3 bg-slate-50 rounded-2xl text-slate-400"><Info size={20} /></div>
            </div>
            
            <div className="h-[400px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={chartData} margin={{ top: 20, right: 30, left: 0, bottom: 20 }}>
                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                        <XAxis 
                            dataKey="name" 
                            axisLine={false} 
                            tickLine={false} 
                            tick={{fill: '#94a3b8', fontSize: 10, fontWeight: 800}} 
                            dy={15} 
                        />
                        <YAxis axisLine={false} tickLine={false} tick={{fill: '#94a3b8', fontSize: 10}} />
                        <Tooltip 
                            cursor={{fill: '#f8fafc'}}
                            contentStyle={{borderRadius: '24px', border: 'none', boxShadow: '0 25px 50px -12px rgb(0 0 0 / 0.15)', padding: '16px'}}
                        />
                        <Bar dataKey="administered" radius={[12, 12, 0, 0]} barSize={45}>
                            {chartData.map((entry: any, index: number) => (
                                <Cell key={`cell-${index}`} fill={['#3b82f6', '#10b981', '#f59e0b', '#8b5cf6'][index % 4]} />
                            ))}
                        </Bar>
                    </BarChart>
                </ResponsiveContainer>
            </div>
        </div>

        {/* --- HOTSPOT LIST --- */}
        <div className="bg-slate-900 p-8 rounded-[3rem] text-white shadow-2xl flex flex-col">
            <h3 className="text-xl font-black mb-8 flex items-center gap-3">
                <AlertCircle size={24} className="text-red-400" /> 
                <span className="tracking-tight">Critical Hotspots</span>
            </h3>
            
            <div className="space-y-5 flex-1">
                {data?.hotspots?.length > 0 ? data.hotspots.map((spot: any, i: number) => (
                    <div key={i} className="p-6 bg-white/5 rounded-[2.5rem] border border-white/10 hover:bg-white/10 transition-colors cursor-default">
                        <div className="flex justify-between items-center mb-4">
                            <span className="font-black text-sm uppercase tracking-tight truncate pr-2">{spot.clinicName || "Unknown Sector"}</span>
                            <span className="text-[10px] font-black text-red-400 px-3 py-1 bg-red-400/10 rounded-full border border-red-400/20">
                                {spot._count.id || spot._count} MISSED
                            </span>
                        </div>
                        <div className="w-full bg-white/10 h-1.5 rounded-full overflow-hidden">
                            <motion.div 
                                initial={{ width: 0 }}
                                animate={{ width: `${Math.min(((spot._count.id || spot._count) / 50) * 100, 100)}%` }}
                                transition={{ duration: 1, ease: "easeOut" }}
                                className="bg-gradient-to-r from-red-600 to-red-400 h-full"
                            />
                        </div>
                    </div>
                )) : (
                    <div className="flex flex-col items-center justify-center py-20 opacity-30 text-center">
                        <CheckCircle size={48} className="mb-4" />
                        <p className="text-xs font-black uppercase tracking-[0.2em]">All sectors stabilized</p>
                    </div>
                )}
            </div>
            
            <button className="w-full mt-10 py-5 bg-blue-600 text-white rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-blue-500 shadow-xl shadow-blue-600/30 active:scale-95 transition-all flex items-center justify-center gap-2">
                <Download size={16} /> Export Strategy Data
            </button>
        </div>
      </div>
    </div>
  );
}

function StatCard({ icon, label, value, color, sub }: any) {
  return (
    <motion.div 
      whileHover={{ y: -5 }} 
      className={`${color} p-8 rounded-[3rem] border border-white/50 shadow-sm backdrop-blur-sm`}
    >
      <div className="bg-white w-16 h-16 rounded-[1.5rem] flex items-center justify-center shadow-sm mb-8">
        {icon}
      </div>
      <p className="text-slate-500 text-[10px] font-black uppercase tracking-[0.2em] leading-none">{label}</p>
      <h2 className="text-5xl font-black text-slate-900 mt-3 tracking-tighter">{value}</h2>
      <p className="text-[10px] font-bold text-slate-400 mt-3 uppercase tracking-wider">{sub}</p>
    </motion.div>
  );
}
