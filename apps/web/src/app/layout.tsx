"use client"; // Added this so we can track the active page

// @ts-ignore: CSS side-effect import without type declarations
import './globals.css';
import { Inter } from 'next/font/google';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

const inter = Inter({ subsets: ['latin'] });

export default function RootLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  // Helper function to highlight the active link
  const isActive = (path: string) => pathname === path ? "text-blue-600 border-b-2 border-blue-600" : "text-slate-600 hover:text-blue-600";

  return (
    <html lang="en">
      <body className={`${inter.className} bg-slate-50 text-slate-900`}>
        <nav className="sticky top-0 z-50 border-b border-slate-200 bg-white/80 backdrop-blur-md">
          <div className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between">
            
            {/* Logo */}
            <Link href="/" className="flex items-center gap-2 text-xl font-bold text-blue-600 tracking-tight">
              <span className="bg-blue-600 text-white p-1 rounded-md">IT</span>
              ImmuniTrack
            </Link>

            {/* Navigation Links */}
            <div className="hidden md:flex items-center space-x-8 h-full">
              <Link href="/dashboard" className={`text-sm font-medium h-16 flex items-center transition-all ${isActive('/dashboard')}`}>
                Dashboard
              </Link>
              <Link href="/search" className={`text-sm font-medium h-16 flex items-center transition-all ${isActive('/search')}`}>
                Search Records
              </Link>
            </div>

            {/* Action Buttons */}
            <div className="flex items-center space-x-4">
              <Link 
                href="/login" 
                className="text-sm font-medium text-slate-600 hover:text-blue-600 transition-colors"
              >
                Login
              </Link>

              <Link href="/register-child">
                <button className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-all shadow-md active:scale-95">
                  Register Child
                </button>
              </Link>
            </div>
          </div>
        </nav>

        {/* Main Content Area */}
        <main className="min-h-[calc(100vh-120px)] pb-10">
          {children}
        </main>

        {/* Production Footer */}
        <footer className="bg-white border-t border-slate-200 py-6">
          <div className="max-w-7xl mx-auto px-4 text-center text-slate-400 text-xs">
            <p>© 2026 ImmuniTrack Vercel Production Deployment. All medical records are encrypted.</p>
          </div>
        </footer>
      </body>
    </html>
  );
}