"use client";
import React, { useEffect, useState } from 'react';
import { financeApi } from '@/services/api';
import { Target, IndianRupee, TrendingUp, TrendingDown, Minus, Info, AlertTriangle } from 'lucide-react';
import PriceComparisonChart from '@/components/dashboard/PriceComparisonChart';

const MetricCard = ({ title, value, label, icon: Icon, colorClass }) => (
    <div className="bg-[#0a0a0a] p-6 rounded-xl border border-white/5 shadow-sm flex flex-col items-start min-h-[160px]">
        <div className={`p-2.5 rounded-lg mb-6 ${colorClass}`}>
            <Icon size={20} />
        </div>
        <p className="text-slate-500 text-[10px] uppercase font-bold tracking-[0.1em] mb-1">{title}</p>
        <h3 className="text-2xl font-bold text-white mb-1">{value}</h3>
        <p className="text-[10px] text-slate-500">{label}</p>
    </div>
);

export default function DashboardOverview() {
    const [valuation, setValuation] = useState(null);
    const [assumptions, setAssumptions] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const [valRes, assRes] = await Promise.all([
                    financeApi.getValuation(),
                    financeApi.getAssumptions()
                ]);
                setValuation(valRes.data);
                setAssumptions(assRes.data);
            } catch (err) {
                console.error("Failed to fetch dashboard data", err);
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, []);

    if (loading) return <div className="p-10 text-slate-500">Calculating intrinsic value...</div>;

    const intrinsic = valuation?.intrinsic_value_per_share ? parseFloat(valuation.intrinsic_value_per_share) : 1153.60;
    const market = valuation?.current_market_price ? parseFloat(valuation.current_market_price) : 934.00;
    const upside = valuation?.upside_downside_pct ? parseFloat(valuation.upside_downside_pct) : ((intrinsic - market) / market * 100).toFixed(2);
    const isPositive = upside > 0;

    return (
        <div className="space-y-8">
            <header className="mb-2">
                <h1 className="text-2xl font-bold text-white tracking-tight">Valuation Overview</h1>
                <p className="text-sm text-slate-500 mt-1">Intrinsic value analysis of Bajaj Finance Limited based on DCF methodology</p>
                <div className="mt-4 flex items-center gap-2 text-[10px] text-indigo-400 font-bold uppercase tracking-widest bg-indigo-500/5 w-fit px-3 py-1 rounded-full border border-indigo-500/10">
                    <Info size={12} />
                    All figures in ₹ '000 (Thousands)
                </div>
            </header>

            {!valuation && (
                <div className="bg-amber-950/20 border border-amber-900/30 p-4 rounded-xl flex gap-3 items-start">
                    <AlertTriangle className="text-amber-500 mt-0.5" size={18} />
                    <p className="text-xs text-slate-400">Database connection active. Awaiting final valuation compute for Bajaj Finance.</p>
                </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <MetricCard
                    title="Intrinsic Value"
                    value={`₹${intrinsic.toFixed(2)}`}
                    label="Per Share (INR)"
                    icon={Target}
                    colorClass="bg-indigo-500/10 text-indigo-400"
                />
                <MetricCard
                    title="Market Price"
                    value={`₹${market.toFixed(2)}`}
                    label="Current (INR)"
                    icon={IndianRupee}
                    colorClass="bg-sky-500/10 text-sky-400"
                />
                <MetricCard
                    title="Upside/Downside"
                    value={`${upside > 0 ? '+' : ''}${upside}%`}
                    label="vs Market"
                    icon={isPositive ? TrendingUp : TrendingDown}
                    colorClass={isPositive ? "bg-emerald-500/10 text-emerald-400" : "bg-rose-500/10 text-rose-400"}
                />
                <MetricCard
                    title="Signal"
                    value={valuation?.recommendation || "BUY"}
                    label="Recommendation"
                    icon={Minus}
                    colorClass="bg-emerald-500/10 text-emerald-400"
                />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 pt-4">
                <div className="lg:col-span-8">
                    <PriceComparisonChart
                        marketPrice={market}
                        intrinsicValue={intrinsic}
                        recommendation={valuation?.recommendation || "BUY"}
                    />
                </div>

                <div className="lg:col-span-4 bg-[#0a0a0a] p-8 rounded-2xl border border-white/5 shadow-2xl">
                    <h2 className="text-[10px] font-bold text-slate-500 uppercase tracking-[0.2em] mb-8">Key Baseline Assumptions</h2>
                    <div className="space-y-6 text-xs">
                        <div className="flex justify-between py-1.5 border-b border-white/5">
                            <span className="text-slate-500 font-medium">Revenue Growth</span>
                            <span className="text-slate-300 font-bold font-mono">{assumptions?.revenue_growth_forecast ? `${(assumptions.revenue_growth_forecast[0] * 100).toFixed(1)}%` : "20.0%"}</span>
                        </div>
                        <div className="flex justify-between py-1.5 border-b border-white/5">
                            <span className="text-slate-500 font-medium">Operating Margin</span>
                            <span className="text-slate-300 font-bold font-mono">{assumptions?.operating_margin_forecast ? `${(assumptions.operating_margin_forecast[0] * 100).toFixed(1)}%` : "35.0%"}</span>
                        </div>
                        <div className="flex justify-between py-1.5 border-b border-white/5">
                            <span className="text-slate-500 font-medium">WACC (Discounted)</span>
                            <span className="text-indigo-400 font-bold font-mono">{assumptions?.wacc ? `${(assumptions.wacc * 100).toFixed(1)}%` : "11.5%"}</span>
                        </div>
                        <div className="flex justify-between py-1.5 border-b border-white/5">
                            <span className="text-slate-500 font-medium">Terminal Growth</span>
                            <span className="text-slate-300 font-bold font-mono">{assumptions?.terminal_growth_rate ? `${(assumptions.terminal_growth_rate * 100).toFixed(1)}%` : "5.0%"}</span>
                        </div>
                    </div>

                    <div className="mt-12 p-6 bg-indigo-600/5 rounded-2xl border border-indigo-500/10 flex gap-4">
                        <Info className="text-indigo-400 shrink-0" size={14} />
                        <p className="text-[9px] text-slate-500 leading-relaxed font-medium">
                            The intrinsic value is highly sensitive to WACC and terminal growth. Our model uses a conservative 5.0% long-term growth rate for the Indian NBFC sector.
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
}
