"use client";
import React, { useEffect, useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import { useRouter, usePathname } from 'next/navigation';
import Sidebar from '@/components/dashboard/Sidebar';
import { Menu, X } from 'lucide-react';

export default function DashboardLayout({ children }) {
    const { user, loading } = useAuth();
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);
    const router = useRouter();
    const pathname = usePathname();

    useEffect(() => {
        if (!loading && !user) {
            router.push('/login');
        }
    }, [user, loading, router]);

    // Close sidebar on navigation (mobile)
    useEffect(() => {
        setIsSidebarOpen(false);
    }, [pathname]);

    if (loading || !user) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-[#050505]">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-600"></div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-[#050505] flex flex-col lg:flex-row relative">
            {/* Mobile Header - Sticky and consistently colored */}
            <div className="lg:hidden flex items-center justify-between px-6 py-5 border-b border-white/5 bg-[#0a0a0a] sticky top-0 z-50">
                <div className="flex items-center gap-3">
                    <div className="w-8 h-8 bg-indigo-600 rounded-lg flex items-center justify-center text-white text-xs font-bold ring-1 ring-white/10">
                        IV
                    </div>
                    <span className="text-white font-black tracking-tight text-sm uppercase">IntelliValue</span>
                </div>
                <button
                    onClick={() => setIsSidebarOpen(true)}
                    className="p-2 text-slate-400 hover:text-white transition-colors"
                    aria-label="Open Menu"
                >
                    <Menu size={24} />
                </button>
            </div>

            {/* Sidebar Shell - Elevated Z-index to cover header on mobile */}
            <div className={`
                fixed inset-0 z-[60] lg:relative lg:z-auto transition-transform duration-300 ease-in-out transform
                ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
            `}>
                {/* Backdrop (Mobile only) - Solid black with slight transparency for focus */}
                {isSidebarOpen && (
                    <div
                        className="fixed inset-0 bg-black/80 backdrop-blur-md lg:hidden"
                        onClick={() => setIsSidebarOpen(false)}
                    />
                )}

                {/* Sidebar Component with its own close button for mobile */}
                <div className="h-full w-72 max-w-[80vw] relative z-10">
                    <Sidebar onClose={() => setIsSidebarOpen(false)} isMobile={true} />
                </div>
            </div>

            {/* Main Content */}
            <main className="flex-1 p-5 md:p-8 lg:p-10 min-h-screen w-full lg:ml-0 overflow-x-hidden">
                <div className="max-w-7xl mx-auto">
                    {children}
                </div>
            </main>
        </div>
    );
}
