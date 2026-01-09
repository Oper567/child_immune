'use client';
import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { CheckCircle2, Circle, Calendar, Phone, User } from 'lucide-react';
import { motion } from 'framer-motion';

export default function ChildTimeline() {
  const { uhid } = useParams();
  const [child, setChild] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchChildData = async () => {
      try {
        const res = await fetch(`http://localhost:5000/api/child/${uhid}`);
        const data = await res.json();
        setChild(data);
      } catch (err) {
        console.error("Failed to fetch child data");
      } finally {
        setLoading(false);
      }
    };
    fetchChildData();
  }, [uhid]);

  if (loading) return <div className="p-20 text-center">Loading Medical Records...</div>;
  if (!child) return <div className="p-20 text-center">Child record not found.</div>;

  return (
    <div className="max-w-4xl mx-auto p-6 md:p-12">
      {/* Patient Header Card */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="glass-card p-8 rounded-3xl mb-10 flex flex-col md:flex-row justify-between items-start md:items-center gap-6"
      >
        <div>
          <div className="flex items-center gap-2 mb-2">
            <User className="text-blue-600" size={20} />
            <span className="text-sm font-bold text-blue-600 uppercase tracking-widest">{child.uhid}</span>
          </div>
          <h1 className="text-4xl font-extrabold text-slate-900">{child.firstName} {child.lastName}</h1>
          <div className="flex gap-4 mt-4 text-slate-500 text-sm">
            <span className="flex items-center gap-1"><Calendar size={14}/> {new Date(child.dob).toLocaleDateString()}</span>
            <span className="flex items-center gap-1"><Phone size={14}/> {child.guardianPhone}</span>
          </div>
        </div>
      </motion.div>

      {/* Immunization Timeline */}
      <div className="space-y-8 relative">
        <div className="absolute left-[19px] top-2 bottom-2 w-0.5 bg-slate-200" />
        
        {child.records.map((record: any, index: number) => (
          <motion.div 
            key={record.id}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: index * 0.1 }}
            className="relative pl-14"
          >
            <div className="absolute left-0 top-1 z-10">
              {record.status === 'COMPLETED' ? (
                <CheckCircle2 className="text-green-500 bg-white rounded-full" size={40} />
              ) : (
                <Circle className="text-slate-300 bg-white rounded-full" size={40} />
              )}
            </div>
            
            <div className="glass-card p-6 rounded-2xl border border-slate-100 transition-all hover:shadow-md">
              <div className="flex justify-between items-center">
                <div>
                  <h3 className="text-lg font-bold text-slate-800">{record.vaccineName}</h3>
                  <p className="text-sm text-slate-500">
                    {record.status === 'COMPLETED' ? 'Administered on' : 'Scheduled for'}: {new Date(record.nextDueDate).toLocaleDateString()}
                  </p>
                </div>
                <span className={`px-4 py-1 rounded-full text-xs font-bold ${
                  record.status === 'COMPLETED' ? 'bg-green-100 text-green-700' : 'bg-blue-100 text-blue-700'
                }`}>
                  {record.status}
                </span>
              </div>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
}