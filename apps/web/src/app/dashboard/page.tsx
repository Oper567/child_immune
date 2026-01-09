'use client';

import { useEffect, useState } from 'react';
import { Users, Syringe, AlertCircle, Phone, CheckCircle2, RefreshCw } from 'lucide-react';
import { useRouter } from 'next/navigation';

// 1. Configuration
const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:10000';

export default function AdminDashboard() {
  const [stats, setStats] = useState({ totalChildren: 0, vaccinesDueToday: 0, totalAdministered: 0 });
  const [dueList, setDueList] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const router = useRouter();

  const fetchData = async () => {
    const token = localStorage.getItem('token');
    
    // Redirect if not logged in
    if (!token) {
      router.push('/login');
      return;
    }

    try {
      setRefreshing(true);
      const headers = { 'Authorization': `Bearer ${token}` };

      const [statsRes, listRes] = await Promise.all([
        fetch(`${API_BASE}/api/stats`, { headers }),
        fetch(`${API_BASE}/api/due-today`, { headers })
      ]);

      if (statsRes.status === 401) router.push('/login');

      const statsData = await statsRes.json();
      const listData = await listRes.json();

      setStats(statsData);
      setDueList(listData);
    } catch (err) {
      console.error("Dashboard Sync Error:", err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleAdminister = async (recordId: string) => {
    const token = localStorage.getItem('token');
    if (!confirm("Confirm vaccination administered?")) return;
    
    try {
      const res = await fetch(`${API_BASE}/api/record/${recordId}`, {
        method: 'PATCH',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ status: 'COMPLETED' }),
      });

      if (res.ok) {
        setDueList(prev => prev.filter(item => item.id !== recordId));
        setStats(prev => ({ 
            ...prev, 
            totalAdministered: prev.totalAdministered + 1, 
            vaccinesDueToday: Math.max(0, prev.vaccinesDueToday - 1) 
        }));
      }
    } catch (err) {
      alert("Update failed. Check connection.");
    }
  };

  if (loading) return (
    <div className="flex flex-col items-center justify-center min-h-[400px] gap-4">
      <div className="w-12 h-12 border-4 border-blue-100 border-t-blue-600 rounded-full animate-spin"></div>
      <p className="text-slate-500 font-medium animate-pulse">Syncing Clinic Records...</p>
    </div>
  );

  return (
    <div className="max-w-6xl mx-auto p-4 md:p-6 space-y-6">
      <header className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-slate-900 leading-none">Clinic Overview</h1>
          <p className="text-sm text-slate-500 mt-1">Status: {refreshing ? 'Updating...' : 'Live'}</p>
        </div>
        <button 
          onClick={fetchData} 
          className="p-2 text-slate-400 hover:text-blue-600 transition-colors"
          title="Refresh Data"
        >
          <RefreshCw size={20} className={refreshing ? 'animate-spin' : ''} />
        </button>
      </header>

      {/* --- STAT CARDS --- */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <StatCard title="Total Patients" value={stats.totalChildren} icon={Users} color="bg-blue-600" />
        <StatCard title="Due Today" value={stats.vaccinesDueToday} icon={AlertCircle} color="bg-orange-500" />
        <StatCard title="Done Today" value={stats.totalAdministered} icon={Syringe} color="bg-emerald-600" />
      </div>

      {/* --- TODAY'S DUE LIST --- */}
      <div className="bg-white rounded-3xl shadow-sm border border-slate-100 overflow-hidden">
        <div className="p-5 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
          <h3 className="font-bold text-slate-800">Queue for Today</h3>
          <span className="px-3 py-1 bg-white border border-slate-200 text-slate-600 rounded-lg text-[10px] font-black uppercase tracking-widest">
            {new Date().toLocaleDateString('en-GB', { day: '2-digit', month: 'short' })}
          </span>
        </div>
        
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="hidden md:table-header-group bg-slate-50 text-slate-500 text-[11px] uppercase tracking-wider">
              <tr>
                <th className="px-6 py-4">Child Name</th>
                <th className="px-6 py-4">Vaccine</th>
                <th className="px-6 py-4">Guardian</th>
                <th className="px-6 py-4 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {dueList.length === 0 ? (
                <tr>
                  <td colSpan={4} className="px-6 py-16 text-center text-slate-400">
                    <div className="flex flex-col items-center gap-3">
                      <CheckCircle2 size={48} className="text-emerald-100" />
                      <p className="font-medium text-slate-500">All caught up for today!</p>
                    </div>
                  </td>
                </tr>
              ) : (
                dueList.map((item: any) => (
                  <tr key={item.id} className="hover:bg-blue-50/30 transition-colors flex flex-col md:table-row p-4 md:p-0">
                    <td className="px-6 py-4 border-none md:border-b">
                      <p className="font-bold text-slate-900">{item.child.firstName} {item.child.lastName}</p>
                      <p className="text-[10px] text-blue-600 font-mono font-bold tracking-tighter">{item.child.uhid}</p>
                    </td>
                    <td className="px-6 py-2 md:py-4 border-none md:border-b">
                      <span className="bg-blue-50 text-blue-700 px-3 py-1 rounded-full text-[10px] font-black uppercase">
                        {item.vaccineName}
                      </span>
                    </td>
                    <td className="px-6 py-2 md:py-4 border-none md:border-b">
                      <a href={`tel:${item.child.guardianPhone}`} className="inline-flex items-center gap-2 text-slate-600 text-sm font-medium hover:text-blue-600">
                        <Phone size={14} className="text-blue-400" /> {item.child.guardianPhone}
                      </a>
                    </td>
                    <td className="px-6 py-4 text-right border-none md:border-b">
                      <button 
                        onClick={() => handleAdminister(item.id)}
                        className="w-full md:w-auto bg-blue-600 text-white px-6 py-2.5 rounded-xl text-xs font-bold hover:bg-blue-700 transition-all shadow-md active:scale-95"
                      >
                        ADMINISTER
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

function StatCard({ title, value, icon: Icon, color }: any) {
  return (
    <div className="bg-white p-5 rounded-3xl shadow-sm border border-slate-100 flex items-center gap-4">
      <div className={`${color} p-3 rounded-2xl text-white shadow-lg`}>
        <Icon size={20} />
      </div>
      <div>
        <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">{title}</p>
        <p className="text-2xl font-black text-slate-900">{value}</p>
      </div>
    </div>
  );
}