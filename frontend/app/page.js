import Link from 'next/link';
import { Target } from 'lucide-react';

export default function LandingPage() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-[#06090f] text-white px-4">
      {/* Navbar Branding */}
      <div className="absolute top-8 left-8 flex items-center gap-2">
        <div className="bg-indigo-600 p-1.5 rounded-lg">
          <Target className="text-white" size={24} />
        </div>
        <span className="text-xl font-bold tracking-tight">IntelliFin</span>
      </div>

      <div className="absolute top-8 right-8 flex items-center gap-8">
        <nav className="hidden md:flex gap-8 text-sm font-medium text-slate-400">
          <Link href="#" className="hover:text-white transition-colors">How it works</Link>
          <Link href="#" className="hover:text-white transition-colors">Philosophy</Link>
        </nav>
        <Link href="/dashboard" className="px-5 py-2.5 bg-white/5 hover:bg-white/10 border border-white/10 rounded-lg text-sm font-semibold transition-all">
          Launch Dashboard
        </Link>
      </div>

      <div className="max-w-4xl text-center space-y-10">
        <div className="inline-block px-4 py-1.5 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 text-xs font-bold uppercase tracking-wider">
          Intelligent Financial Modelling
        </div>

        <h1 className="text-7xl font-bold tracking-tight text-white leading-[1.1]">
          Understand intrinsic value, <br />
          <span className="text-slate-500">not just market noise.</span>
        </h1>

        <p className="text-xl text-slate-400 max-w-2xl mx-auto leading-relaxed">
          A purpose-built platform for fundamental storage, forecasting, and DCF valuation.
          No black boxes. No hype. Just the numbers that matter.
        </p>

        <div className="flex justify-center pt-4">
          <Link href="/dashboard" className="px-10 py-4 bg-indigo-600 hover:bg-indigo-500 rounded-xl font-bold transition-all transform hover:scale-105 shadow-2xl shadow-indigo-600/20 flex items-center gap-3">
            View Valuation Dashboard
            <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M4.16669 10H15.8334M15.8334 10L10.8334 5M15.8334 10L10.8334 15" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </Link>
        </div>
      </div>

      {/* Decorative Browser Frame Snippet */}
      <div className="mt-24 w-full max-w-5xl rounded-t-3xl border-t border-x border-slate-800 bg-slate-900/40 h-20 backdrop-blur-sm shadow-2xl shadow-black">
        <div className="flex gap-2 p-5 border-b border-slate-800">
          <div className="w-3 h-3 rounded-full bg-slate-700"></div>
          <div className="w-3 h-3 rounded-full bg-slate-700"></div>
          <div className="w-3 h-3 rounded-full bg-slate-700"></div>
        </div>
      </div>
    </div>
  );
}
