"use client";

import { useEffect, useState, useCallback } from 'react';
import { Users, Syringe, AlertCircle, Phone, CheckCircle2, RefreshCw, MapPin, Loader2, ArrowRight, LogOut } from 'lucide-react';
import { useRouter } from 'next/navigation';

// Ensure this environment variable is set in your Render/Vercel dashboard
const API_BASE = process.env.NEXT_PUBLIC_API_URL || '$\{process\.env\.NEXT_PUBLIC_API_URL\}';

export default function AdminDashboard() {
  const [stats, setStats] = useState({ totalChildren: 0, vaccinesDueToday: 0, totalAdministered: 0 });
  const [dueList, setDueList] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [processingId, setProcessingId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  // --- 1. DATA FETCHING LOGIC ---
  const fetchData = useCallback(async () => {
    const token = localStorage.getItem('token');
    if (!token) {
      router.push('/login');
      return;
    }

    try {
      const headers = { 
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json' 
      };
      
      const [statsRes, listRes] = await Promise.all([
        fetch(`${API_BASE}/api/stats`, { headers }),
        fetch(`${API_BASE}/api/due-today`, { headers })
      ]);

      // Handle Session Expiry (401 Unauthorized)
      if (statsRes.status === 401 || listRes.status === 401) {
        handleLogout();
        return;
      }

      if (!statsRes.ok || !listRes.ok) throw new Error("Obiaruku Node Sync Failed");

      const statsData = await statsRes.json();
      const listData = await listRes.json();

      setStats(statsData);
      setDueList(Array.isArray(listData) ? listData : []);
      setError(null);
    } catch (err) {
      setError("Cannot reach Obiaruku Node. Check internet.");
    } finally {
      setLoading(false);
    }
  }, [router]);

  // --- 2. AUTHENTICATION HELPERS ---
  const handleLogout = () => {
    localStorage.removeItem('token');
    router.push('/login');
  };

  // --- 3. VACCINATION UPDATE LOGIC ---
  const handleMarkAsDone = async (record: any) => {
    const token = localStorage.getItem('token');
    if (!token) return handleLogout();
    
    setProcessingId(record.id);

    try {
      const res = await fetch(`${API_BASE}/api/records/update-vaccine`, {
        method: 'POST',
        headers: { 
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json' 
        },
        body: JSON.stringify({
          childId: record.child?.id || record.childId,
          vaccineName: record.vaccineName,
          dateGiven: new Date().toISOString() // Backend expects ISO format
        })
      });

      if (res.ok) {
        // âœ… OPTIMISTIC UI: Remove from list immediately
        setDueList(prev => prev.filter(item => item.id !== record.id));
        setStats(prev => ({ 
            ...prev, 
            totalAdministered: prev.totalAdministered + 1,
            vaccinesDueToday: Math.max(0, prev.vaccinesDueToday - 1) 
        }));
      } else {
        const errData = await res.json();
        alert(errData.error || "Update failed. Please try again.");
      }
    } catch (err) {
      alert("Network error. Check connection.");
    } finally {
      setProcessingId(null);
    }
  };

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  if (loading) return (
    <div className="flex flex-col items-center justify-center min-h-screen gap-4 bg-slate-50">
      <Loader2 className="w-12 h-12 text-emerald-600 animate-spin" />
      <p className="text-emerald-800 font-bold animate-pulse uppercase tracking-widest text-xs">Syncing Obiaruku Node...</p>
    </div>
  );

  return (
    <div className="max-w-6xl mx-auto p-4 md:p-8 space-y-8">
      {/* --- HEADER --- */}
      <header className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-emerald-600 font-black text-xs uppercase tracking-[0.2em] mb-2">
            <MapPin size={14} /> Obiaruku Central Clinic
          </div>
          <h1 className="text-3xl font-black text-slate-900 tracking-tight">Clinic Overview</h1>
        </div>
        
        <div className="flex items-center gap-3">
          {error && (
            <div className="bg-red-50 text-red-600 px-4 py-2 rounded-xl text-xs font-bold border border-red-100 flex items-center gap-2">
              <AlertCircle size={16} /> {error}
            </div>
          )}
          <button 
            onClick={handleLogout}
            className="p-3 bg-white border border-slate-100 text-slate-400 hover:text-red-500 rounded-2xl shadow-sm transition-all group"
            title="Log Out"
          >
            <LogOut size={20} />
          </button>
        </div>
      </header>

      {/* --- STAT CARDS --- */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
        <StatCard title="Total Registered" value={stats.totalChildren} icon={Users} color="bg-emerald-600" />
        <StatCard title="Due For Vaccine" value={stats.vaccinesDueToday} icon={AlertCircle} color="bg-orange-500" />
        <StatCard title="Administered" value={stats.totalAdministered} icon={Syringe} color="bg-blue-600" />
      </div>

      {/* --- QUEUE --- */}
      <div className="bg-white rounded-[2.5rem] shadow-xl shadow-slate-200/50 border border-slate-100 overflow-hidden">
        <div className="p-6 border-b border-slate-50 flex justify-between items-center bg-slate-50/30">
          <div>
            <h3 className="font-black text-slate-800 uppercase text-sm tracking-widest">Daily Vaccination Queue</h3>
            <p className="text-[10px] text-slate-400 font-bold uppercase mt-1">Status: {dueList.length} Pending</p>
          </div>
          <button onClick={fetchData} className="p-2 hover:bg-white rounded-full transition-all text-slate-400 hover:text-emerald-600">
            <RefreshCw size={20} />
          </button>
        </div>

        <div className="divide-y divide-slate-50">
          {dueList.length === 0 ? (
            <div className="py-20 text-center">
              <CheckCircle2 size={48} className="mx-auto text-emerald-100 mb-4" />
              <p className="text-slate-400 font-bold uppercase text-xs tracking-widest">No patients in queue today</p>
            </div>
          ) : (
            dueList.map((item) => (
              <div key={item.id} className="p-6 flex flex-col md:flex-row md:items-center justify-between gap-4 hover:bg-slate-50/50 transition-all group">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-emerald-100 text-emerald-700 rounded-2xl flex items-center justify-center font-black text-xl shadow-inner uppercase">
                    {item.child?.firstName?.[0] || 'P'}
                  </div>
                  <div>
                    <h4 className="font-bold text-slate-900 text-lg flex items-center gap-2">
                        {item.child?.firstName} {item.child?.lastName}
                        <button 
                            onClick={() => router.push(`/records/${item.child?.id}`)}
                            className="opacity-0 group-hover:opacity-100 transition-opacity p-1 text-slate-300 hover:text-emerald-600"
                        >
                            <ArrowRight size={16} />
                        </button>
                    </h4>
                    <span className="text-[10px] font-black text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded uppercase tracking-wider">{item.vaccineName}</span>
                  </div>
                </div>
                
                <div className="flex items-center gap-3">
                  {/* Phone link with null check */}
                  <a href={`tel:${item.child?.guardianPhone}`} className="p-3 bg-slate-100 text-slate-600 rounded-2xl hover:bg-emerald-50 hover:text-emerald-600 transition-all">
                    <Phone size={20} />
                  </a>
                  <button 
                    disabled={processingId === item.id}
                    onClick={() => handleMarkAsDone(item)}
                    className="flex-1 md:flex-none bg-slate-900 text-white px-8 py-3 rounded-2xl font-black text-xs hover:bg-emerald-600 transition-all shadow-lg active:scale-95 disabled:bg-slate-300 flex items-center justify-center min-w-[140px]"
                  >
                    {processingId === item.id ? <Loader2 size={16} className="animate-spin" /> : "MARK AS DONE"}
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}

// --- SUB-COMPONENTS ---
function StatCard({ title, value, icon: Icon, color }: any) {
  return (
    <div className="bg-white p-6 rounded-[2rem] shadow-lg shadow-slate-200/40 border border-slate-50 flex items-center gap-5 group hover:border-emerald-200 transition-all">
      <div className={`${color} p-4 rounded-2xl text-white shadow-xl group-hover:scale-110 transition-transform`}>
        <Icon size={24} />
      </div>
      <div>
        <p className="text-[10px] text-slate-400 font-black uppercase tracking-[0.15em]">{title}</p>
        <p className="text-3xl font-black text-slate-900 leading-none mt-1">{value}</p>
      </div>
    </div>
  );
}
