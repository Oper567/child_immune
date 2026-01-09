"use client";

import { useState, useEffect } from 'react';
import { User, Mail, Shield, Building2, LogOut, ArrowLeft } from 'lucide-react';
import { useRouter } from 'next/navigation';

export default function ProfilePage() {
  const router = useRouter();
  const [worker, setWorker] = useState<any>(null);

  useEffect(() => {
    // Pull data saved during login
    const name = localStorage.getItem('workerName');
    const email = localStorage.getItem('workerEmail'); // Ensure you save this on login!
    const clinic = localStorage.getItem('clinicName');
    
    if (name) {
      setWorker({ name, email, clinic });
    }
  }, []);

  const handleLogout = () => {
    localStorage.clear();
    router.push('/login');
  };

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Header */}
      <div className="bg-white border-b px-6 py-4 flex items-center gap-4">
        <button onClick={() => router.back()} className="p-2 bg-slate-100 rounded-full md:hidden">
          <ArrowLeft size={20} />
        </button>
        <h1 className="text-xl font-black text-slate-900">Worker Profile</h1>
      </div>

      <div className="max-w-md mx-auto p-6 space-y-6">
        {/* Profile Avatar Card */}
        <div className="bg-white rounded-[32px] p-8 shadow-sm border border-slate-200 text-center">
          <div className="w-24 h-24 bg-blue-600 rounded-[32px] mx-auto flex items-center justify-center text-white text-3xl font-black shadow-xl shadow-blue-100 mb-4">
            {worker?.name?.substring(0, 2).toUpperCase()}
          </div>
          <h2 className="text-2xl font-black text-slate-900">{worker?.name || 'Health Worker'}</h2>
          <p className="text-blue-600 font-bold text-sm uppercase tracking-widest mt-1">Authorized Personnel</p>
        </div>

        {/* Info List */}
        <div className="bg-white rounded-[32px] p-2 shadow-sm border border-slate-200 overflow-hidden">
          <InfoRow icon={<Mail size={18}/>} label="Email Address" value={worker?.email || 'N/A'} />
          <InfoRow icon={<Building2 size={18}/>} label="Assigned Clinic" value={worker?.clinic || 'General Hospital Asaba'} />
          <InfoRow icon={<Shield size={18}/>} label="Role" value="Vaccination Officer" />
        </div>

        {/* Logout Action */}
        <button 
          onClick={handleLogout}
          className="w-full bg-red-50 text-red-600 py-4 rounded-2xl font-black flex items-center justify-center gap-3 active:scale-95 transition-all border border-red-100"
        >
          <LogOut size={20} />
          Sign Out of ImmuniTrack
        </button>
      </div>
    </div>
  );
}

function InfoRow({ icon, label, value }: any) {
  return (
    <div className="flex items-center gap-4 p-4 hover:bg-slate-50 transition-colors">
      <div className="w-10 h-10 bg-slate-100 rounded-xl flex items-center justify-center text-slate-500">
        {icon}
      </div>
      <div>
        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest leading-none mb-1">{label}</p>
        <p className="text-sm font-bold text-slate-800">{value}</p>
      </div>
    </div>
  );
}