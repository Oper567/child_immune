"use client";

import { useEffect, useState } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell, Legend } from 'recharts';
import { TrendingUp, AlertCircle, CheckCircle, Map, Info, Loader2 } from 'lucide-react';
import { motion } from 'framer-motion';

export default function AnalyticsDashboard() {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchMetrics = async () => {
      try {
        const token = localStorage.getItem('token');
        const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/metrics`, {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        const result = await res.json();
        setData(result);
      } catch (error) {
        console.error("Failed to fetch metrics", error);
      } finally {
        setLoading(false);
      }
    };
    fetchMetrics();
  }, []);

  if (loading) return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4">
      <Loader2 className="w-12 h-12 text-blue-600 animate-spin" />
      <p className="text-slate-500 font-bold uppercase tracking-widest text-xs">Analyzing Regional Data...</p>
    </div>
  );

  // Filter completed vaccinations for the bar chart
  const chartData = data?.vaccineStats?.filter((s: any) => s.status === 'COMPLETED').map((stat: any) => ({
    name: stat.vaccineName,
    administered: stat._count.id,
  }));

  return (
    <div className="space-y-8 fade-in pb-20 max-w-6xl mx-auto p-4 md:p-8">
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-4xl font-black text-slate-900 tracking-tighter">Health Intelligence</h1>
          <p className="text-slate-500 font-medium flex items-center gap-2 mt-1">
            <Map size={16} className="text-blue-600"/> Regional Immunization Metrics • Delta State
          </p>
        </div>
        <div className="bg-white px-4 py-2 rounded-2xl border border-slate-100 shadow-sm flex items-center gap-3">
            <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse" />
            <span className="text-[10px] font-black text-slate-600 uppercase tracking-widest">Live Node Feed</span>
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
          sub="Requires Intervention"
          color="bg-red-50/50" 
        />
        <StatCard 
          icon={<CheckCircle className="text-emerald-600" />} 
          label="Total Administered" 
          value={data?.vaccineStats?.reduce((acc: number, curr: any) => curr.status === 'COMPLETED' ? acc + curr._count.id : acc, 0)} 
          sub="Cumulative Total"
          color="bg-emerald-50/50" 
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* CHART SECTION */}
        <div className="lg:col-span-2 bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-xl shadow-slate-200/40">
            <div className="flex items-center justify-between mb-8">
                <h3 className="text-xl font-black text-slate-900 tracking-tight">Vaccine Performance</h3>
                <Info size={18} className="text-slate-300" />
            </div>
            <div className="h-[350px] w-full">
            <ResponsiveContainer width="100%" height="100%">
                <BarChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis 
                    dataKey="name" 
                    axisLine={false} 
                    tickLine={false} 
                    tick={{fill: '#94a3b8', fontSize: 11, fontWeight: 700}} 
                    dy={10} 
                />
                <YAxis axisLine={false} tickLine={false} tick={{fill: '#94a3b8', fontSize: 11}} />
                <Tooltip 
                    cursor={{fill: '#f8fafc'}}
                    contentStyle={{borderRadius: '20px', border: 'none', boxShadow: '0 20px 25px -5px rgb(0 0 0 / 0.1)'}}
                />
                <Bar dataKey="administered" radius={[12, 12, 0, 0]} barSize={45}>
                    {chartData?.map((entry: any, index: number) => (
                    <Cell key={`cell-${index}`} fill={['#2563eb', '#10b981', '#f59e0b', '#ef4444'][index % 4]} />
                    ))}
                </Bar>
                </BarChart>
            </ResponsiveContainer>
            </div>
        </div>

        {/* HOTSPOT LIST */}
        <div className="bg-slate-900 p-8 rounded-[2.5rem] text-white shadow-2xl shadow-blue-900/20">
            <h3 className="text-lg font-black mb-6 flex items-center gap-2">
            <AlertCircle size={20} className="text-red-400" /> Critical Hotspots
            </h3>
            <div className="space-y-4">
            {data?.hotspots?.length > 0 ? data.hotspots.map((spot: any, i: number) => (
                <div key={i} className="p-4 bg-white/10 rounded-2xl border border-white/5 backdrop-blur-md">
                <div className="flex justify-between items-center mb-2">
                    <span className="font-bold text-sm truncate pr-2">{spot.clinicName || "Unknown Area"}</span>
                    <span className="text-red-400 font-black text-sm">{spot._count.id}</span>
                </div>
                <div className="w-full bg-white/10 h-1.5 rounded-full overflow-hidden">
                    <motion.div 
                        initial={{ width: 0 }}
                        animate={{ width: `${Math.min((spot._count.id / 20) * 100, 100)}%` }}
                        className="bg-red-500 h-full"
                    />
                </div>
                <p className="text-[10px] font-bold text-white/40 uppercase mt-2 tracking-widest">Missed Doses Frequency</p>
                </div>
            )) : (
                <p className="text-white/40 text-sm font-medium">No active hotspots detected.</p>
            )}
            </div>
            
            <button className="w-full mt-8 py-4 bg-blue-600 rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-blue-500 transition-colors">
                Generate Full Report
            </button>
        </div>
      </div>
    </div>
  );
}

function StatCard({ icon, label, value, color, sub }: any) {
  return (
    <motion.div whileHover={{ y: -5 }} className={`${color} p-6 rounded-[2.5rem] border border-slate-100 shadow-sm relative overflow-hidden`}>
      <div className="bg-white w-12 h-12 rounded-2xl flex items-center justify-center shadow-sm mb-4">
        {icon}
      </div>
      <p className="text-slate-500 text-[10px] font-black uppercase tracking-widest leading-none">{label}</p>
      <h2 className="text-3xl font-black text-slate-900 mt-2">{value}</h2>
      <p className="text-[10px] font-bold text-slate-400 mt-1">{sub}</p>
    </motion.div>
  );
}