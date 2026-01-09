"use client";

import { useEffect, useState } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import { TrendingUp, AlertCircle, CheckCircle, Users } from 'lucide-react';
import { motion } from 'framer-motion';

export default function AnalyticsDashboard() {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchMetrics = async () => {
      const token = localStorage.getItem('token');
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/metrics`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const result = await res.json();
      setData(result);
      setLoading(false);
    };
    fetchMetrics();
  }, []);

  if (loading) return <div className="p-20 text-center animate-pulse">Calculating Health Metrics...</div>;

  // Prepare data for the Bar Chart (Vaccine Status)
  const chartData = data?.vaccineStats?.map((stat: any) => ({
    name: stat.vaccineName,
    count: stat._count.id,
    status: stat.status
  })).filter((s: any) => s.status === 'COMPLETED');

  return (
    <div className="space-y-8 fade-in pb-20">
      <header>
        <h1 className="text-3xl font-black text-slate-900 tracking-tight">Health Intelligence</h1>
        <p className="text-slate-500 font-medium">Real-time immunization coverage for Asaba</p>
      </header>

      {/* TOP STAT CARDS */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <StatCard 
          icon={<TrendingUp className="text-blue-600" />} 
          label="Coverage Rate" 
          value={data?.overallCoverage || "0%"} 
          color="bg-blue-50" 
        />
        <StatCard 
          icon={<AlertCircle className="text-red-600" />} 
          label="Hotspot Alerts" 
          value={data?.hotspots?.length || "0"} 
          color="bg-red-50" 
        />
        <StatCard 
          icon={<CheckCircle className="text-emerald-600" />} 
          label="Total Administered" 
          value={data?.vaccineStats?.reduce((acc: number, curr: any) => curr.status === 'COMPLETED' ? acc + curr._count.id : acc, 0)} 
          color="bg-emerald-50" 
        />
      </div>

      {/* CHART SECTION */}
      <div className="glass-card p-8 rounded-[32px] border border-white/50 shadow-xl shadow-slate-200/50">
        <h3 className="text-xl font-black text-slate-900 mb-6">Vaccine Completion by Type</h3>
        <div className="h-[300px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
              <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: '#64748b', fontSize: 12}} dy={10} />
              <YAxis axisLine={false} tickLine={false} tick={{fill: '#64748b', fontSize: 12}} />
              <Tooltip 
                cursor={{fill: '#f8fafc'}}
                contentStyle={{borderRadius: '16px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)'}}
              />
              <Bar dataKey="count" radius={[10, 10, 0, 0]} barSize={40}>
                {chartData?.map((entry: any, index: number) => (
                  <Cell key={`cell-${index}`} fill={index % 2 === 0 ? '#2563eb' : '#3b82f6'} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* HOTSPOT LIST */}
      <div className="glass-card p-8 rounded-[32px] border border-red-100 bg-red-50/20">
        <h3 className="text-lg font-black text-slate-900 mb-4 flex items-center gap-2">
          <AlertCircle size={20} className="text-red-500" /> Clinics with Highest Missed Doses
        </h3>
        <div className="space-y-3">
          {data?.hotspots?.map((spot: any, i: number) => (
            <div key={i} className="flex justify-between items-center p-4 bg-white rounded-2xl border border-red-50">
              <span className="font-bold text-slate-700">{spot.clinicName || "Unknown Clinic"}</span>
              <span className="text-red-600 font-black">{spot._count.id} Missed</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function StatCard({ icon, label, value, color }: any) {
  return (
    <motion.div whileHover={{ y: -5 }} className={`${color} p-6 rounded-[32px] border border-white/60 shadow-sm`}>
      <div className="bg-white w-12 h-12 rounded-2xl flex items-center justify-center shadow-sm mb-4">
        {icon}
      </div>
      <p className="text-slate-500 text-sm font-bold uppercase tracking-wider">{label}</p>
      <h2 className="text-3xl font-black text-slate-900 mt-1">{value}</h2>
    </motion.div>
  );
}