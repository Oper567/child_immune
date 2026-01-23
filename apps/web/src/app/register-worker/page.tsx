"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { UserPlus, Mail, Lock, User, ShieldCheck, ArrowRight, Loader2 } from "lucide-react";
import Link from "next/link";

export default function RegisterWorker() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    workerId: "",
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const baseUrl = process.env.NEXT_PUBLIC_API_URL;
      if (!baseUrl) {
        alert("NEXT_PUBLIC_API_URL is not set. Add it to .env.local and restart.");
        return;
      }

      const payload = {
        name: formData.name.trim(),
        email: formData.email.trim().toLowerCase(),
        workerId: formData.workerId.trim().toUpperCase(),
        password: formData.password,
      };

      // Worker ID format check (adjust if your format differs)
      if (!/^OB-2024-\d{4}$/.test(payload.workerId)) {
        alert("Invalid Worker ID. Use format: OB-2024-1234");
        return;
      }

      const res = await fetch(`${baseUrl}/api/worker/register`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await res.json().catch(() => ({}));

      if (res.ok) {
        // Store token + profile info (match what your backend returns)
        if (data.token) localStorage.setItem("token", data.token);
        localStorage.setItem("workerName", data.name || payload.name);
        if (data.clinicName) localStorage.setItem("clinicName", data.clinicName);
        localStorage.setItem("role", data.role || "worker");

        router.push("/dashboard");
      } else {
        alert(data.error || data.message || "Registration failed");
      }
    } catch (err) {
      alert("Server is waking up or network failed. Try again in a few seconds.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-6">
      <div className="w-full max-w-md">
        <div className="text-center mb-10">
          <div className="bg-emerald-600 w-16 h-16 rounded-3xl shadow-2xl shadow-emerald-200 flex items-center justify-center text-white mx-auto mb-6">
            <UserPlus size={32} />
          </div>
          <h1 className="text-3xl font-black text-slate-900 tracking-tighter">Join ObiTrack</h1>
          <p className="text-slate-500 font-medium mt-2">Create your health worker account</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="bg-white p-8 rounded-[2.5rem] shadow-xl shadow-slate-200/60 border border-slate-100 space-y-5">
            {/* Full Name */}
            <div className="space-y-2">
              <label className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 ml-2">
                Full Name
              </label>
              <div className="relative">
                <User className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                <input
                  type="text"
                  required
                  placeholder="Dr. John Doe"
                  className="w-full pl-12 pr-6 py-4 bg-slate-50 border-none rounded-2xl focus:ring-2 focus:ring-emerald-500 transition-all font-bold text-slate-700 placeholder:text-slate-300"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                />
              </div>
            </div>

            {/* Email */}
            <div className="space-y-2">
              <label className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 ml-2">
                Email Address
              </label>
              <div className="relative">
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                <input
                  type="email"
                  required
                  placeholder="john@clinic.com"
                  className="w-full pl-12 pr-6 py-4 bg-slate-50 border-none rounded-2xl focus:ring-2 focus:ring-emerald-500 transition-all font-bold text-slate-700 placeholder:text-slate-300"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                />
              </div>
            </div>

            {/* Worker ID */}
            <div className="space-y-2">
              <label className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 ml-2">
                Worker ID
              </label>
              <div className="relative">
                <ShieldCheck className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                <input
                  type="text"
                  required
                  placeholder="OB-2024-1234"
                  className="w-full pl-12 pr-6 py-4 bg-slate-50 border-none rounded-2xl focus:ring-2 focus:ring-emerald-500 transition-all font-bold text-slate-700 placeholder:text-slate-300"
                  value={formData.workerId}
                  onChange={(e) => setFormData({ ...formData, workerId: e.target.value })}
                />
              </div>
            </div>

            {/* Password */}
            <div className="space-y-2">
              <label className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 ml-2">
                Secure Password
              </label>
              <div className="relative">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                <input
                  type="password"
                  required
                  placeholder="••••••••"
                  className="w-full pl-12 pr-6 py-4 bg-slate-50 border-none rounded-2xl focus:ring-2 focus:ring-emerald-500 transition-all font-bold text-slate-700 placeholder:text-slate-300"
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                />
              </div>
            </div>

            <button
              disabled={loading}
              className="w-full bg-emerald-600 hover:bg-emerald-700 text-white py-5 rounded-2xl font-black shadow-xl shadow-emerald-200 transition-all flex items-center justify-center gap-3 uppercase text-sm tracking-widest disabled:opacity-50"
            >
              {loading ? <Loader2 className="animate-spin" /> : <>Complete Registration <ArrowRight size={18} /></>}
            </button>
          </div>
        </form>

        <p className="text-center mt-8 text-slate-400 font-bold text-sm">
          Already registered?{" "}
          <Link href="/login" className="text-emerald-600 hover:underline">
            Sign In
          </Link>
        </p>
      </div>
    </div>
  );
}
