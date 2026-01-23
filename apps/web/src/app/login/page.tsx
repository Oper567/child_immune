'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Lock, Mail, Hospital, Loader2, ArrowRight, Eye, EyeOff } from 'lucide-react';
import Link from 'next/link';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPass, setShowPass] = useState(false);

  const router = useRouter();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const baseUrl = process.env.NEXT_PUBLIC_API_URL;

      if (!baseUrl) {
        alert('NEXT_PUBLIC_API_URL is not set. Add it to your .env and redeploy/restart.');
        return;
      }

      const res = await fetch(`${baseUrl}/api/worker/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: email.trim().toLowerCase(),
          password,
        }),
      });

      const data = await res.json().catch(() => ({}));

      if (res.ok) {
        // Save credentials + role for RootLayout
        localStorage.setItem('token', data.token);
        localStorage.setItem('workerName', data.name || '');
        localStorage.setItem('clinicName', data.clinicName || '');
        localStorage.setItem('role', data.role || 'worker');

        router.push('/dashboard');
      } else {
        alert(data.error || data.message || 'Login failed');
      }
    } catch (err) {
      alert('Server is waking up or network failed. Try again in a few seconds.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col justify-center bg-slate-50 px-6">
      <div className="max-w-sm mx-auto w-full">
        {/* Branding */}
        <div className="text-center mb-10">
          <div className="inline-flex p-5 bg-emerald-600 text-white rounded-[2rem] mb-6 shadow-2xl shadow-emerald-200">
            <Hospital size={38} />
          </div>
          <h1 className="text-4xl font-black text-slate-900 tracking-tighter">ObiTrack</h1>
          <p className="text-slate-500 font-bold uppercase text-[10px] tracking-[0.2em] mt-2">
            Obiaruku Health Records Node
          </p>
        </div>

        {/* Login Card */}
        <div className="bg-white p-8 rounded-[2.5rem] shadow-xl shadow-slate-200/60 border border-slate-100">
          <form onSubmit={handleLogin} className="space-y-5">
            <div className="space-y-2">
              <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-2">
                Email Address
              </label>
              <div className="relative">
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                <input
                  type="email"
                  placeholder="name@clinic.com"
                  className="w-full p-4 pl-12 rounded-2xl bg-slate-50 border-none outline-none focus:ring-2 focus:ring-emerald-500 transition-all font-bold text-slate-700"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  autoComplete="email"
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-2">
                Security Password
              </label>
              <div className="relative">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                <input
                  type={showPass ? 'text' : 'password'}
                  placeholder="••••••••"
                  className="w-full p-4 pl-12 pr-12 rounded-2xl bg-slate-50 border-none outline-none focus:ring-2 focus:ring-emerald-500 transition-all font-bold text-slate-700"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  autoComplete="current-password"
                />

                <button
                  type="button"
                  onClick={() => setShowPass((v) => !v)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                  aria-label={showPass ? 'Hide password' : 'Show password'}
                >
                  {showPass ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>

            <button
              disabled={loading}
              className="w-full py-5 bg-emerald-600 text-white rounded-2xl font-black shadow-xl shadow-emerald-200 active:scale-[0.98] transition-all disabled:bg-slate-300 flex items-center justify-center gap-2 uppercase text-xs tracking-widest"
            >
              {loading ? <Loader2 className="animate-spin" size={20} /> : <>Enter Dashboard <ArrowRight size={18} /></>}
            </button>
          </form>
        </div>

        {/* Footer */}
        <div className="mt-8 text-center space-y-4">
          <p className="text-sm font-bold text-slate-400">
            New health worker?{' '}
            <Link href="/register-worker" className="text-emerald-600 hover:underline">
              Create Account
            </Link>
          </p>
          <div className="h-px bg-slate-200 w-12 mx-auto"></div>
          <p className="text-[10px] font-bold text-slate-300 uppercase tracking-[0.3em]">
            Authorized Personnel Only
          </p>
        </div>
      </div>
    </div>
  );
}
