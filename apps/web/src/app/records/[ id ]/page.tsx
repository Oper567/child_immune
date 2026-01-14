"use client";

import { useEffect, useState, useCallback } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { 
  ChevronLeft, 
  Printer, 
  Calendar, 
  Hash, 
  CheckCircle2, 
  Clock,
  AlertCircle,
  MapPin,
  Plus,
  X,
  Loader2,
  Phone
} from 'lucide-react';

const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5001';

export default function MedicalCardPage() {
  const params = useParams();
  const router = useRouter();
  
  // Data States
  const [child, setChild] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Update Modal States
  const [isUpdateOpen, setIsUpdateOpen] = useState(false);
  const [selectedVaccine, setSelectedVaccine] = useState("");
  const [adminDate, setAdminDate] = useState(new Date().toISOString().split('T')[0]);
  const [isUpdating, setIsUpdating] = useState(false);

  const fetchChildData = useCallback(async () => {
    if (!params?.id || params.id === 'undefined') return;

    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`${API_BASE}/api/records/${params.id}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await res.json();
      
      if (res.ok) {
        setChild(data);
        setError('');
      } else {
        setError(data.error || "Patient record not found");
      }
    } catch (err) {
      setError("Failed to connect to server");
    } finally {
      setLoading(false);
    }
  }, [params?.id]);

  useEffect(() => {
    fetchChildData();
  }, [fetchChildData]);

  const handleUpdateRecord = async () => {
    if (!selectedVaccine) return alert("Please select a vaccine");
    
    setIsUpdating(true);
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`${API_BASE}/api/records/update-vaccine`, {
        method: 'POST',
        headers: { 
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json' 
        },
        body: JSON.stringify({
          childId: params.id,
          vaccineName: selectedVaccine,
          dateGiven: adminDate,
        })
      });

      if (res.ok) {
        setIsUpdateOpen(false);
        setSelectedVaccine(""); 
        await fetchChildData(); // REFRESH UI
      } else {
        const errData = await res.json();
        alert(errData.error || "Update failed");
      }
    } catch (err) {
      alert("Network error. Please try again.");
    } finally {
      setIsUpdating(false);
    }
  };

  if (loading && !child) return (
    <div className="flex h-screen items-center justify-center bg-white">
      <Loader2 className="animate-spin text-emerald-600" size={40} />
    </div>
  );

  if (error) return (
    <div className="p-10 text-center">
      <AlertCircle className="mx-auto text-red-500 mb-4" size={48} />
      <h2 className="text-xl font-bold">{error}</h2>
      <button onClick={() => router.back()} className="mt-4 text-emerald-600 font-bold underline">Go Back</button>
    </div>
  );

  return (
    <div className="min-h-screen bg-slate-50 pb-20 relative">
      {/* --- TOP NAV --- */}
      <div className="bg-white border-b px-6 py-4 flex items-center justify-between sticky top-0 z-20">
        <button onClick={() => router.back()} className="p-2 hover:bg-slate-100 rounded-xl">
          <ChevronLeft size={24} />
        </button>
        <div className="text-center">
            <span className="font-black text-slate-900 uppercase tracking-tighter text-sm block">Medical Record</span>
            <span className="text-[9px] font-bold text-slate-400 flex items-center gap-1 uppercase tracking-widest justify-center">
              <MapPin size={8}/> Obiaruku Central
            </span>
        </div>
        <button onClick={() => window.print()} className="p-2 text-slate-600 hover:bg-slate-100 rounded-xl">
          <Printer size={20} />
        </button>
      </div>

      <div className="p-4 md:p-8 max-w-2xl mx-auto space-y-6">
        
        {/* --- PATIENT IDENTITY CARD --- */}
        <div className="bg-white rounded-[2.5rem] p-6 shadow-xl shadow-slate-200/50 border border-slate-100">
          <div className="flex items-start gap-5">
            <div className="w-20 h-20 bg-emerald-600 rounded-3xl flex items-center justify-center text-white text-3xl font-black shadow-lg">
              {child?.firstName?.[0]}{child?.lastName?.[0]}
            </div>
            <div className="flex-1">
              <h1 className="text-2xl font-black text-slate-900 uppercase truncate">
                {child?.firstName} {child?.lastName}
              </h1>
              <span className="text-xs font-black text-emerald-600 bg-emerald-50 px-2 py-1 rounded-md flex items-center gap-1 w-fit mt-1">
                <Hash size={12}/> {child?.uhid}
              </span>

              <div className="grid grid-cols-2 gap-4 mt-6 border-t pt-4 border-slate-50">
                <div>
                  <p className="text-[10px] font-black text-slate-400 uppercase">Date of Birth</p>
                  <p className="text-sm font-bold text-slate-700 flex items-center gap-2 mt-1">
                    <Calendar size={14} className="text-slate-300"/> 
                    {child?.dob ? new Date(child.dob).toLocaleDateString('en-GB') : 'N/A'}
                  </p>
                </div>
                <div>
                  <p className="text-[10px] font-black text-slate-400 uppercase">Guardian Contact</p>
                  <p className="text-sm font-bold text-slate-700 flex items-center gap-2 mt-1">
                    <Phone size={14} className="text-slate-300"/> {child?.guardianPhone}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* --- VACCINATION TIMELINE --- */}
        <div className="space-y-4">
          <h3 className="font-black text-slate-400 uppercase tracking-widest text-[10px] px-2">Immunization History</h3>
          <div className="space-y-3">
            {child?.records?.map((rec: any, index: number) => (
              <div key={index} className="bg-white p-4 rounded-3xl border border-slate-100 flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${
                    rec.status === 'COMPLETED' ? 'bg-emerald-50 text-emerald-600' : 'bg-amber-50 text-amber-600'
                  }`}>
                    {rec.status === 'COMPLETED' ? <CheckCircle2 size={18}/> : <Clock size={18}/>}
                  </div>
                  <div>
                    <h4 className="font-black text-slate-800 text-sm">{rec.vaccineName}</h4>
                    <p className="text-[10px] font-bold text-slate-400 uppercase">
                      {rec.status === 'COMPLETED' 
                        ? `Administered: ${new Date(rec.administeredAt).toLocaleDateString()}` 
                        : `Due: ${new Date(rec.nextDueDate).toLocaleDateString()}`}
                    </p>
                  </div>
                </div>
                <span className={`text-[8px] font-black px-2 py-1 rounded-md uppercase tracking-widest ${
                    rec.status === 'COMPLETED' ? 'bg-emerald-100 text-emerald-700' : 'bg-amber-100 text-amber-700'
                }`}>
                    {rec.status}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* --- ACTIONS --- */}
        <div className="fixed bottom-6 left-4 right-4 max-w-2xl mx-auto grid grid-cols-2 gap-3 md:relative md:bottom-0">
          <button 
            onClick={() => setIsUpdateOpen(true)}
            className="bg-emerald-600 text-white p-4 rounded-2xl font-black text-xs uppercase tracking-widest shadow-xl flex items-center justify-center gap-2"
          >
            <Plus size={16} /> Update Record
          </button>
          <button className="bg-white border border-slate-200 text-slate-600 p-4 rounded-2xl font-black text-xs uppercase">
            Schedule Next
          </button>
        </div>
      </div>

      {/* --- UPDATE MODAL --- */}
      {isUpdateOpen && (
        <div className="fixed inset-0 z-[100] flex items-end md:items-center justify-center p-4">
          <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm" onClick={() => setIsUpdateOpen(false)} />
          <div className="relative bg-white w-full max-w-lg rounded-[2.5rem] p-8 shadow-2xl animate-in fade-in zoom-in duration-200">
            <div className="flex justify-between items-center mb-6">
                <h2 className="text-xl font-black text-slate-900 uppercase">Administer Vaccine</h2>
                <button onClick={() => setIsUpdateOpen(false)} className="p-2 bg-slate-100 rounded-full"><X size={18}/></button>
            </div>
            <div className="space-y-5">
              <div>
                <label className="text-[10px] font-black text-slate-400 uppercase ml-1">Select Vaccine</label>
                <select 
                  className="w-full p-4 mt-1 bg-slate-50 border-none rounded-2xl font-bold text-slate-700 focus:ring-2 focus:ring-emerald-500"
                  value={selectedVaccine}
                  onChange={(e) => setSelectedVaccine(e.target.value)}
                >
                  <option value="">Select vaccine...</option>
                  <option value="BCG">BCG</option>
                  <option value="OPV">Oral Polio (OPV)</option>
                  <option value="PENTA">Pentavalent</option>
                  <option value="ROTA">Rotavirus</option>
                  <option value="MEASLES">Measles</option>
                  <option value="YELLOW_FEVER">Yellow Fever</option>
                </select>
              </div>

              <div>
                <label className="text-[10px] font-black text-slate-400 uppercase ml-1">Date Administered</label>
                <input 
                  type="date" 
                  className="w-full p-4 mt-1 bg-slate-50 border-none rounded-2xl font-bold text-slate-700"
                  value={adminDate}
                  onChange={(e) => setAdminDate(e.target.value)}
                />
              </div>

              <button 
                onClick={handleUpdateRecord}
                disabled={isUpdating}
                className="w-full py-5 bg-emerald-600 text-white rounded-2xl font-black uppercase text-[10px] tracking-widest disabled:bg-slate-300 shadow-lg shadow-emerald-100"
              >
                {isUpdating ? <Loader2 className="animate-spin mx-auto" size={18}/> : "Confirm Administration"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}