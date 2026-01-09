"use client";

import { useForm } from 'react-hook-form';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { ShieldCheck, UserCircle, Mail, Lock } from 'lucide-react';
// 1. ADD THIS LINE to fix the CSS error


export default function RegisterWorker() {
  const { register, handleSubmit } = useForm();
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const onSubmit = async (data: any) => {
    setLoading(true);
    try {
      const baseUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:10000';
      const res = await fetch(`${baseUrl}/api/worker/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });

      if (res.ok) {
        alert("Account Created Successfully!");
        router.push('/login');
      } else {
        const err = await res.json();
        alert(err.error || "Registration failed");
      }
    } catch (error) {
      alert("Connection error. Check if your Render backend is live.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-6 max-w-md mx-auto min-h-screen flex flex-col justify-center">
      <div className="text-center mb-8">
        <div className="bg-blue-600 w-16 h-16 rounded-3xl flex items-center justify-center mx-auto mb-4 shadow-lg shadow-blue-200">
          <ShieldCheck className="text-white" size={32} />
        </div>
        <h1 className="text-2xl font-black text-slate-900">Worker Onboarding</h1>
        <p className="text-slate-500 text-sm">Create your professional health account</p>
      </div>
      
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        {/* Name Field */}
        <div className="relative">
          <UserCircle className="absolute left-4 top-4 text-slate-400" size={20} />
          <input 
            {...register('name')} 
            placeholder="Full Name" 
            className="w-full p-4 pl-12 rounded-2xl border border-slate-200 bg-white outline-none focus:border-blue-500 text-black" 
            required 
          />
        </div>

        {/* Email Field */}
        <div className="relative">
          <Mail className="absolute left-4 top-4 text-slate-400" size={20} />
          <input 
            {...register('email')} 
            type="email" 
            placeholder="Work Email" 
            className="w-full p-4 pl-12 rounded-2xl border border-slate-200 bg-white outline-none focus:border-blue-500 text-black" 
            required 
          />
        </div>

        {/* Password Field */}
        <div className="relative">
          <Lock className="absolute left-4 top-4 text-slate-400" size={20} />
          <input 
            {...register('password')} 
            type="password" 
            placeholder="Create Password" 
            className="w-full p-4 pl-12 rounded-2xl border border-slate-200 bg-white outline-none focus:border-blue-500 text-black" 
            required 
          />
        </div>
        
        {/* Clinic Code Section */}
        <div className="bg-blue-50 p-5 rounded-3xl border border-blue-100 mt-4">
          <label className="text-[10px] font-black text-blue-600 uppercase tracking-widest">Clinic Access Code</label>
          <input 
            {...register('clinicCode')} 
            placeholder="HOSP-2026-X" 
            className="w-full mt-1 bg-transparent outline-none font-mono text-lg text-blue-900 placeholder:text-blue-200" 
            required 
          />
        </div>

        <button 
          disabled={loading}
          className="w-full py-4 bg-slate-900 text-white rounded-2xl font-bold shadow-xl active:scale-95 transition-all disabled:bg-slate-400"
        >
          {loading ? "Creating Account..." : "Complete Setup"}
        </button>
      </form>
    </div>
  );
}