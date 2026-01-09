"use client";

import './globals.css'; // Ensure this file exists in apps/web/app/
import { Inter } from 'next/font/google';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { 
  Home, 
  Search, 
  PlusCircle, 
  User, 
  LayoutDashboard, 
  LogOut,
  Settings,
  Menu,
  X
} from 'lucide-react';
import { useState, useEffect } from 'react';

const inter = Inter({ subsets: ['latin'] });

export default function RootLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const [isSidebarOpen, setSidebarOpen] = useState(false);
  const [workerName, setWorkerName] = useState('Health Worker');

  // 1. Auth Logic: Check if worker is logged in
  useEffect(() => {
    const token = localStorage.getItem('token');
    const storedName = localStorage.getItem('workerName');
    
    if (storedName) setWorkerName(storedName);

    // If no token and not on login/register pages, redirect to login
    if (!token && pathname !== '/login' && pathname !== '/register-worker' && pathname !== '/') {
      router.push('/login');
    }
  }, [pathname, router]);

  const handleLogout = () => {
    localStorage.clear();
    router.push('/login');
  };

  const isActive = (path: string) => 
    pathname === path ? "text-blue-600 bg-blue-50" : "text-slate-500 hover:bg-slate-50";

  return (
    <html lang="en">
      <body className={`${inter.className} bg-slate-50 text-slate-900 pb-20 md:pb-0 md:pl-64`}>
        
        {/* --- MOBILE OVERLAY SIDEBAR --- */}
        {isSidebarOpen && (
          <div className="fixed inset-0 z-[60] md:hidden">
            <div className="absolute inset-0 bg-slate-900/50 backdrop-blur-sm" onClick={() => setSidebarOpen(false)} />
            <aside className="absolute left-0 top-0 bottom-0 w-72 bg-white p-6 shadow-xl">
              <div className="flex justify-between items-center mb-8">
                <span className="font-bold text-blue-600 text-xl">Menu</span>
                <button onClick={() => setSidebarOpen(false)}><X /></button>
              </div>
              <div className="space-y-2">
                <SidebarLink href="/dashboard" icon={<LayoutDashboard size={20}/>} label="Dashboard" active={pathname === '/dashboard'} onClick={() => setSidebarOpen(false)} />
                <SidebarLink href="/search" icon={<Search size={20}/>} label="Search Records" active={pathname === '/search'} onClick={() => setSidebarOpen(false)} />
                <SidebarLink href="/register-child" icon={<PlusCircle size={20}/>} label="Register Child" active={pathname === '/register-child'} onClick={() => setSidebarOpen(false)} />
                <SidebarLink href="/records" icon={<Home size={20}/>} label="Inventory" active={pathname === '/records'} onClick={() => setSidebarOpen(false)} />
              </div>
            </aside>
          </div>
        )}

        {/* --- 1. TOP HEADER (Mobile Only) --- */}
        <header className="md:hidden sticky top-0 z-40 border-b border-slate-200 bg-white/90 backdrop-blur-md px-4 h-14 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <button onClick={() => setSidebarOpen(true)} className="p-1 text-slate-500 active:scale-95 transition-transform">
              <Menu size={22} />
            </button>
            <Link href="/" className="text-lg font-black text-blue-600 tracking-tighter">
              ImmuniTrack
            </Link>
          </div>
          <Link href="/profile" className="flex items-center gap-2">
            <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center text-white text-[10px] font-bold shadow-md shadow-blue-200">
              {workerName.substring(0, 2).toUpperCase()}
            </div>
          </Link>
        </header>

        {/* --- 2. DESKTOP SIDEBAR --- */}
        <nav className="hidden md:flex fixed left-0 top-0 bottom-0 w-64 bg-white border-r border-slate-200 p-6 flex-col justify-between">
          <div className="space-y-8">
            <Link href="/" className="flex items-center gap-2 text-2xl font-black text-blue-600 tracking-tighter">
              <span className="bg-blue-600 text-white px-2 py-0.5 rounded-lg">IT</span>
              <span>ImmuniTrack</span>
            </Link>

            <div className="space-y-1">
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-4 mb-2">Main Registry</p>
              <SidebarLink href="/dashboard" icon={<LayoutDashboard size={20}/>} label="Dashboard" active={pathname === '/dashboard'} />
              <SidebarLink href="/search" icon={<Search size={20}/>} label="Search Child" active={pathname === '/search'} />
              <SidebarLink href="/register-child" icon={<PlusCircle size={20}/>} label="New Registration" active={pathname === '/register-child'} />
              <SidebarLink href="/records" icon={<Home size={20}/>} label="Vaccine List" active={pathname === '/records'} />
            </div>
          </div>

          <div className="space-y-1 border-t pt-4">
             <SidebarLink href="/settings" icon={<Settings size={20}/>} label="Settings" active={pathname === '/settings'} />
             <button 
              onClick={handleLogout}
              className="flex items-center gap-3 w-full px-4 py-3 text-slate-500 hover:bg-red-50 hover:text-red-600 rounded-xl transition-all font-bold text-sm"
             >
               <LogOut size={20} />
               Logout
             </button>
          </div>
        </nav>

        {/* --- 3. MAIN CONTENT AREA --- */}
        <main className="min-h-screen">
          {children}
        </main>

        {/* --- 4. MOBILE BOTTOM NAVIGATION --- */}
        <nav className="fixed bottom-0 left-0 right-0 z-50 bg-white/80 backdrop-blur-lg border-t border-slate-200 px-6 py-2 md:hidden">
          <div className="flex items-center justify-between max-w-md mx-auto">
            <Link href="/dashboard" className={`flex flex-col items-center gap-1 transition-colors ${pathname === '/dashboard' ? 'text-blue-600' : 'text-slate-400'}`}>
              <LayoutDashboard size={22} />
              <span className="text-[10px] font-bold">Home</span>
            </Link>

            <Link href="/search" className={`flex flex-col items-center gap-1 transition-colors ${pathname === '/search' ? 'text-blue-600' : 'text-slate-400'}`}>
              <Search size={22} />
              <span className="text-[10px] font-bold">Search</span>
            </Link>

            <Link href="/register-child" className="-mt-12">
              <div className="bg-blue-600 text-white p-4 rounded-full shadow-xl shadow-blue-300 active:scale-90 transition-all border-[6px] border-slate-50">
                <PlusCircle size={28} />
              </div>
            </Link>

            <Link href="/records" className={`flex flex-col items-center gap-1 transition-colors ${pathname === '/records' ? 'text-blue-600' : 'text-slate-400'}`}>
              <Home size={22} />
              <span className="text-[10px] font-bold">Clinic</span>
            </Link>

            <Link href="/profile" className={`flex flex-col items-center gap-1 transition-colors ${pathname === '/profile' ? 'text-blue-600' : 'text-slate-400'}`}>
              <User size={22} />
              <span className="text-[10px] font-bold">Profile</span>
            </Link>
          </div>
        </nav>
      </body>
    </html>
  );
}

function SidebarLink({ href, icon, label, active, onClick }: any) {
  return (
    <Link 
      href={href} 
      onClick={onClick}
      className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all font-bold text-sm ${
        active ? 'bg-blue-50 text-blue-600' : 'text-slate-500 hover:bg-slate-50'
      }`}
    >
      {icon}
      {label}
    </Link>
  );
}