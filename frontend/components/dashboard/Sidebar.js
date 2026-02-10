"use client";
import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { LayoutGrid, History, TrendingUp, Calculator, FileText, SlidersHorizontal, LogOut, ArrowLeft, X } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';

const SidebarItem = ({ icon: Icon, label, href, active }) => (
    <Link href={href}>
        <div className={`flex items-center gap-4 px-5 py-3.5 rounded-xl transition-all cursor-pointer group mb-2 border ${active ? 'bg-indigo-600/20 text-white border-indigo-500/40 shadow-lg shadow-indigo-500/10' : 'text-slate-400 hover:bg-white/5 hover:text-white border-transparent'}`}>
            <Icon size={20} className={active ? 'text-indigo-400' : 'group-hover:text-indigo-300'} />
            <span className={`text-[13px] font-bold tracking-tight ${active ? 'text-white' : 'text-slate-300'}`}>{label}</span>
        </div>
    </Link>
);

export default function Sidebar({ onClose, isMobile }) {
    const pathname = usePathname();
    const { logout } = useAuth();

    const items = [
        { icon: LayoutGrid, label: 'Overview', href: '/dashboard' },
        { icon: History, label: 'Historical Data', href: '/dashboard/historical' },
        { icon: TrendingUp, label: '5-Year Forecast', href: '/dashboard/forecast' },
        { icon: Calculator, label: 'Valuation', href: '/dashboard/valuation' },
        { icon: SlidersHorizontal, label: 'Scenarios', href: '/dashboard/scenarios' },
    ];

    return (
        <aside className="w-full bg-[#0a0a0a] h-full border-r border-white/5 flex flex-col p-6 text-white overflow-y-auto">
            {/* Mobile Header inside Sidebar */}
            <div className="flex items-center justify-between mb-10 lg:mb-12">
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-indigo-600 rounded-xl flex items-center justify-center text-white text-sm font-black shadow-lg shadow-indigo-600/20 ring-1 ring-white/10">
                        IV
                    </div>
                    <div>
                        <h1 className="text-base font-black tracking-tight text-white leading-none">IntelliValue</h1>
                        <span className="text-[10px] text-slate-500 font-bold uppercase tracking-wider">Equity Research</span>
                    </div>
                </div>
                {isMobile && (
                    <button
                        onClick={onClose}
                        className="lg:hidden p-2 text-slate-500 hover:text-white transition-colors"
                    >
                        <X size={24} />
                    </button>
                )}
            </div>

            <nav className="flex-1 space-y-1">
                <p className="text-[10px] text-slate-600 font-black uppercase tracking-[0.2em] mb-6 px-3">Intelligence Terminal</p>
                {items.map((item) => (
                    <SidebarItem
                        key={item.label}
                        {...item}
                        active={pathname === item.href}
                    />
                ))}
            </nav>

            <div className="mt-auto pt-6 border-t border-white/5 space-y-4">
                <Link href="/" className="flex items-center gap-3 px-5 py-3 text-slate-500 hover:text-white transition-all text-xs font-bold uppercase tracking-widest">
                    <ArrowLeft size={14} /> <span>Exit Vault</span>
                </Link>

                <button
                    onClick={logout}
                    className="w-full flex items-center gap-4 px-5 py-4 text-slate-400 hover:text-rose-400 hover:bg-rose-500/5 rounded-xl transition-all text-sm font-bold group border border-transparent hover:border-rose-500/20"
                >
                    <LogOut size={20} className="group-hover:translate-x-[-2px] transition-transform" />
                    <span>Terminate Session</span>
                </button>
            </div>
        </aside>
    );
}
