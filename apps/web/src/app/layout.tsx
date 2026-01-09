"use client";

import './globals.css'; 
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
  X,
  Loader2
} from 'lucide-react';
import { useState, useEffect } from 'react';

const inter = Inter({ subsets: ['latin'] });

export default function RootLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const [isSidebarOpen, setSidebarOpen] = useState(false);
  const [workerName, setWorkerName] = useState('Health Worker');
  const [isCheckingAuth, setIsCheckingAuth] = useState(true);

  // --- Auth & Profile Management ---
  useEffect(() => {
    const token = localStorage.getItem('token');
    const storedName = localStorage.getItem('workerName');
    
    if (storedName) setWorkerName(storedName);

    const publicRoutes = ['/login', '/register-worker', '/'];
    const isPublicRoute = publicRoutes.includes(pathname);

    if (!token && !isPublicRoute) {
      router.push('/login');
    } else {
      setIsCheckingAuth(false);
    }
  }, [pathname, router]);

  const handleLogout = () => {
    localStorage.clear();
    router.push('/login');
  };

  // Prevent UI flashing while checking authentication
  if (isCheckingAuth && !['/login', '/register-worker', '/'].includes(pathname)) {
    return (
      <html lang="en">
        <body className="h-screen flex items-center justify-center bg-white">
          <Loader2 className="animate-spin text-blue-600" size={40} />
        </body>
      </html>
    );
  }

  return (
    <html lang="en" className="h-full">
      <body className={`${inter.className} bg-slate-50 text-slate-900 h-full pb-24 md:pb-0 md:pl-64 transition-all`}>
        
        {/* --- MOBILE OVERLAY SIDEBAR --- */}
        {isSidebarOpen && (
          <div className="fixed inset-0 z-[60] md:hidden">
            <div className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm" onClick={() => setSidebarOpen(false)} />
            <aside className="absolute left-0 top-0 bottom-0 w-72 bg-white p-6 shadow-2xl flex flex-col">
              <div className="flex justify-between items-center mb-10">
                <span className="font-black text-blue-600 text-xl tracking-tighter">ImmuniTrack</span>
                <button onClick={() => setSidebarOpen(false)} className="p-2 bg-slate-100 rounded-full"><X size={20}/></button>
              </div>
              <div className="space-y-3 flex-1">
                <SidebarLink href="/dashboard" icon={<LayoutDashboard size={20}/>} label="Dashboard" active={pathname === '/dashboard'} onClick={() => setSidebarOpen(false)} />
                <SidebarLink href="/search" icon={<Search size={20}/>} label="Search Records" active={pathname === '/search'} onClick={() => setSidebarOpen(false)} />
                <SidebarLink href="/register-child" icon={<PlusCircle size={20}/>} label="Register Child" active={pathname === '/register-child'} onClick={() => setSidebarOpen(false)} />
                <SidebarLink href="/records" icon={<Home size={20}/>} label="Clinic Inventory" active={pathname === '/records'} onClick={() => setSidebarOpen(false)} />
              </div>
              <button onClick={handleLogout} className="flex items-center gap-3 p-4 text-red-500 font-bold border-t">
                <LogOut size={20}/> Logout
              </button>
            </aside>
          </div>
        )}

        {/* --- 1. MOBILE TOP HEADER --- */}
        <header className="md:hidden sticky top-0 z-40 border-b border-slate-200 bg-white/80 backdrop-blur-lg px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button onClick={() => setSidebarOpen(true)} className="p-2 text-slate-600 active:scale-90 transition-transform bg-slate-100 rounded-xl">
              <Menu size={22} />
            </button>
            <span className="text-lg font-black text-blue-600 tracking-tighter">ImmuniTrack</span>
          </div>
          <Link href="/profile" className="active:scale-95 transition-transform">
            <div className="w-10 h-10 bg-blue-600 rounded-xl flex items-center justify-center text-white text-xs font-black shadow-lg shadow-blue-200 uppercase">
              {workerName.substring(0, 2)}
            </div>
          </Link>
        </header>

        {/* --- 2. DESKTOP SIDEBAR --- */}
        <nav className="hidden md:flex fixed left-0 top-0 bottom-0 w-64 bg-white border-r border-slate-200 p-6 flex-col justify-between">
          <div className="space-y-8">
            <Link href="/dashboard" className="flex items-center gap-2 text-2xl font-black text-blue-600 tracking-tighter">
              <div className="bg-blue-600 text-white w-10 h-10 flex items-center justify-center rounded-xl shadow-lg shadow-blue-100">IT</div>
              <span>ImmuniTrack</span>
            </Link>

            <div className="space-y-1">
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-4 mb-3">Main Registry</p>
              <SidebarLink href="/dashboard" icon={<LayoutDashboard size={20}/>} label="Dashboard" active={pathname === '/dashboard'} />
              <SidebarLink href="/search" icon={<Search size={20}/>} label="Search Child" active={pathname === '/search'} />
              <SidebarLink href="/register-child" icon={<PlusCircle size={20}/>} label="New Registration" active={pathname === '/register-child'} />
              <SidebarLink href="/records" icon={<Home size={20}/>} label="Clinic Inventory" active={pathname === '/records'} />
            </div>
          </div>

          <div className="space-y-1 border-t pt-6">
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

        {/* --- 3. MAIN CONTENT --- */}
        <main className="min-h-full">
          {children}
        </main>

        {/* --- 4. MOBILE BOTTOM NAV --- */}
        <nav className="fixed bottom-0 left-0 right-0 z-50 bg-white/90 backdrop-blur-xl border-t border-slate-200 px-6 py-3 md:hidden">
          <div className="flex items-center justify-between max-w-md mx-auto relative">
            <BottomNavLink href="/dashboard" icon={<LayoutDashboard size={24}/>} label="Home" active={pathname === '/dashboard'} />
            <BottomNavLink href="/search" icon={<Search size={24}/>} label="Search" active={pathname === '/search'} />
            
            <Link href="/register-child" className="-mt-14 active:scale-90 transition-transform">
              <div className="bg-blue-600 text-white p-4 rounded-2xl shadow-2xl shadow-blue-400 border-[6px] border-slate-50">
                <PlusCircle size={28} />
              </div>
            </Link>

            <BottomNavLink href="/records" icon={<Home size={24}/>} label="Clinic" active={pathname === '/records'} />
            <BottomNavLink href="/profile" icon={<User size={24}/>} label="Profile" active={pathname === '/profile'} />
          </div>
        </nav>
      </body>
    </html>
  );
}

// Sub-components for cleaner code
function SidebarLink({ href, icon, label, active, onClick }: any) {
  return (
    <Link 
      href={href} 
      onClick={onClick}
      className={`flex items-center gap-3 px-4 py-3.5 rounded-2xl transition-all font-bold text-sm ${
        active ? 'bg-blue-600 text-white shadow-lg shadow-blue-100' : 'text-slate-500 hover:bg-slate-100'
      }`}
    >
      {icon}
      {label}
    </Link>
  );
}

function BottomNavLink({ href, icon, label, active }: any) {
  return (
    <Link href={href} className={`flex flex-col items-center gap-1 transition-all ${active ? 'text-blue-600 scale-110' : 'text-slate-400'}`}>
      {icon}
      <span className="text-[9px] font-black uppercase tracking-tighter">{label}</span>
    </Link>
  );
}