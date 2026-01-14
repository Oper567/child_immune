"use client";

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { 
  ChevronLeft, 
  Printer, 
  Calendar, 
  User, 
  Phone, 
  Hash, 
  CheckCircle2, 
  Clock,
  AlertCircle,
  ShieldCheck,
  MapPin
} from 'lucide-react';

const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5001';

export default function MedicalCardPage() {
  const params = useParams();
  const router = useRouter();
  const [child, setChild] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchChildData = async () => {
      try {
        const token = localStorage.getItem('token');
        const res = await fetch(`${API_BASE}/api/records/${params.id}`, {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        const data = await res.json();
        
        if (res.ok) {
          setChild(data);
        } else {
          setError("Record not found");
        }
      } catch (err) {
        setError("Failed to connect to server");
      } finally {
        setLoading(false);
      }
    };

    if (params.id) fetchChildData();
  }, [params.id]);

  if (loading) return (
    <div className="flex h-screen items-center justify-center bg-white">
      <div className="animate-pulse flex flex-col items-center gap-4">
        <div className="w-12 h-12 bg-emerald-100 rounded-full flex items-center justify-center text-emerald-600">
          <ShieldCheck className="animate-bounce" />
        </div>
        <p className="text-xs font-black text-slate-400 uppercase tracking-[0.2em]">Retrieving Card...</p>
      </div>
    </div>
  );

  if (error || !child) return (
    <div className="p-10 text-center">
      <AlertCircle className="mx-auto text-red-500 mb-4" size={48} />
      <h2 className="text-xl font-bold">{error}</h2>
      <button onClick={() => router.back()} className="mt-4 text-emerald-600 font-bold underline">Go Back</button>
    </div>
  );

  return (
    <div className="min-h-screen bg-slate-50 pb-20">
      {/* Top Navigation */}
      <div className="bg-white border-b px-6 py-4 flex items-center justify-between sticky top-0 z-20">
        <button onClick={() => router.back()} className="p-2 hover:bg-slate-100 rounded-xl transition-all">
          <ChevronLeft size={24} />
        </button>
        <span className="font-black text-slate-900 uppercase tracking-tighter">Medical Record</span>
        <button onClick={() => window.print()} className="p-2 bg-emerald-600 text-white rounded-xl shadow-lg shadow-emerald-100">
          <Printer size={20} />
        </button>
      </div>

      <div className="p-4 md:p-8 max-w-3xl mx-auto space-y-6">
        
        {/* Patient Identity Card */}
        <div className="bg-white rounded-[2.5rem] p-6 shadow-xl shadow-slate-200/50 border border-slate-100">
          <div className="flex items-start gap-5">
            <div className="w-20 h-20 bg-emerald-600 rounded-3xl flex items-center justify-center text-white text-3xl font-black shadow-2xl shadow-emerald-200">
              {child.firstName[0]}{child.lastName[0]}
            </div>
            <div className="flex-1">
              <h1 className="text-2xl font-black text-slate-900 leading-tight uppercase tracking-tight">
                {child.firstName} {child.lastName}
              </h1>
              <p className="text-emerald-600 font-bold flex items-center gap-1 text-sm mt-1">
                <Hash size={14}/> {child.uhid}
              </p>
              <div className="grid grid-cols-2 gap-4 mt-6">
                <div>
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Date of Birth</p>
                  <p className="text-sm font-bold text-slate-700 flex items-center gap-2 mt-1">
                    <Calendar size={14} className="text-slate-400"/> {new Date(child.dateOfBirth).toLocaleDateString('en-GB')}
                  </p>
                </div>
                <div>
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Guardian Phone</p>
                  <p className="text-sm font-bold text-slate-700 flex items-center gap-2 mt-1">
                    <Phone size={14} className="text-slate-400"/> {child.guardianPhone}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Immunization Timeline */}
        <div className="space-y-4">
          <div className="flex items-center justify-between px-2">
            <h3 className="font-black text-slate-900 uppercase tracking-widest text-xs">Vaccination Timeline</h3>
            <span className="text-[10px] font-bold text-slate-400 flex items-center gap-1">
              <MapPin size={10}/> OBIARUKU NODE
            </span>
          </div>

          <div className="space-y-3">
            {child.records.map((rec: any, index: number) => (
              <div key={index} className="bg-white p-5 rounded-3xl border border-slate-100 flex items-center justify-between group hover:border-emerald-200 transition-all">
                <div className="flex items-center gap-4">
                  <div className={`w-10 h-10 rounded-2xl flex items-center justify-center ${
                    rec.status === 'COMPLETED' ? 'bg-emerald-50 text-emerald-600' : 'bg-amber-50 text-amber-600'
                  }`}>
                    {rec.status === 'COMPLETED' ? <CheckCircle2 size={20}/> : <Clock size={20}/>}
                  </div>
                  <div>
                    <h4 className="font-black text-slate-800 text-sm">{rec.vaccineName}</h4>
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-tighter">
                      {rec.status === 'COMPLETED' ? `Administered: ${new Date(rec.dateGiven).toLocaleDateString()}` : `Due: ${new Date(rec.nextDueDate).toLocaleDateString()}`}
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <span className={`text-[9px] font-black px-3 py-1 rounded-full uppercase tracking-widest ${
                    rec.status === 'COMPLETED' ? 'bg-emerald-100 text-emerald-700' : 'bg-amber-100 text-amber-700'
                  }`}>
                    {rec.status}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Action Footer */}
        <div className="grid grid-cols-2 gap-4">
          <button className="bg-slate-900 text-white p-4 rounded-2xl font-black text-xs uppercase tracking-widest active:scale-95 transition-all">
            Update Record
          </button>
          <button className="bg-white border-2 border-slate-200 text-slate-600 p-4 rounded-2xl font-black text-xs uppercase tracking-widest active:scale-95 transition-all">
            Schedule Next
          </button>
        </div>
      </div>
    </div>
  );
}