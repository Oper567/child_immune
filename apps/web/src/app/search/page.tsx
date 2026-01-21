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
  Loader2
} from 'lucide-react';

// âœ… Ensure API_BASE matches your backend deployment
const API_BASE = process.env.NEXT_PUBLIC_API_URL || '$\{process\.env\.NEXT_PUBLIC_API_URL\}';

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

  // --- 1. DATA FETCHING ---
  const fetchChildData = useCallback(async () => {
    // ðŸ›¡ï¸ Ensure ID exists from dynamic route /[id]
    const childId = params?.id;
    if (!childId) return;

    setLoading(true);
    try {
      const rawToken = localStorage.getItem('token');
      if (!rawToken) {
        router.push('/login');
        return;
      }
      
      // Clean token of any accidental quotes
      const token = rawToken.replace(/"/g, '');

      const res = await fetch(`${API_BASE}/api/records/${childId}`, {
        method: 'GET',
        headers: { 
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      
      const data = await res.json();
      
      if (res.ok) {
        setChild(data);
        setError('');
      } else {
        setError(data.error || "Patient record not found");
      }
    } catch (err) {
      setError("Failed to connect to Obiaruku Node");
    } finally {
      setLoading(false);
    }
  }, [params?.id, router]);

  useEffect(() => {
    fetchChildData();
  }, [fetchChildData]);

  // --- 2. UPDATE RECORD ---
  const handleUpdateRecord = async () => {
    if (!selectedVaccine) return alert("Please select a vaccine");
    
    setIsUpdating(true);
    try {
      const rawToken = localStorage.getItem('token');
      const token = rawToken?.replace(/"/g, '');
      
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
          status: 'COMPLETED'
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
    <div className="flex h-screen flex-col items-center justify-center bg-white gap-4">
      <Loader2 className="animate-spin text-emerald-600" size={40} />
      <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Accessing Medical Vault...</p>
    </div>
  );

  if (error) return (
    <div className="flex flex-col items-center justify-center h-screen p-10 text-center">
      <div className="bg-red-50 p-8 rounded-[2.5rem] border border-red-100 max-w-sm">
        <AlertCircle className="mx-auto text-red-500 mb-4" size={48} />
        <h2 className="text-xl font-black text-slate-900 uppercase tracking-tight">{error}</h2>
        <button 
            onClick={() => router.push('/dashboard')} 
            className="mt-6 w-full py-4 bg-slate-900 text-white rounded-2xl font-bold text-xs uppercase tracking-widest"
        >
            Return to Dashboard
        </button>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-slate-50 pb-28 relative">
      {/* --- TOP NAV --- */}
      <div className="bg-white/80 backdrop-blur-md border-b px-6 py-4 flex items-center justify-between sticky top-0 z-20">
        <button onClick={() => router.back()} className="p-2 hover:bg-slate-100 rounded-xl transition-all">
          <ChevronLeft size={24} />
        </button>
        <div className="flex flex-col items-center">
            <span className="font-black text-slate-900 uppercase tracking-tighter text-sm">Patient Card</span>
            <span className="text-[9px] font-bold text-slate-400 flex items-center gap-1 uppercase tracking-widest"><MapPin size={8}/> Obiaruku Sector</span>
        </div>
        <button onClick={() => window.print()} className="p-2 text-slate-600 hover:bg-slate-100 rounded-xl">
          <Printer size={20} />
        </button>
      </div>

      <div className="p-4 md:p-8 max-w-2xl mx-auto space-y-6">
        
        {/* --- PATIENT INFO CARD --- */}
        <div className="bg-white rounded-[2.5rem] p-8 shadow-xl shadow-slate-200/50 border border-slate-100">
          <div className="flex items-center gap-6">
            <div className="w-20 h-20 bg-gradient-to-br from-emerald-500 to-emerald-700 rounded-[2rem] flex items-center justify-center text-white text-3xl font-black shadow-xl shadow-emerald-100 shrink-0">
              {child?.firstName?.[0]}{child?.lastName?.[0]}
            </div>
            <div className="min-w-0">
              <h1 className="text-2xl font-black text-slate-900 uppercase tracking-tight truncate">
                {child?.firstName} {child?.lastName}
              </h1>
              <div className="flex flex-wrap items-center gap-3 mt-2">
                <span className="text-[10px] font-black text-emerald-600 bg-emerald-50 px-3 py-1 rounded-full flex items-center gap-1 border border-emerald-100">
                  <Hash size={10}/> {child?.uhid}
                </span>
                <span className="text-[10px] font-bold text-slate-500 bg-slate-100 px-3 py-1 rounded-full flex items-center gap-1">
                    <Calendar size={10}/> {child?.dateOfBirth ? new Date(child.dateOfBirth).toLocaleDateString('en-GB') : 'N/A'}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* --- IMMUNIZATION TIMELINE --- */}
        <div className="space-y-4">
          <h3 className="font-black text-slate-400 uppercase tracking-[0.2em] text-[10px] px-2">Immunization Record</h3>

          <div className="space-y-3">
            {child?.records?.length > 0 ? (
              child.records.map((rec: any, index: number) => (
                <div key={index} className="bg-white p-5 rounded-[2rem] border border-slate-100 flex items-center justify-between group hover:border-emerald-200 transition-all">
                  <div className="flex items-center gap-4">
                    <div className={`w-12 h-12 rounded-2xl flex items-center justify-center transition-colors ${
                      rec.status === 'COMPLETED' ? 'bg-emerald-50 text-emerald-600' : 'bg-amber-50 text-amber-600'
                    }`}>
                      {rec.status === 'COMPLETED' ? <CheckCircle2 size={20}/> : <Clock size={20}/>}
                    </div>
                    <div>
                      <h4 className="font-black text-slate-800 text-base">{rec.vaccineName}</h4>
                      <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mt-0.5">
                        {rec.status === 'COMPLETED' 
                          ? `Administered: ${new Date(rec.dateGiven || rec.updatedAt).toLocaleDateString()}` 
                          : `Scheduled: ${new Date(rec.nextDueDate || rec.dateDue).toLocaleDateString()}`}
                      </p>
                    </div>
                  </div>
                  <span className={`text-[9px] font-black px-3 py-1.5 rounded-xl uppercase tracking-widest border ${
                      rec.status === 'COMPLETED' 
                      ? 'bg-emerald-50 text-emerald-700 border-emerald-100' 
                      : 'bg-amber-50 text-amber-700 border-amber-100'
                  }`}>
                      {rec.status}
                  </span>
                </div>
              ))
            ) : (
              <div className="text-center py-16 bg-white rounded-[2.5rem] border border-dashed border-slate-200">
                <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">No history found</p>
              </div>
            )}
          </div>
        </div>

        {/* --- ACTION BAR --- */}
        <div className="fixed bottom-8 left-4 right-4 max-w-2xl mx-auto grid grid-cols-2 gap-4">
          <button 
            onClick={() => setIsUpdateOpen(true)}
            className="bg-slate-900 text-white p-5 rounded-[2rem] font-black text-xs uppercase tracking-widest shadow-2xl shadow-slate-400 flex items-center justify-center gap-2 hover:bg-emerald-600 transition-all active:scale-95"
          >
            <Plus size={18} /> Update Card
          </button>
          <button className="bg-white border border-slate-200 text-slate-600 p-5 rounded-[2rem] font-black text-xs uppercase tracking-widest shadow-lg hover:bg-slate-50 transition-all">
            Next Schedule
          </button>
        </div>
      </div>

      {/* --- MODAL --- */}
      {isUpdateOpen && (
        <div className="fixed inset-0 z-[100] flex items-end md:items-center justify-center p-4">
          <div className="absolute inset-0 bg-slate-900/40 backdrop-blur-md" onClick={() => setIsUpdateOpen(false)} />
          <div className="relative bg-white w-full max-w-md rounded-[3rem] p-10 shadow-2xl animate-in slide-in-from-bottom duration-300">
            <div className="flex justify-between items-center mb-8">
                <h2 className="text-2xl font-black text-slate-900 tracking-tighter uppercase">Administer</h2>
                <button onClick={() => setIsUpdateOpen(false)} className="p-2 bg-slate-100 rounded-full hover:bg-red-50 hover:text-red-500 transition-colors"><X size={20}/></button>
            </div>

            <div className="space-y-6">
              <div className="space-y-2">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] ml-2">Vaccine Stock</label>
                <select 
                  className="w-full p-5 bg-slate-50 border-2 border-transparent rounded-[1.5rem] font-bold text-slate-700 outline-none focus:border-emerald-500 transition-all appearance-none"
                  value={selectedVaccine}
                  onChange={(e) => setSelectedVaccine(e.target.value)}
                >
                  <option value="">Select vaccine...</option>
                  <option value="BCG">BCG (Tuberculosis)</option>
                  <option value="OPV_0">OPV 0 (Polio)</option>
                  <option value="PENTA_1">Pentavalent 1</option>
                  <option value="PCV_1">PCV 1</option>
                  <option value="ROTA_1">Rotavirus 1</option>
                  <option value="MEASLES_1">Measles 1</option>
                  <option value="YELLOW_FEVER">Yellow Fever</option>
                </select>
              </div>

              <div className="space-y-2">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] ml-2">Injection Date</label>
                <input 
                  type="date" 
                  className="w-full p-5 bg-slate-50 border-2 border-transparent rounded-[1.5rem] font-bold text-slate-700 outline-none focus:border-emerald-500 transition-all"
                  value={adminDate}
                  onChange={(e) => setAdminDate(e.target.value)}
                />
              </div>

              <button 
                onClick={handleUpdateRecord}
                disabled={isUpdating}
                className="w-full py-6 bg-emerald-600 text-white rounded-[2rem] font-black shadow-xl shadow-emerald-200 flex items-center justify-center gap-3 uppercase text-xs tracking-[0.2em] disabled:bg-slate-300 transition-all active:scale-95 mt-4"
              >
                {isUpdating ? <Loader2 className="animate-spin" size={20}/> : "Confirm Administration"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
