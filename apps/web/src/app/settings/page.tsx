"use client";

import { User, Bell, Shield, Hospital } from 'lucide-react';

export default function SettingsPage() {
  return (
    <div className="p-4 md:p-8 max-w-4xl mx-auto">
      <h1 className="text-2xl font-black text-slate-900 mb-6">Settings</h1>
      
      <div className="space-y-6">
        {/* Profile Section */}
        <section className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
          <div className="flex items-center gap-3 mb-4 text-blue-600">
            <User size={20} />
            <h2 className="font-bold">Account Information</h2>
          </div>
          <div className="grid gap-4 text-sm">
            <div>
              <label className="text-slate-500 block mb-1">Full Name</label>
              <input type="text" className="w-full p-2 bg-slate-50 border rounded-lg" placeholder="Nurse Name" />
            </div>
            <div>
              <label className="text-slate-500 block mb-1">Email Address</label>
              <input type="email" className="w-full p-2 bg-slate-50 border rounded-lg" placeholder="email@asaba.com" />
            </div>
          </div>
        </section>

        {/* Clinic Section */}
        <section className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
          <div className="flex items-center gap-3 mb-4 text-green-600">
            <Hospital size={20} />
            <h2 className="font-bold">Clinic Details</h2>
          </div>
          <p className="text-sm text-slate-600 mb-2">Primary Node: <strong>General Hospital Asaba</strong></p>
          <p className="text-sm text-slate-600">Node ID: <code className="bg-slate-100 px-2 py-1 rounded text-blue-600 font-mono">ASB-NODE-01</code></p>
        </section>
      </div>
    </div>
  );
}