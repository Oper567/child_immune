"use client"; // Required for Next.js hooks like useEffect

import { useEffect, useState } from 'react';
import { Users, Syringe, AlertCircle, Phone, CheckCircle2 } from 'lucide-react';

// Step 2: Define the flexible API URL
const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5001';

export default function AdminDashboard() {
  const [stats, setStats] = useState({ totalChildren: 0, vaccinesDueToday: 0, totalAdministered: 0 });
  const [dueList, setDueList] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Fetch using the dynamic API_BASE
    Promise.all([
      fetch(`${API_BASE}/api/stats`).then(res => res.json()),
      fetch(`${API_BASE}/api/due-today`).then(res => res.json())
    ]).then(([statsData, listData]) => {
      setStats(statsData);
      setDueList(listData);
      setLoading(false);
    }).catch(err => console.error("Error loading dashboard:", err));
  }, []);

  const handleAdminister = async (recordId: string) => {
    if (!confirm("Confirm vaccination administered?")) return;
    
    try {
      const res = await fetch(`${API_BASE}/api/record/${recordId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
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
      alert("Update failed");
    }
  };

  if (loading) return (
    <div className="flex items-center justify-center min-h-[400px]">
      <div className="animate-pulse text-slate-500 font-medium">Loading Clinic Data...</div>
    </div>
  );

  return (
    <div className="max-w-6xl mx-auto p-6 space-y-8">
      <header>
        <h1 className="text-3xl font-bold text-slate-900">Clinic Overview</h1>
        <p className="text-slate-500">Real-time vaccination tracking</p>
      </header>

      {/* --- STAT CARDS --- */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <StatCard title="Total Patients" value={stats.totalChildren} icon={Users} color="bg-blue-600" />
        <StatCard title="Due Today" value={stats.vaccinesDueToday} icon={AlertCircle} color="bg-orange-500" />
        <StatCard title="Completed Today" value={stats.totalAdministered} icon={Syringe} color="bg-emerald-600" />
      </div>

      {/* --- TODAY'S DUE LIST TABLE --- */}
      <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
        <div className="p-6 border-b border-slate-100 flex justify-between items-center">
          <h3 className="text-lg font-bold text-slate-900">Scheduled for Today</h3>
          <span className="px-3 py-1 bg-slate-100 text-slate-600 rounded-full text-xs font-bold uppercase tracking-wider">
            {new Date().toLocaleDateString()}
          </span>
        </div>
        
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-slate-50 text-slate-500 text-sm">
              <tr>
                <th className="px-6 py-4">Child Name</th>
                <th className="px-6 py-4">Vaccine</th>
                <th className="px-6 py-4">Guardian Contact</th>
                <th className="px-6 py-4">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {dueList.length === 0 ? (
                <tr>
                  <td colSpan={4} className="px-6 py-12 text-center text-slate-400">
                    <div className="flex flex-col items-center">
                      <CheckCircle2 size={40} className="mb-2 opacity-20" />
                      <p>All scheduled vaccinations for today are completed!</p>
                    </div>
                  </td>
                </tr>
              ) : (
                dueList.map((item: any) => (
                  <tr key={item.id} className="hover:bg-slate-50 transition-colors">
                    <td className="px-6 py-4">
                      <p className="font-bold text-slate-900">{item.child.firstName} {item.child.lastName}</p>
                      <p className="text-xs text-blue-600 font-mono">{item.child.uhid}</p>
                    </td>
                    <td className="px-6 py-4">
                      <span className="bg-blue-50 text-blue-700 px-3 py-1 rounded-full text-xs font-bold">
                        {item.vaccineName}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <a href={`tel:${item.child.guardianPhone}`} className="flex items-center gap-2 text-slate-600 hover:text-blue-600 transition-colors">
                        <Phone size={14} /> {item.child.guardianPhone}
                      </a>
                    </td>
                    <td className="px-6 py-4">
                      <button 
                        onClick={() => handleAdminister(item.id)}
                        className="bg-emerald-50 text-emerald-700 px-4 py-2 rounded-lg text-sm font-bold hover:bg-emerald-600 hover:text-white transition-all shadow-sm active:scale-95"
                      >
                        Administer
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
    <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 flex items-center gap-5 transition-transform hover:scale-[1.02]">
      <div className={`${color} p-3 rounded-xl text-white shadow-lg`}>
        <Icon size={24} />
      </div>
      <div>
        <p className="text-sm text-slate-500 font-medium">{title}</p>
        <p className="text-3xl font-bold text-slate-900 tracking-tight">{value}</p>
      </div>
    </div>
  );
}