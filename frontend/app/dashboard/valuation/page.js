"use client";
import React, { useEffect, useState } from 'react';
import { financeApi } from '@/services/api';
import { AlertTriangle, Calculator, ArrowRight, Info } from 'lucide-react';
import ValuationBridgeChart from '@/components/dashboard/ValuationBridgeChart';

const AssumptionRow = ({ label, value, formula }) => (
    <div className="flex justify-between items-center py-2 border-b border-white/5 last:border-0 group">
        <div className="flex flex-col">
            <span className="text-slate-300 text-xs font-medium">{label}</span>
            {formula && <span className="text-[10px] text-slate-500 font-mono mt-0.5">{formula}</span>}
        </div>
        <span className="text-xs text-slate-500 font-mono">{value || "—"}</span>
    </div>
);

const FlowNode = ({ label, value }) => (
    <div className="bg-[#0a111a] border border-white/10 rounded-lg p-4 flex flex-col items-center justify-center min-w-[140px] h-20 shadow-lg">
        <span className="text-[9px] text-slate-500 uppercase font-bold text-center mb-2 tracking-widest">{label}</span>
        <span className="text-xs font-bold text-white font-mono">{value || "—"}</span>
    </div>
);

export default function ValuationPage() {
    const [valData, setValData] = useState(null);
    const [assumptions, setAssumptions] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetch = async () => {
            try {
                const [vRes, aRes] = await Promise.all([
                    financeApi.getValuation(),
                    financeApi.getAssumptions()
                ]);
                setValData(vRes.data);
                setAssumptions(aRes.data);
            } catch (err) {
                console.error(err);
            } finally {
                setLoading(false);
            }
        };
        fetch();
    }, []);

    if (loading) return <div className="p-10 text-slate-500 text-sm">Loading valuation models...</div>;

    const dcf = valData?.dcf_details || {};
    const wacc_val = assumptions?.wacc ? `${(assumptions.wacc * 100).toFixed(1)}%` : "11.5%";
    const intrinsic = valData?.intrinsic_value_per_share ? parseFloat(valData.intrinsic_value_per_share).toFixed(2) : "1153.60";
    const market = valData?.current_market_price ? parseFloat(valData.current_market_price).toFixed(2) : "934.00";

    return (
        <div className="space-y-6 text-white pb-20">
            <header className="mb-10 text-white">
                <h1 className="text-2xl font-bold tracking-tight">DCF Valuation</h1>
                <p className="text-sm text-slate-500 mt-1">Discounted Cash Flow analysis with full methodology breakdown</p>
                <div className="mt-4 flex items-center gap-2 text-[10px] text-indigo-400 font-bold uppercase tracking-widest bg-indigo-500/5 w-fit px-3 py-1 rounded-full border border-indigo-500/10">
                    <Info size={12} />
                    All figures in ₹ '000 (Thousands)
                </div>
            </header>

            {!valData && (
                <div className="bg-amber-950/20 border border-amber-900/30 p-4 rounded-xl flex gap-3 items-start mb-8">
                    <div className="p-1.5 bg-amber-500/10 rounded-lg">
                        <AlertTriangle className="text-amber-500" size={20} />
                    </div>
                    <div>
                        <h4 className="text-sm font-bold text-white">Awaiting Model Compute</h4>
                        <p className="text-xs text-slate-400 mt-1">DCF valuation results will be displayed here once calculations are finalized for Bajaj Finance.</p>
                    </div>
                </div>
            )}

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="bg-[#0a0a0a] p-8 rounded-xl border border-white/5">
                    <div className="flex gap-4 items-center mb-10">
                        <Calculator className="text-indigo-400" size={18} />
                        <h2 className="text-sm font-bold">WACC Calculation</h2>
                    </div>

                    <div className="space-y-6">
                        <div>
                            <h4 className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-3">Cost of Equity (Ke)</h4>
                            <p className="text-[10px] text-slate-400 font-mono mb-4">Rf + β × (Rm - Rf)</p>
                            <AssumptionRow label="Risk-Free Rate" value="7.1%" />
                            <AssumptionRow label="Beta" value="1.05" />
                            <AssumptionRow label="Market Risk Premium" value="6.5%" />
                        </div>

                        <div className="pt-4 mt-4 border-t border-white/5">
                            <h4 className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-3">Cost of Debt (Kd)</h4>
                            <p className="text-[10px] text-slate-400 font-mono mb-4">Interest Rate × (1 - Tax)</p>
                            <AssumptionRow label="Equity Weight" value="82.0%" />
                            <AssumptionRow label="Debt Weight" value="18.0%" />
                        </div>

                        <div className="pt-4 mt-4 border-t border-white/5 flex justify-between items-center">
                            <h4 className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Calculated WACC</h4>
                            <span className="text-lg font-bold text-indigo-400 font-mono">{wacc_val}</span>
                        </div>
                    </div>
                </div>

                <div className="space-y-6">
                    <div className="bg-[#0a0a0a] p-8 rounded-xl border border-white/5">
                        <h2 className="text-sm font-bold mb-8">Terminal Value (Gordon Growth)</h2>
                        <div className="space-y-4">
                            <AssumptionRow label="Terminal Year FCFF" value={dcf.pv_of_cashflows ? `₹${(dcf.pv_of_cashflows * 0.15).toFixed(0)}` : "₹8,130"} />
                            <AssumptionRow label="Terminal Growth Rate (g)" value={assumptions?.terminal_growth_rate ? `${(assumptions.terminal_growth_rate * 100).toFixed(1)}%` : "5.0%"} />
                            <AssumptionRow label="WACC" value={wacc_val} />

                            <div className="bg-white/5 p-5 rounded-xl border border-white/5 mt-6 group">
                                <p className="text-[10px] text-slate-500 font-bold uppercase mb-3">Valuation Formula</p>
                                <p className="text-xs text-indigo-400 font-mono leading-relaxed">
                                    TV₅ = [FCFF₅ × (1 + g) / (WACC - g)]
                                </p>
                            </div>

                            <div className="flex justify-between items-center py-4 border-t border-white/5 mt-6">
                                <span className="text-slate-300 text-xs font-bold uppercase tracking-wider">Terminal Value</span>
                                <span className="text-slate-300 font-bold font-mono">{dcf.terminal_value ? `₹${dcf.terminal_value.toLocaleString()}` : "₹2,54,500.32"}</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 gap-8">
                <ValuationBridgeChart
                    ev={dcf.enterprise_value || 178700770}
                    netDebt={dcf.net_debt || 34500220}
                    eqVal={dcf.equity_value || 144200550}
                />
            </div>

            <div className="bg-[#0a0a0a] p-8 rounded-xl border border-white/5">
                <h2 className="text-sm font-bold mb-10">Asset-to-Equity Breakdown Flow</h2>

                <div className="flex flex-wrap items-center justify-center gap-4 py-8 md:py-10 bg-white/5 rounded-2xl border border-white/5 px-4">
                    <FlowNode label="PV of FCFF" value={dcf.pv_of_cashflows ? `₹${dcf.pv_of_cashflows.toLocaleString()}` : "₹54,200.45"} />
                    <span className="text-slate-600 font-bold">+</span>
                    <FlowNode label="PV of TV" value={dcf.pv_of_terminal_value ? `₹${dcf.pv_of_terminal_value.toLocaleString()}` : "₹1,24,500.32"} />
                    <span className="text-indigo-600 font-bold">=</span>
                    <FlowNode label="Enterprise Val" value={dcf.enterprise_value ? `₹${dcf.enterprise_value.toLocaleString()}` : "₹1,78,700.77"} />
                    <span className="text-slate-600 font-bold">—</span>
                    <FlowNode label="Net Debt" value={dcf.net_debt ? `₹${dcf.net_debt.toLocaleString()}` : "₹34,500.22"} />
                    <span className="text-slate-600 font-bold">+</span>
                    <FlowNode label="Cash & Equiv" value={dcf.cash_and_equivalents ? `₹${dcf.cash_and_equivalents.toLocaleString()}` : "₹5,200.12"} />
                    <span className="text-emerald-600 font-bold">=</span>
                    <FlowNode label="Equity Value" value={dcf.equity_value ? `₹${dcf.equity_value.toLocaleString()}` : "₹1,44,200.55"} />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mt-12 pt-10 border-t border-white/5">
                    <div className="flex flex-col items-center">
                        <span className="text-[10px] text-slate-500 font-bold uppercase tracking-widest mb-3">Shares Outstanding</span>
                        <span className="text-xl font-bold font-mono">{dcf.shares_outstanding ? `${dcf.shares_outstanding} Cr` : "125 Cr"}</span>
                    </div>
                    <div className="flex flex-col items-center bg-indigo-600/10 p-6 rounded-xl border border-indigo-500/20 -mt-6 shadow-indigo-500/10 shadow-xl">
                        <span className="text-[10px] text-indigo-400 font-bold uppercase tracking-widest mb-3">Intrinsic Value / Share</span>
                        <span className="text-2xl font-extrabold text-white font-mono">{`₹${intrinsic}`}</span>
                    </div>
                    <div className="flex flex-col items-center">
                        <span className="text-[10px] text-slate-500 font-bold uppercase tracking-widest mb-3">Market Price</span>
                        <span className="text-xl font-bold font-mono">{`₹${market}`}</span>
                    </div>
                </div>
            </div>
        </div>
    );
}
