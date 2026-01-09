'use client';
import { useForm } from 'react-hook-form';
import { useRouter } from 'next/navigation'; // For redirecting

export default function RegisterChild() {
  const { register, handleSubmit, formState: { isSubmitting } } = useForm();
  const router = useRouter();

  const onSubmit = async (data: any) => {
    try {
      const response = await fetch('http://localhost:5001/api/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });

      if (!response.ok) throw new Error('Registration failed');

      const result = await response.json();
      alert(`Success! UHID: ${result.uhid}`);
      
      // Redirect to the child's new timeline page
      router.push(`/child/${result.uhid}`);
    } catch (error) {
      alert("Error: Make sure your server is running on port 5000");
    }
  };

  return (
    <div className="max-w-2xl mx-auto mt-10 p-8 glass-card rounded-3xl">
      <h1 className="text-2xl font-bold mb-6">New Child Registration</h1>
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <input {...register('firstName')} placeholder="First Name" className="w-full p-3 rounded-xl border" required />
        <input {...register('lastName')} placeholder="Last Name" className="w-full p-3 rounded-xl border" required />
        <input {...register('dob')} type="date" className="w-full p-3 rounded-xl border" required />
        <input {...register('guardianPhone')} placeholder="Guardian Phone" className="w-full p-3 rounded-xl border" required />
        
        <button 
          disabled={isSubmitting}
          className="w-full py-4 bg-blue-600 text-white rounded-xl font-bold disabled:bg-slate-400"
        >
          {isSubmitting ? 'Saving to Records...' : 'Create Digital Record'}
        </button>
      </form>
    </div>
  );
}