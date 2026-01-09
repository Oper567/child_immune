"use client";

import { useState } from 'react';
import { Search, Phone, Hash, Calendar, CheckCircle2, Clock, ChevronRight } from 'lucide-react';

const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5001';

export default function SearchPage() {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!query) return;

    setLoading(true);
    setError('');
    
    try {
      // In a real app, you'd add the Bearer token here from localStorage
      const token = localStorage.getItem('token');
      const res = await fetch(`${API_BASE}/api/search?query=${query}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await res.json();

      if (res.ok) {
        setResults(data);
      } else {
        setResults([]);
        setError(data.message || "No records found.");
      }
    } catch (err) {
      setError("Server connection failed.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 pb-24">
      {/* --- Sticky Mobile Header --- */}
      <div className="bg-white px-4 pt-6 pb-4 border-b border-slate-200 sticky top-0 z-30">
        <h1 className="text-xl font-black text-slate-900 mb-4">Find Patient</h1>
        
        <form onSubmit={handleSearch} className="relative">
          <input
            type="text"
            inputMode="text" // Better for mobile keyboards
            placeholder="Search UHID or Phone..."
            className="w-full pl-11 pr-4 py-3.5 rounded-2xl bg-slate-100 border-none shadow-inner focus:ring-2 focus:ring-blue-500 outline-none text-base"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
          <button 
            type="submit"
            disabled={loading}
            className="absolute right-2 top-1/2 -translate-y-1/2 bg-blue-600 text-white p-2 rounded-xl shadow-lg active:scale-95 transition-transform"
          >
            {loading ? <Clock className="animate-spin" size={20} /> : <ChevronRight size={20} />}
          </button>
        </form>
      </div>

      <div className="p-4 space-y-4">
        {error && (
          <div className="p-4 bg-red-50 text-red-600 rounded-2xl text-sm font-bold text-center border border-red-100">
            {error}
          </div>
        )}

        {/* --- Mobile Result Cards --- */}
        {results.map((child) => (
          <div key={child.id} className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
            {/* Header: Quick Info */}
            <div className="p-4 flex items-center gap-4 border-b border-slate-50">
              <div className="w-12 h-12 bg-blue-600 rounded-xl flex items-center justify-center text-white font-bold shrink-0">
                {child.firstName[0]}{child.lastName[0]}
              </div>
              <div className="min-w-0">
                <h2 className="text-lg font-bold text-slate-900 truncate">{child.firstName} {child.lastName}</h2>
                <div className="flex gap-3 text-[11px] font-bold text-slate-500 uppercase tracking-tighter">
                  <span className="flex items-center gap-1"><Hash size={12}/> {child.uhid}</span>
                  <span className="flex items-center gap-1 text-blue-600"><Phone size={12}/> {child.guardianPhone}</span>
                </div>
              </div>
            </div>

            {/* Content: Compact Timeline */}
            <div className="p-4 bg-slate-50/50">
              <p className="text-[10px] font-black text-slate-400 uppercase mb-3">Recent Vaccines</p>
              <div className="space-y-3">
                {child.records?.slice(0, 3).map((rec: any) => (
                  <div key={rec.id} className="flex items-center justify-between bg-white p-3 rounded-xl border border-slate-100 shadow-sm">
                    <div className="flex items-center gap-3">
                      <div className={`p-1.5 rounded-lg ${rec.status === 'COMPLETED' ? 'bg-green-50 text-green-600' : 'bg-amber-50 text-amber-600'}`}>
                        {rec.status === 'COMPLETED' ? <CheckCircle2 size={16}/> : <Clock size={16}/>}
                      </div>
                      <div>
                        <p className="text-xs font-bold text-slate-800 leading-none mb-1">{rec.vaccineName}</p>
                        <p className="text-[10px] text-slate-500">Due: {new Date(rec.nextDueDate).toLocaleDateString('en-GB')}</p>
                      </div>
                    </div>
                    <span className={`text-[9px] font-black px-2 py-1 rounded-md ${
                      rec.status === 'COMPLETED' ? 'bg-green-100 text-green-700' : 'bg-amber-100 text-amber-700'
                    }`}>
                      {rec.status}
                    </span>
                  </div>
                ))}
              </div>
              
              <button className="w-full mt-4 py-3 bg-white border border-slate-200 text-blue-600 text-xs font-black rounded-xl active:bg-slate-100 transition-colors uppercase tracking-widest">
                View Full Medical Card
              </button>
            </div>
          </div>
        ))}

        {!loading && results.length === 0 && !error && (
          <div className="flex flex-col items-center justify-center py-20 text-slate-400">
            <Search size={48} className="mb-4 opacity-20" />
            <p className="text-sm font-medium">Start typing to find a patient</p>
          </div>
        )}
      </div>
    </div>
  );
}