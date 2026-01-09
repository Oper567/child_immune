'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Lock, Mail, Hospital } from 'lucide-react';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const baseUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:10000';
      const res = await fetch(`${baseUrl}/api/worker/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });

      const data = await res.json();

      if (res.ok) {
        // ✅ Logic: Save the token and clinic name so the app "remembers" the worker
        localStorage.setItem('token', data.token);
        localStorage.setItem('workerName', data.name);
        localStorage.setItem('clinicName', data.clinicName);
        
        router.push('/dashboard');
      } else {
        alert(data.error || "Login failed");
      }
    } catch (err) {
      alert("Server is waking up. Please try again in 10 seconds.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[80vh] flex flex-col justify-center px-6">
      <div className="text-center mb-8">
        <div className="inline-flex p-4 bg-blue-600 text-white rounded-3xl mb-4 shadow-xl shadow-blue-200">
          <Hospital size={32} />
        </div>
        <h1 className="text-3xl font-extrabold text-slate-900">Health Portal</h1>
        <p className="text-slate-500 mt-2">Enter your credentials to access records</p>
      </div>

      <form onSubmit={handleLogin} className="space-y-4 max-w-sm mx-auto w-full">
        <div className="relative">
          <Mail className="absolute left-4 top-4 text-slate-400" size={20} />
          <input 
            type="email" 
            placeholder="Work Email" 
            className="w-full p-4 pl-12 rounded-2xl border border-slate-200 bg-white outline-none focus:border-blue-500 transition-all"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
        </div>

        <div className="relative">
          <Lock className="absolute left-4 top-4 text-slate-400" size={20} />
          <input 
            type="password" 
            placeholder="Password" 
            className="w-full p-4 pl-12 rounded-2xl border border-slate-200 bg-white outline-none focus:border-blue-500 transition-all"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
        </div>

        <button 
          disabled={loading}
          className="w-full py-4 bg-blue-600 text-white rounded-2xl font-bold shadow-lg shadow-blue-100 active:scale-95 transition-all disabled:bg-slate-300"
        >
          {loading ? "Authenticating..." : "Sign In"}
        </button>
      </form>
    </div>
  );
}