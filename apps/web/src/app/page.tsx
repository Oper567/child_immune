'use client';

import { useState } from 'react';
import { Search, Calendar, Phone, CheckCircle, Clock, AlertCircle } from 'lucide-react';

// 1. Types fixed and ready for Next.js
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

  // Use Environment Variable or fallback to local
  const baseUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:10000';

  // 2. Triage Logic: Helper to color-code dates
  const getDateStatus = (dateString: string, status: string) => {
    if (status === 'COMPLETED') return 'text-emerald-500';
    const today = new Date();
    const dueDate = new Date(dateString);
    return dueDate < today ? 'text-red-500 font-bold' : 'text-slate-500';
  };

  const fetchChild = async (searchId: string) => {
    if (!searchId) return;
    setLoading(true);
    try {
      const res = await fetch(`${baseUrl}/api/child/${searchId.trim().toUpperCase()}`);
      const data = await res.json();
      if (res.ok) {
        setChild(data);
      } else {
        alert(data.error || "Child not found");
        setChild(null);
      }
    } catch (err) {
      alert("Backend is sleeping or disconnected. Please try again in 30s.");
    } finally {
      setLoading(false);
    }
  };

  const markAsDone = async (recordId: string) => {
    try {
      const res = await fetch(`${baseUrl}/api/record/${recordId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          status: 'COMPLETED',
          clinicName: "General Clinic" // Logic: In future, get this from logged-in worker
        }),
      });
      if (res.ok && child) {
        fetchChild(child.uhid); // Refresh data
      }
    } catch (err) {
      alert("Update failed. Check your internet.");
    }
  };

  return (
    <div className="max-w-md mx-auto p-4 pb-24"> {/* Mobile-sized max width */}
      <h1 className="text-xl font-bold mb-4 text-slate-800">Find Patient</h1>
      
      <form onSubmit={(e) => { e.preventDefault(); fetchChild(uhid); }} className="relative mb-6">
        <input
          type="text"
          placeholder="Search UHID..."
          className="w-full p-4 pl-12 rounded-2xl border-2 border-slate-100 focus:border-blue-500 outline-none shadow-sm text-black bg-white"
          value={uhid}
          onChange={(e) => setUhid(e.target.value)}
        />
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
        <button 
          disabled={loading}
          className="absolute right-2 top-2 bottom-2 bg-blue-600 text-white px-4 rounded-xl font-bold disabled:bg-slate-400"
        >
          {loading ? '...' : 'GO'}
        </button>
      </form>

      {child && (
        <div className="space-y-4">
          {/* Patient Info Card - Mobile Centric */}
          <div className="bg-white p-5 rounded-3xl shadow-md border border-slate-50">
            <div className="flex justify-between items-start">
              <div>
                <h2 className="text-2xl font-extrabold text-slate-900 leading-tight">
                  {child.firstName} <br/> {child.lastName}
                </h2>
                <p className="text-blue-600 font-mono text-sm mt-1">{child.uhid}</p>
              </div>
              <a href={`tel:${child.guardianPhone}`} className="bg-green-100 p-3 rounded-full text-green-600 active:scale-90 transition-transform">
                <Phone size={20}/>
              </a>
            </div>
          </div>

          <div className="flex justify-between items-center px-2">
            <h3 className="text-sm font-bold text-slate-500 uppercase tracking-widest">Immunization Plan</h3>
            <span className="text-xs bg-slate-100 px-2 py-1 rounded text-slate-600">
              {child.records.filter(r => r.status === 'COMPLETED').length} / {child.records.length} Done
            </span>
          </div>
          
          {/* Vaccination List */}
          <div className="space-y-3">
            {child.records.map((record) => (
              <div key={record.id} className="flex items-center justify-between p-4 bg-white rounded-2xl border border-slate-100 shadow-sm">
                <div className="flex items-center gap-3">
                  {record.status === 'COMPLETED' ? (
                    <CheckCircle className="text-emerald-500" size={22} />
                  ) : (
                    <Clock className={getDateStatus(record.nextDueDate, record.status)} size={22} />
                  )}
                  <div>
                    <p className="font-bold text-slate-800 text-sm">{record.vaccineName}</p>
                    <p className={`text-[11px] uppercase tracking-tighter ${getDateStatus(record.nextDueDate, record.status)}`}>
                      {record.status === 'COMPLETED' ? 'Administered' : `Due: ${new Date(record.nextDueDate).toLocaleDateString()}`}
                    </p>
                  </div>
                </div>

                {record.status === 'DUE' && (
                  <button 
                    onClick={() => markAsDone(record.id)}
                    className="bg-blue-600 text-white px-4 py-2 rounded-xl text-xs font-bold shadow-md shadow-blue-100 active:scale-95"
                  >
                    GIVE
                  </button>
                )}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}