"use client";
import React, { useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import Link from 'next/link';
import { Lock, Mail, UserPlus, ChevronRight, AlertCircle, ShieldCheck } from 'lucide-react';

export default function SignupPage() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const { signup } = useAuth();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');
        try {
            await signup(email, password);
        } catch (err) {
            setError(err.response?.data?.error || 'Signup failed. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-[#050505] relative overflow-hidden">
            {/* Background Decorative Element */}
            <div className="absolute top-[-10%] right-[-10%] w-[40%] h-[40%] bg-indigo-600/5 blur-[120px] rounded-full pointer-events-none" />
            <div className="absolute bottom-[-10%] left-[-10%] w-[40%] h-[40%] bg-indigo-600/5 blur-[120px] rounded-full pointer-events-none" />

            <div className="max-w-md w-full relative z-10 px-6">
                <div className="bg-[#0a0a0a] p-10 rounded-[32px] shadow-2xl border border-white/5 space-y-8">
                    <div className="text-center space-y-3">
                        <div className="w-16 h-16 bg-indigo-600/10 rounded-2xl flex items-center justify-center mx-auto mb-6 border border-indigo-500/20">
                            <UserPlus className="text-indigo-400" size={32} />
                        </div>
                        <h2 className="text-3xl font-bold text-white tracking-tight">Create Identity</h2>
                        <p className="text-slate-500 text-xs font-bold uppercase tracking-[0.2em]">Join the Fundamental Network</p>
                    </div>

                    {error && (
                        <div className="bg-rose-500/5 border border-rose-500/20 text-rose-400 p-4 rounded-2xl text-[11px] font-bold flex gap-3 items-center animate-shake">
                            <AlertCircle size={16} className="shrink-0" />
                            {error}
                        </div>
                    )}

                    <form onSubmit={handleSubmit} className="space-y-6">
                        <div className="space-y-2">
                            <label className="text-[10px] text-slate-500 font-bold uppercase tracking-widest ml-1">Terminal ID (Email)</label>
                            <div className="relative group">
                                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-600 group-focus-within:text-indigo-400 transition-colors" size={18} />
                                <input
                                    type="email"
                                    required
                                    className="w-full bg-white/[0.02] text-white px-12 py-4 rounded-2xl border border-white/5 focus:border-indigo-500/50 focus:bg-indigo-500/[0.02] outline-none transition-all font-medium text-sm"
                                    placeholder="name@intellifin.com"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                />
                            </div>
                        </div>

                        <div className="space-y-2">
                            <label className="text-[10px] text-slate-500 font-bold uppercase tracking-widest ml-1">Create Access Key</label>
                            <div className="relative group">
                                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-600 group-focus-within:text-indigo-400 transition-colors" size={18} />
                                <input
                                    type="password"
                                    required
                                    className="w-full bg-white/[0.02] text-white px-12 py-4 rounded-2xl border border-white/5 focus:border-indigo-500/50 focus:bg-indigo-500/[0.02] outline-none transition-all font-medium text-sm"
                                    placeholder="••••••••"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                />
                            </div>
                        </div>

                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full py-4 px-6 bg-indigo-600 hover:bg-indigo-500 text-white font-black rounded-2xl shadow-xl shadow-indigo-500/10 transition-all flex items-center justify-center gap-2 group disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            {loading ? "Initializing..." : "Register Identity"}
                            {!loading && <ChevronRight className="group-hover:translate-x-1 transition-transform" size={18} />}
                        </button>
                    </form>

                    <div className="pt-6 border-t border-white/5 text-center">
                        <p className="text-slate-500 text-xs font-medium">
                            Already registered? <Link href="/login" className="text-indigo-400 font-bold hover:text-indigo-300 transition-colors ml-1">Access Vault</Link>
                        </p>
                    </div>
                </div>

                <div className="mt-8 text-center">
                    <p className="text-[10px] text-slate-600 font-bold uppercase tracking-[0.3em]">
                        Advanced Fundamental Intelligence Platform
                    </p>
                </div>
            </div>
        </div>
    );
}
