'use client';
import { motion } from 'framer-motion';
import { Lock, Mail } from 'lucide-react';

export default function Login() {
  return (
    <div className="min-h-[80vh] flex items-center justify-center px-4">
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md bg-white p-8 rounded-3xl shadow-xl border border-slate-100"
      >
        <div className="text-center mb-8">
          <h2 className="text-3xl font-bold text-slate-900">Welcome Back</h2>
          <p className="text-slate-500">Access the Immunization Portal</p>
        </div>

        <form className="space-y-4">
          <div className="relative">
            <Mail className="absolute left-3 top-3.5 text-slate-400" size={20} />
            <input 
              type="email" 
              placeholder="Health Worker Email" 
              className="w-full p-3 pl-11 rounded-xl border border-slate-200 outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div className="relative">
            <Lock className="absolute left-3 top-3.5 text-slate-400" size={20} />
            <input 
              type="password" 
              placeholder="Password" 
              className="w-full p-3 pl-11 rounded-xl border border-slate-200 outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <button className="w-full py-4 bg-blue-600 text-white font-bold rounded-xl hover:bg-blue-700 transition-all shadow-lg shadow-blue-100">
            Sign In
          </button>
        </form>
      </motion.div>
    </div>
  );
}