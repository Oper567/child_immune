'use client';
import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { CheckCircle2, Calendar, Phone, User, Syringe, MapPin, ArrowLeft, AlertCircle } from 'lucide-react';
import { motion } from 'framer-motion';

export default function ChildTimeline() {
  const { uhid } = useParams();
  const router = useRouter();
  const [child, setChild] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:10000';

  const fetchChildData = async () => {
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`${API_BASE}/api/child/${uhid}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await res.json();
      
      // Sort records by date to ensure the timeline flows chronologically
      if (data.records) {
        data.records.sort((a: any, b: any) => new Date(a.nextDueDate).getTime() - new Date(b.nextDueDate).getTime());
      }
      
      setChild(data);
    } catch (err) {
      console.error("Failed to fetch child data");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchChildData();
  }, [uhid]);

  const handleAdminister = async (recordId: string, vaccineName: string) => {
    // Safety check for medical actions
    if (!window.confirm(`Confirm administration of ${vaccineName}? This will update the national registry.`)) return;

    const token = localStorage.getItem('token');
    try {
      const res = await fetch(`${API_BASE}/api/record/${recordId}`, {
        method: 'PATCH',
        headers: { 
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json' 
        },
        body: JSON.stringify({ 
          status: 'COMPLETED',
          dateGiven: new Date().toISOString()
        })
      });
      if (res.ok) fetchChildData(); 
    } catch (err) {
      alert("System Error: Failed to update vaccine record.");
    }
  };

  if (loading) return (
    <div className="h-screen flex flex-col items-center justify-center text-slate-400">
      <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mb-4" />
      <p className="font-bold animate-pulse">Retrieving Medical History...</p>
    </div>
  );

  if (!child) return (
    <div className="p-20 text-center">
      <AlertCircle className="mx-auto text-red-500 mb-4" size={48} />
      <h2 className="text-xl font-bold">Child record not found.</h2>
      <button onClick={() => router.back()} className="mt-4 text-blue-600 font-bold">Go Back</button>
    </div>
  );

  return (
    <div className="min-h-screen bg-slate-50 pb-32">
      {/* Mobile-First Header */}
      <div className="bg-white border-b sticky top-0 z-30 px-4 py-4 flex items-center gap-4 md:hidden">
        <button onClick={() => router.back()} className="p-2 bg-slate-100 rounded-full">
          <ArrowLeft size={20} />
        </button>
        <h1 className="font-black text-slate-900 truncate">Patient Timeline</h1>
      </div>

      <div className="max-w-4xl mx-auto p-4 md:p-12">
        {/* Patient Header Card */}
        <motion.div 
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="bg-gradient-to-br from-slate-900 to-slate-800 p-6 md:p-10 rounded-[32px] mb-12 text-white shadow-2xl relative overflow-hidden"
        >
          <div className="relative z-10">
            <div className="flex items-center gap-2 mb-4">
              <span className="bg-blue-500/20 text-blue-300 px-3 py-1 rounded-lg text-[10px] font-black uppercase tracking-widest border border-blue-500/30">
                {child.uhid}
              </span>
            </div>
            <h1 className="text-3xl md:text-5xl font-black tracking-tighter mb-4">
              {child.firstName} {child.lastName}
            </h1>
            <div className="flex flex-wrap gap-4 opacity-80 text-sm">
              <span className="flex items-center gap-2"><Calendar size={16} className="text-blue-400"/> {new Date(child.dob).toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' })}</span>
              <span className="flex items-center gap-2"><Phone size={16} className="text-blue-400"/> {child.guardianPhone}</span>
            </div>
          </div>
          {/* Abstract decoration */}
          <div className="absolute top-[-20%] right-[-10%] w-64 h-64 bg-blue-600/20 rounded-full blur-3xl" />
        </motion.div>

        {/* Immunization Timeline */}
        <div className="space-y-8 relative">
          <div className="absolute left-[23px] top-4 bottom-4 w-0.5 bg-slate-200" />
          
          {child.records.map((record: any, index: number) => {
            const isOverdue = new Date(record.nextDueDate) < new Date() && record.status !== 'COMPLETED';
            
            return (
              <motion.div 
                key={record.id}
                initial={{ opacity: 0, x: -10 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.05 }}
                className="relative pl-14"
              >
                {/* Timeline Indicator */}
                <div className="absolute left-0 top-2 z-10">
                  {record.status === 'COMPLETED' ? (
                    <div className="bg-emerald-500 text-white p-2 rounded-xl shadow-lg shadow-emerald-200">
                      <CheckCircle2 size={30} />
                    </div>
                  ) : (
                    <div className={`w-12 h-12 rounded-xl border-4 border-white flex items-center justify-center shadow-md ${isOverdue ? 'bg-red-500 animate-pulse' : 'bg-white text-slate-300'}`}>
                      <Circle size={24} fill="currentColor" />
                    </div>
                  )}
                </div>
                
                <div className={`bg-white p-5 rounded-3xl border transition-all ${record.status === 'COMPLETED' ? 'border-emerald-100' : isOverdue ? 'border-red-100 bg-red-50/20' : 'border-slate-100'}`}>
                  <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                    <div>
                      <h3 className="text-lg font-black text-slate-800">{record.vaccineName}</h3>
                      <div className="flex items-center gap-2 mt-1">
                        <span className="text-xs font-bold text-slate-400 uppercase tracking-tighter">
                          {record.status === 'COMPLETED' ? 'Given' : 'Due'}: {new Date(record.nextDueDate).toLocaleDateString('en-GB')}
                        </span>
                        {record.status === 'COMPLETED' && (
                          <span className="text-[10px] bg-slate-100 text-slate-500 px-2 py-0.5 rounded flex items-center gap-1 font-bold">
                            <MapPin size={10} /> GH Asaba
                          </span>
                        )}
                      </div>
                    </div>

                    {!record.status.includes('COMPLETED') && (
                      <button 
                        onClick={() => handleAdminister(record.id, record.vaccineName)}
                        className="w-full md:w-auto flex items-center justify-center gap-2 bg-blue-600 text-white px-6 py-3 rounded-2xl text-xs font-black uppercase tracking-widest shadow-xl shadow-blue-100 active:scale-95 transition-all"
                      >
                        <Syringe size={16} /> Administer Dose
                      </button>
                    )}
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>
    </div>
  );
}