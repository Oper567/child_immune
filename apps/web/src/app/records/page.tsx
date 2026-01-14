"use client";

import { useState } from 'react';
import { 
  Package, 
  Search, 
  Plus, 
  AlertTriangle, 
  ArrowUpRight, 
  ClipboardList,
  History,
  MoreVertical
} from 'lucide-react';

// Mock data for Obiaruku Clinic Inventory
const initialInventory = [
  { id: 1, name: "BCG Vaccine", category: "Immunization", stock: 45, unit: "vials", status: "In Stock" },
  { id: 2, name: "Oral Polio (OPV)", category: "Immunization", stock: 8, unit: "vials", status: "Low Stock" },
  { id: 3, name: "Syringes (2ml)", category: "Consumables", stock: 120, unit: "units", status: "In Stock" },
  { id: 4, name: "Paracetamol Syrup", category: "Medication", stock: 15, unit: "bottles", status: "In Stock" },
  { id: 5, name: "Vitamin A Capsules", category: "Supplements", stock: 3, unit: "packs", status: "Critical" },
];

export default function InventoryPage() {
  const [inventory, setInventory] = useState(initialInventory);
  const [searchQuery, setSearchQuery] = useState("");

  const filteredItems = inventory.filter(item =>
    item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    item.category.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="p-6 md:p-10 max-w-6xl mx-auto">
      {/* Header */}
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-10">
        <div>
          <h1 className="text-4xl font-black text-slate-900 tracking-tighter">Clinic Inventory</h1>
          <p className="text-slate-500 font-bold uppercase text-[10px] tracking-[0.2em] mt-1 flex items-center gap-2">
            <Package size={12} className="text-emerald-600"/> Obiaruku Central Stock Control
          </p>
        </div>
        
        <button className="flex items-center justify-center gap-2 bg-emerald-600 text-white px-6 py-4 rounded-2xl font-black text-sm shadow-xl shadow-emerald-200 active:scale-95 transition-all">
          <Plus size={20} /> Add New Batch
        </button>
      </header>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
        <div className="bg-white p-6 rounded-[2rem] border border-slate-100 shadow-sm flex items-center gap-4">
          <div className="w-12 h-12 bg-emerald-100 text-emerald-600 rounded-2xl flex items-center justify-center">
            <ClipboardList size={24} />
          </div>
          <div>
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Total Items</p>
            <p className="text-2xl font-black text-slate-900">{inventory.length}</p>
          </div>
        </div>

        <div className="bg-white p-6 rounded-[2rem] border border-slate-100 shadow-sm flex items-center gap-4">
          <div className="w-12 h-12 bg-amber-100 text-amber-600 rounded-2xl flex items-center justify-center">
            <AlertTriangle size={24} />
          </div>
          <div>
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Low Stock Alert</p>
            <p className="text-2xl font-black text-amber-600">
              {inventory.filter(i => i.stock < 10).length} Items
            </p>
          </div>
        </div>

        <div className="bg-white p-6 rounded-[2rem] border border-slate-100 shadow-sm flex items-center gap-4">
          <div className="w-12 h-12 bg-blue-100 text-blue-600 rounded-2xl flex items-center justify-center">
            <History size={24} />
          </div>
          <div>
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Last Updated</p>
            <p className="text-xl font-black text-slate-900">Today, 08:45</p>
          </div>
        </div>
      </div>

      {/* Inventory List Container */}
      <div className="bg-white rounded-[2.5rem] shadow-xl shadow-slate-200/50 border border-slate-100 overflow-hidden">
        <div className="p-6 border-b">
          <div className="relative max-w-md">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
            <input 
              type="text" 
              placeholder="Search supply name or category..."
              className="w-full pl-12 pr-4 py-3 bg-slate-50 border-none rounded-xl text-sm font-bold focus:ring-2 focus:ring-emerald-500 transition-all"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-slate-50 border-b border-slate-100">
              <tr>
                <th className="px-8 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Item Detail</th>
                <th className="px-8 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Category</th>
                <th className="px-8 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest text-center">Current Stock</th>
                <th className="px-8 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Status</th>
                <th className="px-8 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {filteredItems.map((item) => (
                <tr key={item.id} className="hover:bg-slate-50/50 transition-all group">
                  <td className="px-8 py-6">
                    <p className="font-black text-slate-800 text-sm capitalize">{item.name}</p>
                    <p className="text-[10px] text-slate-400 font-bold uppercase tracking-tighter">ID: #INV-00{item.id}</p>
                  </td>
                  <td className="px-8 py-6">
                    <span className="text-[11px] font-black text-slate-500 bg-slate-100 px-3 py-1 rounded-lg uppercase">
                      {item.category}
                    </span>
                  </td>
                  <td className="px-8 py-6 text-center">
                    <p className={`font-black text-lg ${item.stock < 10 ? 'text-red-500' : 'text-slate-900'}`}>
                      {item.stock}
                    </p>
                    <p className="text-[10px] text-slate-400 font-bold uppercase">{item.unit}</p>
                  </td>
                  <td className="px-8 py-6">
                    <div className={`flex items-center gap-2 text-[10px] font-black uppercase tracking-widest px-3 py-1.5 rounded-full w-fit ${
                      item.status === 'In Stock' ? 'bg-emerald-50 text-emerald-600' : 
                      item.status === 'Low Stock' ? 'bg-amber-50 text-amber-600' : 
                      'bg-red-50 text-red-600'
                    }`}>
                      <div className={`w-1.5 h-1.5 rounded-full animate-pulse ${
                        item.status === 'In Stock' ? 'bg-emerald-600' : 
                        item.status === 'Low Stock' ? 'bg-amber-600' : 'bg-red-600'
                      }`} />
                      {item.status}
                    </div>
                  </td>
                  <td className="px-8 py-6 text-right">
                    <button className="p-2 text-slate-400 hover:text-emerald-600 hover:bg-emerald-50 rounded-xl transition-all">
                      <ArrowUpRight size={20} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}