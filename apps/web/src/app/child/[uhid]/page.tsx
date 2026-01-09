'use client';
import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { CheckCircle2, Circle, Calendar, Phone, User, Syringe, MapPin } from 'lucide-react';
import { motion } from 'framer-motion';

export default function ChildTimeline() {
  const { uhid } = useParams();
  const [child, setChild] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  // Use Environment Variable for the API URL
  const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:10000';

  const fetchChildData = async () => {
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`${API_BASE}/api/child/${uhid}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await res.json();
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

  const handleAdminister = async (recordId: string) => {
    const token = localStorage.getItem('token');
    try {
      const res = await fetch(`${API_BASE}/api/record/${recordId}`, {
        method: 'PATCH',
        headers: { 
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json' 
        },
        body: JSON.stringify({ status: 'COMPLETED' })
      });
      if (res.ok) fetchChildData(); // Refresh timeline
    } catch (err) {
      alert("Failed to update record");
    }
  };

  if (loading) return <div className="p-20 text-center animate-pulse text-slate-400">Loading Medical Records...</div>;
  if (!child) return <div className="p-20 text-center">Child record not found.</div>;

  return (
    <div className="max-w-4xl mx-auto p-6 md:p-12 pb-32">
      {/* Patient Header Card */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="glass-card p-8 rounded-[32px] mb-12 flex flex-col md:flex-row justify-between items-start md:items-center gap-6 border border-white/50"
      >
        <div>
          <div className="flex items-center gap-2 mb-2">
            <div className="bg-blue-600 text-white p-1 rounded-md"><User size={14} /></div>
            <span className="text-xs font-black text-blue-600 uppercase tracking-[0.2em]">{child.uhid}</span>
          </div>
          <h1 className="text-4xl font-black text-slate-900 tracking-tight">{child.firstName} {child.lastName}</h1>
          <div className="flex gap-6 mt-4 text-slate-500 font-medium">
            <span className="flex items-center gap-2 bg-slate-100 px-3 py-1 rounded-full text-xs"><Calendar size={14}/> DOB: {new Date(child.dob).toLocaleDateString()}</span>
            <span className="flex items-center gap-2 bg-slate-100 px-3 py-1 rounded-full text-xs"><Phone size={14}/> {child.guardianPhone}</span>
          </div>
        </div>
      </motion.div>

      {/* Immunization Timeline */}
      <div className="space-y-10 relative">
        {/* Timeline Vertical Line */}
        <div className="absolute left-[19px] top-4 bottom-4 w-1 bg-gradient-to-b from-blue-200 via-slate-200 to-transparent rounded-full" />
        
        {child.records.map((record: any, index: number) => {
          const isOverdue = new Date(record.nextDueDate) < new Date() && record.status !== 'COMPLETED';
          
          return (
            <motion.div 
              key={record.id}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.05 }}
              className="relative pl-14"
            >
              {/* Timeline Indicator Node */}
              <div className="absolute left-0 top-1 z-10">
                {record.status === 'COMPLETED' ? (
                  <div className="bg-emerald-500 text-white p-2 rounded-full shadow-lg shadow-emerald-100">
                    <CheckCircle2 size={24} />
                  </div>
                ) : (
                  <div className={`p-2 rounded-full border-4 border-white shadow-md ${isOverdue ? 'bg-red-500 animate-pulse' : 'bg-slate-300'}`}>
                    <div className="w-4 h-4" />
                  </div>
                )}
              </div>
              
              <div className={`glass-card p-6 rounded-3xl border transition-all ${record.status === 'COMPLETED' ? 'border-emerald-100 bg-emerald-50/30' : 'border-slate-100'}`}>
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                  <div>
                    <h3 className={`text-xl font-black ${record.status === 'COMPLETED' ? 'text-emerald-900' : 'text-slate-800'}`}>
                      {record.vaccineName}
                    </h3>
                    <div className="flex items-center gap-3 mt-1">
                      <p className="text-sm font-medium text-slate-500">
                        {record.status === 'COMPLETED' ? 'Administered' : 'Scheduled'}: {new Date(record.nextDueDate).toLocaleDateString()}
                      </p>
                      {record.clinicName && (
                        <span className="text-[10px] flex items-center gap-1 bg-white px-2 py-0.5 rounded-md border border-slate-100 text-slate-400">
                          <MapPin size={10}/> {record.clinicName}
                        </span>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center gap-3 w-full md:w-auto">
                    <span className={`px-4 py-1.5 rounded-xl text-xs font-black uppercase tracking-wider ${
                      record.status === 'COMPLETED' 
                        ? 'bg-emerald-100 text-emerald-700' 
                        : isOverdue 
                          ? 'bg-red-100 text-red-600' 
                          : 'bg-blue-100 text-blue-700'
                    }`}>
                      {isOverdue ? 'Overdue' : record.status}
                    </span>

                    {record.status !== 'COMPLETED' && (
                      <button 
                        onClick={() => handleAdminister(record.id)}
                        className="flex items-center gap-2 bg-blue-600 text-white px-6 py-2.5 rounded-2xl text-sm font-bold shadow-lg shadow-blue-200 hover:bg-blue-700 active:scale-95 transition-all ml-auto md:ml-0"
                      >
                        <Syringe size={16} /> Mark Done
                      </button>
                    )}
                  </div>
                </div>
              </div>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}