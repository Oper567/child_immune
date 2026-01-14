"use client";

import { useState } from 'react';
import { Shield, Trash2, CheckCircle2, Search, Filter, Loader2, UserX } from 'lucide-react';

const mockWorkers = [
  { id: 1, name: "Dr. Chidi Obi", email: "chidi@obi.com", role: "Sr. Health Worker", status: "active", joined: "12 Jan 2024" },
  { id: 2, name: "Nurse Sarah", email: "sarah@obi.com", role: "Field Worker", status: "pending", joined: "15 Jan 2024" },
  { id: 3, name: "Dr. Ifeanyi", email: "ifeanyi@obi.com", role: "Admin", status: "active", joined: "01 Jan 2024" },
];

export default function AdminPage() {
  const [workers, setWorkers] = useState(mockWorkers);
  const [searchQuery, setSearchQuery] = useState("");

  // Filter workers based on search input
  const filteredWorkers = workers.filter(worker => 
    worker.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
    worker.email.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Function to approve a pending worker
  const handleApprove = (id: number) => {
    setWorkers(workers.map(w => w.id === id ? { ...w, status: 'active' } : w));
  };

  // Function to revoke access (delete or deactivate)
  const handleRevoke = (id: number) => {
    if(confirm("Are you sure you want to revoke access for this worker?")) {
        setWorkers(workers.filter(w => w.id !== id));
    }
  };

  return (
    <div className="p-6 md:p-10 max-w-6xl mx-auto">
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-10">
        <div>
          <h1 className="text-4xl font-black text-slate-900 tracking-tighter">System Control</h1>
          <p className="text-slate-500 font-bold uppercase text-[10px] tracking-[0.2em] mt-1 flex items-center gap-2">
            <Shield size={12} className="text-emerald-600"/> Obiaruku Node Administration
          </p>
        </div>
        
        <div className="flex items-center gap-3">
            <div className="bg-emerald-100 text-emerald-700 px-4 py-2 rounded-xl text-xs font-black">
                TOTAL WORKERS: {workers.length}
            </div>
        </div>
      </header>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
        <div className="bg-white p-6 rounded-[2rem] border border-slate-100 shadow-sm">
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Active Now</p>
            <p className="text-3xl font-black text-slate-900">
                {workers.filter(w => w.status === 'active').length.toString().padStart(2, '0')}
            </p>
        </div>
        <div className="bg-white p-6 rounded-[2rem] border border-slate-100 shadow-sm">
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Pending Approval</p>
            <p className="text-3xl font-black text-emerald-600">
                {workers.filter(w => w.status === 'pending').length.toString().padStart(2, '0')}
            </p>
        </div>
        <div className="bg-white p-6 rounded-[2rem] border border-slate-100 shadow-sm">
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Clinic Capacity</p>
            <p className="text-3xl font-black text-slate-900">94%</p>
        </div>
      </div>

      {/* Workers Table Container */}
      <div className="bg-white rounded-[2.5rem] shadow-xl shadow-slate-200/50 border border-slate-100 overflow-hidden">
        <div className="p-6 border-b flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="relative flex-1 max-w-md">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                <input 
                    type="text" 
                    placeholder="Search by name or email..."
                    className="w-full pl-12 pr-4 py-3 bg-slate-50 border-none rounded-xl text-sm font-bold focus:ring-2 focus:ring-emerald-500 transition-all"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                />
            </div>
            <button className="flex items-center gap-2 px-4 py-3 bg-slate-100 rounded-xl text-sm font-bold text-slate-600 hover:bg-slate-200 transition-colors">
                <Filter size={18}/> Filter
            </button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-slate-50 border-b border-slate-100">
              <tr>
                <th className="px-8 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Worker</th>
                <th className="px-8 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Access Level</th>
                <th className="px-8 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Status</th>
                <th className="px-8 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {filteredWorkers.length > 0 ? (
                filteredWorkers.map((worker) => (
                  <tr key={worker.id} className="hover:bg-slate-50/50 transition-all">
                    <td className="px-8 py-6">
                      <div className="flex items-center gap-3">
                          <div className="w-10 h-10 bg-slate-200 rounded-xl flex items-center justify-center font-black text-slate-600 text-xs">
                              {worker.name.substring(0, 2).toUpperCase()}
                          </div>
                          <div>
                              <p className="font-black text-slate-800 text-sm">{worker.name}</p>
                              <p className="text-xs text-slate-400 font-medium">{worker.email}</p>
                          </div>
                      </div>
                    </td>
                    <td className="px-8 py-6">
                      <span className="text-xs font-bold text-slate-600 bg-slate-100 px-3 py-1 rounded-lg">
                          {worker.role}
                      </span>
                    </td>
                    <td className="px-8 py-6">
                      <div className={`flex items-center gap-2 text-xs font-black uppercase tracking-tighter ${worker.status === 'active' ? 'text-emerald-600' : 'text-amber-500'}`}>
                          {worker.status === 'active' ? <CheckCircle2 size={14}/> : <Loader2 size={14} className="animate-spin"/>}
                          {worker.status}
                      </div>
                    </td>
                    <td className="px-8 py-6 text-right">
                      <div className="flex items-center justify-end gap-2">
                          {worker.status === 'pending' && (
                            <button 
                                onClick={() => handleApprove(worker.id)}
                                className="p-2 hover:bg-emerald-50 text-emerald-600 rounded-lg transition-all" 
                                title="Approve Access"
                            >
                                <CheckCircle2 size={18}/>
                            </button>
                          )}
                          <button 
                            onClick={() => handleRevoke(worker.id)}
                            className="p-2 hover:bg-red-50 text-red-500 rounded-lg transition-all" 
                            title="Revoke Access"
                          >
                              <Trash2 size={18}/>
                          </button>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                    <td colSpan={4} className="px-8 py-20 text-center">
                        <div className="flex flex-col items-center gap-3 text-slate-300">
                            <UserX size={48} strokeWidth={1}/>
                            <p className="font-bold text-sm tracking-tight">No workers found matching "{searchQuery}"</p>
                        </div>
                    </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}