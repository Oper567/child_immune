"use client";

import { useState } from 'react';
import { Search, Phone, Hash, Calendar, CheckCircle2, Clock, ChevronRight, AlertCircle } from 'lucide-react';

const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5001';

export default function SearchPage() {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!query.trim()) return;

    setLoading(true);
    setError('');
    
    try {
      // 1. Retrieve the token stored during login
      const token = localStorage.getItem('token');

      if (!token) {
        setError("Session expired. Please log in again.");
        setLoading(false);
        return;
      }

      // 2. Fetch with Authorization Header
      const res = await fetch(`${API_BASE}/api/search?query=${query}`, {
        method: 'GET',
        headers: { 
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      const data = await res.json();

      if (res.ok) {
        setResults(data);
      } else {
        setResults([]);
        // Handle the "No token" or "Invalid token" errors specifically
        setError(data.message || data.error || "No records found.");
      }
    } catch (err) {
      setError("Unable to reach server. Please check your internet connection.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 pb-24">
      {/* --- Sticky Mobile Header --- */}
      <div className="bg-white px-4 pt-6 pb-4 border-b border-slate-200 sticky top-0 z-30 shadow-sm">
        <h1 className="text-xl font-black text-slate-900 mb-4">Find Patient</h1>
        
        <form onSubmit={handleSearch} className="relative">
          <input
            type="text"
            inputMode="search"
            placeholder="Search UHID or Phone..."
            className="w-full pl-11 pr-12 py-3.5 rounded-2xl bg-slate-100 border-none shadow-inner focus:ring-2 focus:ring-blue-500 outline-none text-base"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
          <button 
            type="submit"
            disabled={loading}
            className="absolute right-2 top-1/2 -translate-y-1/2 bg-blue-600 text-white p-2.5 rounded-xl shadow-lg active:scale-90 transition-all disabled:bg-slate-300"
          >
            {loading ? <Clock className="animate-spin" size={18} /> : <ChevronRight size={18} />}
          </button>
        </form>
      </div>

      <div className="p-4 space-y-4">
        {/* Error Alert */}
        {error && (
          <div className="p-4 bg-red-50 text-red-700 rounded-2xl text-sm font-bold flex items-center gap-3 border border-red-100 animate-in fade-in slide-in-from-top-2">
            <AlertCircle size={18} className="shrink-0" />
            <p>{error}</p>
          </div>
        )}

        {/* Results Mapping */}
        {results.map((child) => (
          <div key={child.id} className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden active:border-blue-200 transition-colors">
            {/* Child Profile Info */}
            <div className="p-4 flex items-center gap-4 border-b border-slate-50">
              <div className="w-12 h-12 bg-blue-600 rounded-xl flex items-center justify-center text-white font-bold shrink-0 shadow-md">
                {child.firstName[0]}{child.lastName[0]}
              </div>
              <div className="min-w-0 flex-1">
                <h2 className="text-lg font-bold text-slate-900 truncate uppercase tracking-tight">
                  {child.firstName} {child.lastName}
                </h2>
                <div className="flex gap-3 mt-0.5">
                  <span className="flex items-center gap-1 text-[10px] font-black text-slate-400 uppercase tracking-tighter">
                    <Hash size={12} className="text-slate-300"/> {child.uhid}
                  </span>
                  <span className="flex items-center gap-1 text-[10px] font-black text-blue-600 uppercase tracking-tighter">
                    <Phone size={12}/> {child.guardianPhone}
                  </span>
                </div>
              </div>
            </div>

            {/* Vaccine Summary Section */}
            <div className="p-4 bg-slate-50/50">
              <div className="flex justify-between items-center mb-3">
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Vaccination Status</p>
                <div className="h-1 flex-1 mx-3 bg-slate-200 rounded-full" />
              </div>
              
              <div className="space-y-2.5">
                {(child.records || []).slice(0, 2).map((rec: any) => (
                  <div key={rec.id} className="flex items-center justify-between bg-white p-3 rounded-xl border border-slate-100 shadow-sm">
                    <div className="flex items-center gap-3">
                      <div className={`p-2 rounded-lg ${rec.status === 'COMPLETED' ? 'bg-green-50 text-green-600' : 'bg-amber-50 text-amber-600'}`}>
                        {rec.status === 'COMPLETED' ? <CheckCircle2 size={14}/> : <Clock size={14}/>}
                      </div>
                      <div>
                        <p className="text-xs font-black text-slate-800 leading-none mb-1">{rec.vaccineName}</p>
                        <p className="text-[10px] font-medium text-slate-500">
                           {rec.status === 'COMPLETED' ? 'Administered' : 'Next Due'}: {new Date(rec.nextDueDate || rec.dateGiven).toLocaleDateString('en-GB')}
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
              
              <button className="w-full mt-4 py-3.5 bg-white border border-slate-200 text-blue-600 text-xs font-black rounded-xl active:bg-blue-50 active:border-blue-200 transition-all uppercase tracking-widest shadow-sm">
                Open Full Medical Card
              </button>
            </div>
          </div>
        ))}

        {/* Empty State */}
        {!loading && results.length === 0 && !error && (
          <div className="flex flex-col items-center justify-center py-24 text-slate-300">
            <div className="p-6 bg-slate-100 rounded-full mb-4">
               <Search size={40} className="opacity-40" />
            </div>
            <p className="text-sm font-bold text-slate-400">Enter a UHID or Phone Number</p>
            <p className="text-xs text-slate-400 mt-1 uppercase tracking-widest">to view patient history</p>
          </div>
        )}
      </div>
    </div>
  );
}