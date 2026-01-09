'use client';

import { useState } from 'react';
import { Search, Calendar, Phone, CheckCircle, Clock } from 'lucide-react';

// 1. Define the Types to fix "Any" errors
interface VaccineRecord {
  id: string;
  vaccineName: string;
  status: 'DUE' | 'COMPLETED' | 'MISSED';
  nextDueDate: string;
}

interface ChildData {
  uhid: string;
  firstName: string;
  lastName: string;
  dob: string;
  guardianPhone: string;
  records: VaccineRecord[];
}

export default function SearchChild() {
  const [uhid, setUhid] = useState('');
  const [child, setChild] = useState<ChildData | null>(null);
  const [loading, setLoading] = useState(false);

  // 2. Optimized Fetch Function
  const fetchChild = async (searchId: string) => {
    setLoading(true);
    try {
      const res = await fetch(`http://localhost:5000/api/child/${searchId.toUpperCase()}`);
      const data = await res.json();
      if (res.ok) {
        setChild(data);
      } else {
        alert(data.error || "Child not found");
        setChild(null);
      }
    } catch (err) {
      alert("Server connection failed. Is port 5000 running?");
    } finally {
      setLoading(false);
    }
  };

  // 3. Mark as Completed Function
  const markAsDone = async (recordId: string) => {
    try {
      const res = await fetch(`http://localhost:5000/api/record/${recordId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: 'COMPLETED' }),
      });
      if (res.ok && child) {
        fetchChild(child.uhid); // Refresh data
      }
    } catch (err) {
      alert("Failed to update record");
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-6">
      <form onSubmit={(e) => { e.preventDefault(); fetchChild(uhid); }} className="relative mb-10">
        <input
          type="text"
          placeholder="Enter UHID (e.g., IMU-2026-X8B2L)"
          className="w-full p-4 pl-12 rounded-xl border-2 border-blue-100 focus:border-blue-500 outline-none transition-all shadow-sm text-black"
          value={uhid}
          onChange={(e) => setUhid(e.target.value)}
        />
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
        <button 
          disabled={loading}
          className="absolute right-2 top-2 bottom-2 bg-blue-600 text-white px-6 rounded-lg hover:bg-blue-700 disabled:bg-slate-400 transition-colors"
        >
          {loading ? 'Searching...' : 'Search'}
        </button>
      </form>

      {child && (
        <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
          {/* Patient Info Card */}
          <div className="bg-white p-6 rounded-2xl shadow-lg border border-slate-100 mb-8">
            <div className="flex flex-col md:flex-row justify-between items-start gap-4">
              <div>
                <h2 className="text-3xl font-bold text-slate-900">{child.firstName} {child.lastName}</h2>
                <p className="text-blue-600 font-mono font-bold text-lg">{child.uhid}</p>
              </div>
              <div className="space-y-1 text-slate-500">
                <p className="flex items-center gap-2"><Calendar size={16}/> Born: {new Date(child.dob).toLocaleDateString()}</p>
                <p className="flex items-center gap-2"><Phone size={16}/> {child.guardianPhone}</p>
              </div>
            </div>
          </div>
          
          <h3 className="text-xl font-bold mb-4 text-slate-800">Vaccination Schedule</h3>
          
          {/* Vaccination List */}
          <div className="space-y-3">
            {child.records.map((record) => (
              <div key={record.id} className="flex items-center justify-between p-4 bg-white rounded-xl border border-slate-200 hover:border-blue-300 transition-all">
                <div className="flex items-center gap-4">
                  {record.status === 'COMPLETED' ? 
                    <CheckCircle className="text-emerald-500" size={24} /> : 
                    <Clock className="text-amber-500" size={24} />
                  }
                  <div>
                    <p className="font-bold text-slate-900">{record.vaccineName}</p>
                    <p className="text-xs text-slate-500 uppercase tracking-wider">Due: {new Date(record.nextDueDate).toLocaleDateString()}</p>
                  </div>
                </div>

                {record.status === 'DUE' && (
                  <button 
                    onClick={() => markAsDone(record.id)}
                    className="bg-blue-50 text-blue-600 px-4 py-2 rounded-lg text-sm font-semibold hover:bg-blue-600 hover:text-white transition-all"
                  >
                    Administer
                  </button>
                )}
                {record.status === 'COMPLETED' && (
                  <span className="text-emerald-600 text-sm font-bold bg-emerald-50 px-3 py-1 rounded-full">Completed</span>
                )}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}