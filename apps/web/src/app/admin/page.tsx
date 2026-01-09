'use client';
import { Activity, AlertTriangle, CheckCircle, MapPin } from 'lucide-react';

export default function AdminDashboard() {
  return (
    <div className="p-8 max-w-7xl mx-auto space-y-8">
      <h1 className="text-3xl font-bold">System-Wide Health Overview</h1>
      
      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <StatCard title="Total Children" value="12,482" icon={<Activity className="text-blue-500" />} />
        <StatCard title="Compliance Rate" value="94.2%" icon={<CheckCircle className="text-green-500" />} />
        <StatCard title="Missed Doses" value="412" icon={<AlertTriangle className="text-red-500" />} />
        <StatCard title="Active Clinics" value="48" icon={<MapPin className="text-purple-500" />} />
      </div>

      {/* Heatmap Placeholder & Clinic Table */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="bg-white p-6 rounded-3xl shadow-sm border border-slate-100 h-96 flex flex-col items-center justify-center">
          <p className="text-slate-400 italic">Visual Heatmap of Immunization Coverage</p>
          {/* Integration with Leaflet or Google Maps would go here */}
        </div>

        <div className="bg-white p-6 rounded-3xl shadow-sm border border-slate-100">
          <h3 className="font-bold mb-4">Top Performing Clinics</h3>
          {/* Table of clinics with completion percentages */}
        </div>
      </div>
    </div>
  );
}

function StatCard({ title, value, icon }: { title: string, value: string, icon: React.ReactNode }) {
  return (
    <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm flex items-center gap-4">
      <div className="p-3 bg-slate-50 rounded-xl">{icon}</div>
      <div>
        <p className="text-sm text-slate-500">{title}</p>
        <p className="text-2xl font-bold">{value}</p>
      </div>
    </div>
  );
}