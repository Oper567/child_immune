"use client";

import { Syringe, AlertTriangle, CheckCircle2 } from 'lucide-react';

const VACCINE_INVENTORY = [
  { name: "BCG", disease: "Tuberculosis", stock: 45, status: "In Stock" },
  { name: "OPV", disease: "Polio", stock: 12, status: "Low Stock" },
  { name: "Pentavalent", disease: "Diphtheria, Tetanus, etc.", stock: 80, status: "In Stock" },
  { name: "PCV", disease: "Pneumonia", stock: 0, status: "Out of Stock" },
  { name: "Measles", disease: "Measles", stock: 30, status: "In Stock" },
];

export default function VaccineListPage() {
  return (
    <div className="p-4 md:p-8 max-w-5xl mx-auto">
      <header className="mb-8">
        <h1 className="text-2xl font-black text-slate-900">Vaccine Inventory</h1>
        <p className="text-slate-500">Current biological stock at General Hospital Asaba</p>
      </header>

      <div className="grid gap-4">
        {VACCINE_INVENTORY.map((vaccine) => (
          <div key={vaccine.name} className="bg-white p-5 rounded-2xl border border-slate-200 flex items-center justify-between shadow-sm hover:shadow-md transition-shadow">
            <div className="flex items-center gap-4">
              <div className={`p-3 rounded-xl ${
                vaccine.stock === 0 ? 'bg-red-50 text-red-600' : 
                vaccine.stock < 20 ? 'bg-amber-50 text-amber-600' : 'bg-blue-50 text-blue-600'
              }`}>
                <Syringe size={24} />
              </div>
              <div>
                <h3 className="font-bold text-slate-900">{vaccine.name}</h3>
                <p className="text-xs text-slate-500 uppercase font-medium">{vaccine.disease}</p>
              </div>
            </div>

            <div className="text-right">
              <div className="text-sm font-black text-slate-900">{vaccine.stock} Doses</div>
              <div className={`text-[10px] font-bold uppercase flex items-center gap-1 justify-end ${
                vaccine.status === "In Stock" ? 'text-green-600' : 
                vaccine.status === "Low Stock" ? 'text-amber-600' : 'text-red-600'
              }`}>
                {vaccine.status === "In Stock" ? <CheckCircle2 size={10} /> : <AlertTriangle size={10} />}
                {vaccine.status}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}