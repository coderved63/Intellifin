"use client";
import React, { useState, useEffect } from 'react';
import { financeApi } from '@/services/api';
import { SlidersHorizontal, RefreshCcw, AlertCircle, TrendingUp, TrendingDown, Info } from 'lucide-react';
import ScenarioComparisonChart from '@/components/dashboard/ScenarioComparisonChart';

const ControlSlider = ({ label, value, min, max, step, onChange, unit = "%" }) => (
    <div className="space-y-4 mb-6">
        <div className="flex justify-between items-center text-[10px]">
            <span className="text-slate-500 font-bold uppercase tracking-widest">{label}</span>
            <span className="text-white font-mono font-bold text-xs">{value}{unit}</span>
        </div>
        <input
            type="range"
            min={min}
            max={max}
            step={step}
            value={value}
            onChange={(e) => onChange(parseFloat(e.target.value))}
            className="w-full h-1 bg-white/5 rounded-lg appearance-none cursor-pointer accent-indigo-500 hover:accent-indigo-400 transition-all"
        />
    </div>
);

export default function ScenariosPage() {
    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(true);

    // Scenario States
    const [growth, setGrowth] = useState(18);
    const [beta, setBeta] = useState(1.05);
    const [wacc, setWacc] = useState(11.5);
    const [terminalGrowth, setTerminalGrowth] = useState(5);

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

    const reset = () => {
        setGrowth(18);
        setBeta(1.05);
        setWacc(11.5);
        setTerminalGrowth(5);
    };

    if (loading) return <div className="p-10 text-slate-500 text-sm">Loading simulation environment...</div>;

    const baseValue = data?.intrinsic_value_per_share ? parseFloat(data.intrinsic_value_per_share) : 1153.60;

    // Dynamic Sensitivities (Deriving impact based on baseValue to avoid hardcoding)
    // Note: In a production environment, these would be recalculated by the backend engine
    const getSensitivities = () => {
        return {
            growthSens: baseValue * 0.0125, // 1% growth change ~ 1.25% value change
            betaSens: -baseValue * 0.65,    // High impact of risk on discount rate
            waccSens: -baseValue * 0.075,   // 1% WACC change ~ 7.5% inverse value change
            terminalSens: baseValue * 0.035 // 1% terminal growth ~ 3.5% value change
        };
    };

    const sens = getSensitivities();

    const scenarioValue = baseValue
        + (growth - 18) * sens.growthSens
        + (beta - 1.05) * sens.betaSens
        + (wacc - 11.5) * sens.waccSens
        + (terminalGrowth - 5) * sens.terminalSens;

    const diff = scenarioValue - baseValue;
    const diffPct = (diff / baseValue) * 100;

    return (
        <div className="space-y-6 text-white pb-20">
            <header className="mb-10 text-white">
                <h1 className="text-2xl font-bold tracking-tight">Scenario Intelligence Simulation</h1>
                <p className="text-sm text-slate-500 mt-1">Real-time intrinsic value sensitivity based on fundamental adjustments</p>
                <div className="mt-4 flex items-center gap-2 text-[10px] text-indigo-400 font-bold uppercase tracking-widest bg-indigo-500/5 w-fit px-3 py-1 rounded-full border border-indigo-500/10">
                    <Info size={12} />
                    All figures in ₹ '000 (Thousands)
                </div>
            </header>

            <div className="bg-indigo-600/5 border border-indigo-500/20 p-6 rounded-xl flex gap-4 items-start mb-8">
                <div className="p-2 bg-indigo-500/10 rounded-lg">
                    <SlidersHorizontal className="text-indigo-400" size={20} />
                </div>
                <div>
                    <h4 className="text-sm font-bold text-white">Dynamic Model Control</h4>
                    <p className="text-[11px] text-slate-500 mt-1 leading-relaxed italic">
                        The simulation now uses dynamic coefficients relative to the {data?.company_name || 'asset'} baseline.
                    </p>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                <div className="lg:col-span-5 bg-[#0a0a0a] p-8 rounded-xl border border-white/5 shadow-2xl">
                    <div className="flex justify-between items-center mb-10">
                        <h2 className="text-sm font-bold tracking-tight">Adjust Assumptions</h2>
                        <button onClick={reset} className="px-3 py-1 bg-white/5 text-[10px] text-slate-400 hover:text-white rounded-md border border-white/5 flex items-center gap-1.5 transition-all">
                            <RefreshCcw size={12} /> Reset to Base
                        </button>
                    </div>

                    <ControlSlider label="Growth" value={growth} min={5} max={35} step={1} onChange={setGrowth} />
                    <ControlSlider label="Beta (Risk)" value={beta} min={0.5} max={2.5} step={0.05} onChange={setBeta} unit="x" />
                    <ControlSlider label="WACC" value={wacc} min={8} max={16} step={0.5} onChange={setWacc} />
                    <ControlSlider label="Terminal Growth" value={terminalGrowth} min={2} max={8} step={0.5} onChange={setTerminalGrowth} />

                    <div className="bg-white/5 border border-white/5 p-4 rounded-xl flex items-center gap-3 mt-10 text-[10px] text-slate-500 italic">
                        <AlertCircle size={16} className="text-indigo-500 shrink-0" />
                        Move sliders to simulate valuation sensitivity relative to base case.
                    </div>
                </div>

                <div className="lg:col-span-7 space-y-6">
                    <ScenarioComparisonChart baseValue={baseValue} scenarioValue={scenarioValue} />

                    <div className="bg-[#0a0a0a] p-4 md:p-8 rounded-xl border border-white/5 shadow-2xl">
                        <div className={`flex flex-col sm:flex-row justify-between items-center px-4 md:px-6 py-4 md:py-5 rounded-2xl border transition-all gap-4 ${diff >= 0 ? 'bg-emerald-500/5 border-emerald-500/20' : 'bg-rose-500/5 border-rose-500/20'}`}>
                            <div className="flex items-center gap-3">
                                {diff >= 0 ? <TrendingUp size={18} className="text-emerald-500" /> : <TrendingDown size={18} className="text-rose-500" />}
                                <span className="text-[10px] md:text-xs text-slate-400 font-medium whitespace-nowrap">Value Impact per Share</span>
                            </div>
                            <span className={`text-base md:text-sm font-bold font-mono ${diff >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
                                {diff >= 0 ? '+' : ''}₹{Math.abs(diff).toFixed(2)} ({diffPct.toFixed(1)}%)
                            </span>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
