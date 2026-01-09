'use client';
import { useForm } from 'react-hook-form';
import { useRouter } from 'next/navigation';

export default function RegisterChild() {
  const { register, handleSubmit, formState: { isSubmitting } } = useForm();
  const router = useRouter();

  const onSubmit = async (data: any) => {
    try {
      const baseUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:10000';
      
      // 1. Get the token from localStorage
      const token = localStorage.getItem('token');

      // 2. Safety check: If no token exists, the user shouldn't be here
      if (!token) {
        throw new Error('You are not authorized. Please log in again.');
      }
      
      const response = await fetch(`${baseUrl}/api/register`, {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          // 3. ADD THIS LINE: Pass the token in the Bearer format
          'Authorization': `Bearer ${token}` 
        },
        body: JSON.stringify(data),
      });

      // Handle common authentication errors specifically
      if (response.status === 401 || response.status === 403) {
        localStorage.removeItem('token'); // Clear broken token
        router.push('/login');
        throw new Error('Session expired. Please log in again.');
      }

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Registration failed');
      }

      const result = await response.json();
      alert(`Success! UHID: ${result.uhid}`);
      
      router.push(`/child/${result.uhid}`);
    } catch (error: any) {
      // Improved error messaging for the team in Asaba
      const message = error.message === 'Failed to fetch' 
        ? "The server is taking a moment to wake up (Render Free Tier). Please wait 30 seconds and try again."
        : error.message;
        
      alert(`Registration Error: ${message}`);
    }
  };

  return (
    <div className="max-w-2xl mx-auto mt-10 p-8 glass-card rounded-3xl border border-white/20 shadow-xl bg-white/10 backdrop-blur-md">
      <div className="mb-8">
        <h1 className="text-3xl font-black text-slate-900 tracking-tight">New Child Registration</h1>
        <p className="text-slate-500 font-medium">Create a new digital immunization record for the national registry.</p>
      </div>
      
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-2">
            <label className="text-xs font-black text-slate-400 uppercase tracking-widest ml-1">First Name</label>
            <input 
              {...register('firstName')} 
              placeholder="e.g. John" 
              className="w-full p-4 rounded-2xl border border-slate-200 focus:ring-4 focus:ring-blue-500/10 focus:border-blue-600 outline-none transition-all bg-slate-50 font-bold" 
              required 
            />
          </div>
          <div className="space-y-2">
            <label className="text-xs font-black text-slate-400 uppercase tracking-widest ml-1">Last Name</label>
            <input 
              {...register('lastName')} 
              placeholder="e.g. Doe" 
              className="w-full p-4 rounded-2xl border border-slate-200 focus:ring-4 focus:ring-blue-500/10 focus:border-blue-600 outline-none transition-all bg-slate-50 font-bold" 
              required 
            />
          </div>
        </div>
        
        <div className="space-y-2">
          <label className="text-xs font-black text-slate-400 uppercase tracking-widest ml-1">Date of Birth</label>
          <input 
            {...register('dob')} 
            type="date" 
            className="w-full p-4 rounded-2xl border border-slate-200 focus:ring-4 focus:ring-blue-500/10 focus:border-blue-600 outline-none transition-all bg-slate-50 font-bold text-slate-700" 
            required 
          />
        </div>
        
        <div className="space-y-2">
          <label className="text-xs font-black text-slate-400 uppercase tracking-widest ml-1">Guardian Phone Number</label>
          <input 
            {...register('guardianPhone')} 
            type="tel"
            placeholder="080 0000 0000" 
            className="w-full p-4 rounded-2xl border border-slate-200 focus:ring-4 focus:ring-blue-500/10 focus:border-blue-600 outline-none transition-all bg-slate-50 font-bold" 
            required 
          />
        </div>
        
        <button 
          disabled={isSubmitting}
          className="w-full py-5 bg-blue-600 hover:bg-blue-700 text-white rounded-2xl font-black uppercase tracking-widest shadow-xl shadow-blue-200 transition-all disabled:bg-slate-300 disabled:shadow-none mt-4 flex items-center justify-center gap-3"
        >
          {isSubmitting ? (
            <>
              <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              <span>Syncing with Health Cloud...</span>
            </>
          ) : 'Create Digital Health Record'}
        </button>
      </form>
    </div>
  );
}