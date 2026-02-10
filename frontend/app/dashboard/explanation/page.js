"use client";
import React, { useState, useEffect } from 'react';
import { financeApi } from '@/services/api';
import { AlertCircle, FileText, CheckCircle2, XCircle, MinusCircle } from 'lucide-react';

const ExplanationSection = ({ title, description }) => (
    <div className="bg-[#0a0a0a] p-8 rounded-xl border border-white/5 mb-6">
        <div className="flex gap-4 items-center mb-4">
            <FileText className="text-indigo-400" size={18} />
            <h3 className="text-sm font-bold text-white">{title}</h3>
        </div>
        <p className="text-xs text-slate-500 leading-relaxed">
            {description}
        </p>
    </div>
);

const SignalCard = ({ type, active, title, description, icon: Icon, colorClass }) => (
    <div className={`flex-1 p-6 rounded-xl border transition-all ${active ? colorClass : 'bg-[#0a0a0a] border-white/5 opacity-40'}`}>
        <div className="flex gap-3 items-center mb-3">
            <Icon size={20} />
            <span className="text-sm font-bold uppercase tracking-wider">{type}</span>
        </div>
        <p className="text-[10px] font-bold text-slate-300 mb-1">{title}</p>
        <p className="text-[9px] text-slate-500 leading-tight">{description}</p>
    </div>
);

export default function ExplanationPage() {
    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetch = async () => {
            try {
                const res = await financeApi.getValuation();
                setData(res.data);
            } catch (err) {
                console.error(err);
            } finally {
                setLoading(false);
            }
        };
        fetch();
    }, []);

    if (loading) return <div className="p-10 text-slate-500 text-sm">Generating explanation...</div>;

    const recommendation = data?.recommendation || 'HOLD';

    return (
        <div className="space-y-6 text-white pb-20">
            <header className="mb-10 text-white">
                <h1 className="text-2xl font-bold tracking-tight">Valuation Explanation</h1>
                <p className="text-sm text-slate-500 mt-1">Complete reasoning behind the investment recommendation</p>
            </header>

            {!data && (
                <div className="bg-[#0a0a0a] rounded-xl border border-white/5 p-20 flex flex-col items-center justify-center mb-8 h-96">
                    <div className="w-16 h-16 bg-slate-800/50 rounded-full flex items-center justify-center text-slate-600 mb-6">
                        <MinusCircle size={32} />
                    </div>
                    <h2 className="text-2xl font-bold text-slate-500 uppercase tracking-[0.2em] mb-2">Awaiting Data</h2>
                    <p className="text-sm text-slate-600">Investment signal will be displayed here</p>
                </div>
            )}

            {data && (
                <>
                    {/* Signal Display Row */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
                        <SignalCard
                            type="BUY"
                            active={recommendation === 'BUY'}
                            icon={CheckCircle2}
                            title="Intrinsic Value > Market Price"
                            description={`${data.intrinsic_value_per_share} > ${data.current_market_price}. Significant margin of safety detected.`}
                            colorClass="bg-emerald-950/20 border-emerald-900/50 text-emerald-500 opacity-100"
                        />
                        <SignalCard
                            type="HOLD"
                            active={recommendation === 'HOLD'}
                            icon={MinusCircle}
                            title="Intrinsic Value ≈ Market Price"
                            description="The stock is trading close to its fair value. No significant margin of safety."
                            colorClass="bg-amber-950/20 border-amber-900/50 text-amber-500 opacity-100"
                        />
                        <SignalCard
                            type="SELL"
                            active={recommendation === 'SELL'}
                            icon={XCircle}
                            title="Intrinsic Value < Market Price"
                            description="The stock is fundamentally overvalued compared to its projected cash flows."
                            colorClass="bg-red-950/20 border-red-900/50 text-red-500 opacity-100"
                        />
                    </div>

                    <div className="grid grid-cols-1 gap-1">
                        <ExplanationSection
                            title="Investment Logic Summary"
                            description={data.analysis_summary}
                        />
                        <ExplanationSection
                            title="Historical Context"
                            description="Bajaj Finance has historically maintained high return on equity and consistent loan book growth. Our model normalizes these historical performance metrics (FY2021-FY2024) to derive the starting point for projections."
                        />
                        <ExplanationSection
                            title="WACC Derivation"
                            description="The discount rate (WACC) of 11.5% is calibrated for an NBFC, factoring in the current risk-free rate, equity risk premium, and specific beta for financial services in the Indian market."
                        />
                    </div>
                </>
            )}
        </div>
    );
}
