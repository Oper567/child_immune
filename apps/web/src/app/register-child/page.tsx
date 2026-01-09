'use client';
import { useForm } from 'react-hook-form';
import { useRouter } from 'next/navigation';

export default function RegisterChild() {
  const { register, handleSubmit, formState: { isSubmitting } } = useForm();
  const router = useRouter();

  const onSubmit = async (data: any) => {
    try {
      // ✅ Use the Environment Variable we set in .env.local
      // Falls back to localhost:10000 if the variable is missing
      const baseUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:10000';
      
      const response = await fetch(`${baseUrl}/api/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Registration failed');
      }

      const result = await response.json();
      alert(`Success! UHID: ${result.uhid}`);
      
      // Redirect to the child's new timeline page
      router.push(`/child/${result.uhid}`);
    } catch (error: any) {
      // ✅ Better error message for production
      alert(`Connection Error: ${error.message}. (Note: Render free tier may take 40s to wake up)`);
    }
  };

  return (
    <div className="max-w-2xl mx-auto mt-10 p-8 glass-card rounded-3xl border border-white/20 shadow-xl bg-white/10 backdrop-blur-md">
      <h1 className="text-2xl font-bold mb-6 text-slate-800">New Child Registration</h1>
      
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-1">
            <label className="text-xs font-semibold text-slate-500 ml-1">First Name</label>
            <input {...register('firstName')} placeholder="e.g. John" className="w-full p-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-blue-500 outline-none transition-all" required />
          </div>
          <div className="space-y-1">
            <label className="text-xs font-semibold text-slate-500 ml-1">Last Name</label>
            <input {...register('lastName')} placeholder="e.g. Doe" className="w-full p-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-blue-500 outline-none transition-all" required />
          </div>
        </div>
        
        <div className="space-y-1">
          <label className="text-xs font-semibold text-slate-500 ml-1">Date of Birth</label>
          <input {...register('dob')} type="date" className="w-full p-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-blue-500 outline-none transition-all" required />
        </div>
        
        <div className="space-y-1">
          <label className="text-xs font-semibold text-slate-500 ml-1">Guardian Phone Number</label>
          <input {...register('guardianPhone')} placeholder="080..." className="w-full p-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-blue-500 outline-none transition-all" required />
        </div>
        
        <button 
          disabled={isSubmitting}
          className="w-full py-4 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-bold shadow-lg shadow-blue-200 transition-all disabled:bg-slate-400 disabled:shadow-none mt-4"
        >
          {isSubmitting ? 'Syncing with Health Cloud...' : 'Create Digital Health Record'}
        </button>
      </form>
    </div>
  );
}