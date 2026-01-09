"use client";

import { useState } from 'react';
import { Search, User, Phone, Hash, Calendar, CheckCircle2, Clock } from 'lucide-react';

// Step 2 logic: Use environment variable or default to localhost
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
      // Updated fetch to use API_BASE
      const res = await fetch(`${API_BASE}/api/search?query=${query}`);
      const data = await res.json();

      if (res.ok) {
        setResults(data);
      } else {
        setResults([]);
        setError(data.message || "No records found.");
      }
    } catch (err) {
      setError(`Server connection failed. Is the backend running at ${API_BASE}?`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-8">
      <div className="text-center space-y-2">
        <h1 className="text-3xl font-bold text-slate-900">Search Records</h1>
        <p className="text-slate-500">Search by Child's UHID or Guardian's Phone Number</p>
      </div>

      {/* --- Search Bar --- */}
      <form onSubmit={handleSearch} className="relative max-w-2xl mx-auto">
        <input
          type="text"
          placeholder="Enter UHID (e.g., IMM-XXXX) or Phone..."
          className="w-full pl-12 pr-4 py-4 rounded-2xl border border-slate-200 shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
        />
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
        <button 
          type="submit"
          disabled={loading}
          className="absolute right-3 top-1/2 -translate-y-1/2 bg-blue-600 text-white px-6 py-2 rounded-xl font-medium hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {loading ? "Searching..." : "Search"}
        </button>
      </form>

      {/* --- Results Area --- */}
      <div className="space-y-6">
        {error && (
          <div className="text-center p-8 bg-red-50 text-red-600 rounded-2xl border border-red-100">
            {error}
          </div>
        )}

        {results.map((child) => (
          <div key={child.id} className="bg-white rounded-3xl border border-slate-100 shadow-xl overflow-hidden transition-all hover:shadow-2xl">
            {/* Child Profile Header */}
            <div className="bg-slate-900 p-6 text-white flex flex-wrap justify-between items-center gap-4">
              <div className="flex items-center gap-4">
                <div className="w-16 h-16 bg-blue-500 rounded-2xl flex items-center justify-center text-2xl font-bold shadow-inner">
                  {child.firstName[0]}{child.lastName[0]}
                </div>
                <div>
                  <h2 className="text-2xl font-bold">{child.firstName} {child.lastName}</h2>
                  <div className="flex gap-4 text-slate-400 text-sm mt-1">
                    <span className="flex items-center gap-1"><Hash size={14}/> {child.uhid}</span>
                    <span className="flex items-center gap-1"><Phone size={14}/> {child.guardianPhone}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Vaccination Timeline */}
            <div className="p-8">
              <h3 className="text-lg font-bold text-slate-800 mb-6 flex items-center gap-2">
                <Calendar className="text-blue-500" size={20} />
                Vaccination History & Schedule
              </h3>
              <div className="relative border-l-2 border-slate-100 ml-4 space-y-8">
                {child.records?.map((rec: any) => (
                  <div key={rec.id} className="relative pl-8">
                    {/* Timeline Dot */}
                    <div className={`absolute -left-[9px] top-1 w-4 h-4 rounded-full border-2 border-white shadow-sm ${
                      rec.status === 'COMPLETED' ? 'bg-emerald-500' : 'bg-amber-400'
                    }`} />
                    
                    <div className="flex justify-between items-start bg-slate-50 p-4 rounded-xl border border-slate-100 transition-colors hover:bg-slate-100">
                      <div>
                        <p className="font-bold text-slate-800">{rec.vaccineName}</p>
                        <p className="text-sm text-slate-500 flex items-center gap-1">
                          <Calendar size={14} /> Due: {new Date(rec.nextDueDate).toLocaleDateString('en-GB')}
                        </p>
                      </div>
                      <div className={`flex items-center gap-1 px-3 py-1 rounded-full text-xs font-bold ${
                        rec.status === 'COMPLETED' ? 'bg-emerald-100 text-emerald-700' : 'bg-amber-100 text-amber-700'
                      }`}>
                        {rec.status === 'COMPLETED' ? <CheckCircle2 size={12}/> : <Clock size={12}/>}
                        {rec.status}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}