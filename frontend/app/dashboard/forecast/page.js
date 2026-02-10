"use client";
import React, { useEffect, useState } from 'react';
import { financeApi } from '@/services/api';
import { AlertTriangle, TrendingUp, Info, LineChart as ChartIcon, Calendar } from 'lucide-react';
import UnifiedTransitionChart from '@/components/dashboard/UnifiedTransitionChart';
import FundamentalLineChart from '@/components/dashboard/FundamentalLineChart';

const AssumptionCard = ({ title, value, subLabel, icon: Icon }) => (
    <div className="bg-[#0a0a0a] p-5 rounded-xl border border-white/5 flex flex-col items-start min-h-[140px] shadow-lg">
        <p className="text-slate-500 text-[9px] uppercase font-bold tracking-[0.1em] mb-4">{title}</p>
        <h3 className="text-xl font-bold text-white mb-1">{value}</h3>
        <p className="text-[10px] text-slate-500">{subLabel}</p>
    </div>
);

export default function ForecastPage() {
    const [valData, setValData] = useState(null);
    const [historical, setHistorical] = useState([]);
    const [assumptions, setAssumptions] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetch = async () => {
            try {
                const [vRes, aRes, hRes] = await Promise.all([
                    financeApi.getValuation(),
                    financeApi.getAssumptions(),
                    financeApi.getHistorical()
                ]);
                setValData(vRes.data);
                setAssumptions(aRes.data);
                setHistorical(hRes.data);
            } catch (err) {
                console.error(err);
            } finally {
                setLoading(false);
            }
        };
        fetch();
    }, []);

    if (loading) return <div className="p-10 text-slate-500 italic">Processing academic projection models...</div>;

    const getProjections = () => {
        if (!valData?.dcf_details) return [];
        const details = typeof valData.dcf_details === 'string' ? JSON.parse(valData.dcf_details) : valData.dcf_details;
        return details.projections || [];
    };
    const projections = getProjections();
    const avgRevGrowth = assumptions?.revenue_growth_forecast ? `${(assumptions.revenue_growth_forecast[0] * 100).toFixed(1)}%` : "20.0%";
    const avgOpMargin = assumptions?.operating_margin_forecast ? `${(assumptions.operating_margin_forecast[0] * 100).toFixed(1)}%` : "35.0%";

    // Prepare Section 2: Transition Data
    const histRevenue = historical
        .filter(d => d.statement_type === 'INCOME_STATEMENT')
        .map(d => ({ year: `FY${d.fiscal_year}`, value: d.metrics['Total Revenue'] || d.metrics['Total income'] || 0 }))
        .sort((a, b) => a.year.localeCompare(b.year));

    const foreRevenue = projections.map(p => ({ year: `FY${p.year}E`, value: p.revenue || 0 }));

    // Robust FCF Fallback: Use metrics['Free Cash Flow'] or calculate from (PAT + Depreciation - Capex proxy)
    const histFCF = historical
        .filter(d => d.statement_type === 'CASH_FLOW')
        .map(d => {
            const explicitFCF = d.metrics['Free Cash Flow'];
            const calculatedFCF = (d.metrics['Operating Cash Flow'] || 0) + (d.metrics['Investing Cash Flow'] || 0); // Standard FCF approximation
            return {
                year: `FY${d.fiscal_year}`,
                value: explicitFCF !== undefined ? explicitFCF : calculatedFCF
            };
        })
        .sort((a, b) => a.year.localeCompare(b.year));

    const foreFCF = projections.map(p => ({
        year: `FY${p.year}E`,
        value: p.pat || (p.ebit * 0.75) || 0 // Proxy forecast FCF as PAT for NBFCs
    }));

    const histPAT = historical
        .filter(d => d.statement_type === 'INCOME_STATEMENT')
        .map(d => ({
            year: `FY${d.fiscal_year}`,
            value: d.metrics['Net Income'] || d.metrics['Net profit'] || d.metrics['Profit after tax'] || 0
        }))
        .sort((a, b) => a.year.localeCompare(b.year));

    const forePAT = projections.map(p => ({ year: `FY${p.year}E`, value: p.pat || 0 }));

    return (
        <div className="space-y-12 text-white pb-20">
            <header className="mb-8">
                <div className="flex items-center gap-3 mb-2">
                    <ChartIcon className="text-indigo-500" size={24} />
                    <h1 className="text-2xl font-bold tracking-tight">Financial Projections & Transition</h1>
                </div>
                <p className="text-sm text-slate-500 max-w-2xl">
                    Visualizing the link between historical performance and future expectations.
                    Solid lines represent audited results; dashed lines represent fundamental forecasts.
                </p>
                <div className="mt-6 flex items-center gap-4 text-[10px] text-indigo-400 font-bold uppercase tracking-widest bg-indigo-500/5 w-fit px-3 py-1.5 rounded-full border border-indigo-500/10">
                    <Info size={12} />
                    All figures in ₹ '000 (Thousands)
                </div>
            </header>

            {/* MANDATORY SECTION 2: FORECAST VS HISTORY */}
            <section className="space-y-6">
                <div className="flex items-center gap-2">
                    <div className="h-4 w-1 bg-indigo-500 rounded-full" />
                    <h2 className="text-xs font-bold text-slate-400 uppercase tracking-[0.2em]">Mandatory Transition Analysis</h2>
                </div>
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 lg:gap-8">
                    <UnifiedTransitionChart
                        historical={histRevenue}
                        forecast={foreRevenue}
                        title="Revenue Continuum"
                        color="#6366f1"
                    />
                    <UnifiedTransitionChart
                        historical={histFCF}
                        forecast={foreFCF}
                        title="Cash Flow Continuum"
                        color="#f59e0b"
                    />
                </div>
            </section>

            {/* MANDATORY SECTION 3: FORECAST-ONLY DETAIL -> CONVERTED TO PAT CONTINUUM */}
            <section className="space-y-6">
                <div className="flex items-center gap-2">
                    <div className="h-4 w-1 bg-emerald-500 rounded-full" />
                    <h2 className="text-xs font-bold text-slate-400 uppercase tracking-[0.2em]">5-Year Future Expectations</h2>
                </div>
                <div className="w-full">
                    <UnifiedTransitionChart
                        historical={histPAT}
                        forecast={forePAT}
                        title="PAT Momentum (Historical + Forecast)"
                        color="#10b981"
                    />
                </div>
            </section>

            <section className="bg-[#0a0a0a] p-8 rounded-2xl border border-white/5 shadow-2xl">
                <div className="flex gap-4 items-center mb-10">
                    <Calendar className="text-indigo-400" size={18} />
                    <h2 className="text-sm font-bold uppercase tracking-widest">Audited Model Assumptions</h2>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                    <AssumptionCard title="REVENUE GROWTH" value={avgRevGrowth} subLabel="Projected CAGR" />
                    <AssumptionCard title="OPERATING MARGIN" value={avgOpMargin} subLabel="Long-term Target" />
                    <AssumptionCard title="TAX RATE" value="25.0%" subLabel="Corporate Tax Rate" />
                    <AssumptionCard title="WACC" value={assumptions?.wacc ? `${(assumptions.wacc * 100).toFixed(1)}%` : "11.5%"} subLabel="Discount Rate" />
                </div>
            </section>
        </div>
    );
}
