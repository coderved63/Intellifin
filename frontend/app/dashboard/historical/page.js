"use client";
import React, { useEffect, useState } from 'react';
import { financeApi } from '@/services/api';
import { AlertTriangle, Info, TrendingUp, BarChart3, PieChart } from 'lucide-react';
import FundamentalLineChart from '@/components/dashboard/FundamentalLineChart';

export default function HistoricalPage() {
    const [data, setData] = useState([]);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState('Income Statement');

    useEffect(() => {
        const fetch = async () => {
            try {
                const res = await financeApi.getHistorical();
                setData(res.data);
            } catch (err) {
                console.error(err);
            } finally {
                setLoading(false);
            }
        };
        fetch();
    }, []);

    if (loading) return <div className="p-10 text-slate-500">Loading academic dataset...</div>;

    const years = [2022, 2023, 2024, 2025, 2026];

    // Helper to label years (e.g., 2026 -> TTM)
    const formatYear = (yr) => yr === 2026 ? 'TTM (FY26)' : `FY${yr}`;

    // Prepare data for line charts
    const chartMapping = years.map(yr => {
        const inc = data.find(d => d.fiscal_year === yr && d.statement_type === 'INCOME_STATEMENT')?.metrics || {};
        const cf = data.find(d => d.fiscal_year === yr && d.statement_type === 'CASH_FLOW')?.metrics || {};
        return {
            year: formatYear(yr),
            revenue: inc['Total Revenue'] || 0,
            netIncome: inc['Net Income'] || 0,
            fcf: cf['Free Cash Flow'] || 0
        };
    }).sort((a, b) => {
        const yrA = parseInt(a.year.replace(/\D/g, '')) || 2026;
        const yrB = parseInt(b.year.replace(/\D/g, '')) || 2026;
        return yrA - yrB;
    });

    const getMetricsForType = (type) => {
        const typeMap = {
            'Income Statement': 'INCOME_STATEMENT',
            'Balance Sheet': 'BALANCE_SHEET',
            'Cash Flow': 'CASH_FLOW'
        };
        return data.filter(d => d.statement_type === typeMap[type]);
    };

    const getValue = (year, searchLabels, currentTabMetrics) => {
        const yearData = currentTabMetrics.find(d => d.fiscal_year === year);
        if (!yearData) return "—";
        const metrics = yearData.metrics;
        for (const label of searchLabels) {
            const key = Object.keys(metrics).find(k => k.toLowerCase() === label.toLowerCase());
            if (key) return `₹ ${metrics[key].toLocaleString()}`;
        }
        return "—";
    };

    const currentTabMetrics = getMetricsForType(activeTab);

    return (
        <div className="space-y-10 pb-20">
            <header className="mb-8">
                <div className="flex items-center gap-3 mb-2">
                    <BarChart3 className="text-indigo-500" size={24} />
                    <h1 className="text-2xl font-bold text-white tracking-tight">Historical Financial Performance</h1>
                </div>
                <p className="text-sm text-slate-500 max-w-2xl">
                    Audited 4-year fundamental trend analysis. This data forms the base-case for all future intrinsic projections.
                </p>
                <div className="mt-6 flex items-center gap-6">
                    <div className="flex items-center gap-2 text-[10px] text-indigo-400 font-bold uppercase tracking-widest bg-indigo-500/5 px-3 py-1.5 rounded-full border border-indigo-500/10">
                        <Info size={12} />
                        All figures in ₹ '000
                    </div>
                    <div className="flex items-center gap-2 text-[10px] text-emerald-400 font-bold uppercase tracking-widest bg-emerald-500/5 px-3 py-1.5 rounded-full border border-emerald-500/10">
                        <TrendingUp size={12} />
                        Audited Results
                    </div>
                </div>
            </header>

            {/* MANDATORY CHARTS: 1️⃣ HISTORICAL PERFORMANCE */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <FundamentalLineChart
                    data={chartMapping}
                    title="Revenue"
                    metricKey="revenue"
                    color="#6366f1"
                />
                <FundamentalLineChart
                    data={chartMapping}
                    title="Net Income"
                    metricKey="netIncome"
                    color="#10b981"
                />
                <FundamentalLineChart
                    data={chartMapping}
                    title="Free Cash Flow"
                    metricKey="fcf"
                    color="#f59e0b"
                />
            </div>

            <div className="space-y-6">
                <div className="flex items-center justify-between">
                    <h2 className="text-sm font-bold text-slate-400 uppercase tracking-widest">Audited Data Tables</h2>
                    <div className="flex gap-2 p-1 bg-white/5 rounded-lg border border-white/5">
                        {['Income Statement', 'Balance Sheet', 'Cash Flow'].map(tab => (
                            <button
                                key={tab}
                                onClick={() => setActiveTab(tab)}
                                className={`px-4 py-1.5 rounded-md text-[10px] font-bold transition-all ${activeTab === tab ? 'bg-indigo-600 text-white shadow-lg' : 'text-slate-500 hover:text-slate-300'}`}
                            >
                                {tab}
                            </button>
                        ))}
                    </div>
                </div>

                <div className="bg-[#0a0a0a] rounded-2xl border border-white/5 overflow-hidden shadow-2xl">
                    <div className="p-8">
                        <div className="overflow-x-auto">
                            <table className="w-full text-left text-xs">
                                <thead>
                                    <tr className="border-b border-white/5">
                                        <th className="pb-4 table-header min-w-[200px] text-slate-500 uppercase tracking-widest">FINANCIAL ITEM</th>
                                        {years.map(yr => (
                                            <th key={yr} className="pb-4 table-header text-right text-slate-500">{formatYear(yr)}</th>
                                        ))}
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-white/5">
                                    {activeTab === 'Income Statement' && [
                                        { label: 'Total Revenue', search: ['Total Revenue'] },
                                        { label: 'Net Interest Income', search: ['Net Interest Income'] },
                                        { label: 'Operating Income', search: ['Operating Income'] },
                                        { label: 'Pretax Income', search: ['Pretax Income'] },
                                        { label: 'Tax Provision', search: ['Tax Provision'] },
                                        { label: 'Net Income', search: ['Net Income'] },
                                        { label: 'Basic EPS', search: ['Basic EPS'] },
                                        { label: 'Diluted EPS', search: ['Diluted EPS'] }
                                    ].map((row, idx) => (
                                        <tr key={idx} className="hover:bg-white/5 transition-colors group">
                                            <td className="py-5 text-slate-300 font-medium">{row.label}</td>
                                            {years.map(yr => (
                                                <td key={yr} className="py-5 text-right text-slate-400 font-mono">
                                                    {getValue(yr, row.search, currentTabMetrics)}
                                                </td>
                                            ))}
                                        </tr>
                                    ))}

                                    {activeTab === 'Balance Sheet' && [
                                        { label: 'Total Assets', search: ['Total Assets'] },
                                        { label: 'Net Loan', search: ['Net Loan'] },
                                        { label: 'Cash And Cash Equivalents', search: ['Cash And Cash Equivalents'] },
                                        { label: 'Total Liabilities', search: ['Total Liabilities Net Minority Interest', 'Total Liabilities'] },
                                        { label: 'Total Debt', search: ['Total Debt'] },
                                        { label: 'Stockholders Equity', search: ["Stockholders' Equity", 'Total Equity Gross Minority Interest'] },
                                        { label: 'Ordinary Shares Number', search: ['Ordinary Shares Number'] }
                                    ].map((row, idx) => (
                                        <tr key={idx} className="hover:bg-white/5 transition-colors group">
                                            <td className="py-5 text-slate-300 font-medium">{row.label}</td>
                                            {years.map(yr => (
                                                <td key={yr} className="py-5 text-right text-slate-400 font-mono">
                                                    {getValue(yr, row.search, currentTabMetrics)}
                                                </td>
                                            ))}
                                        </tr>
                                    ))}

                                    {activeTab === 'Cash Flow' && [
                                        { label: 'Operating Cash Flow', search: ['Operating Cash Flow'] },
                                        { label: 'Investing Cash Flow', search: ['Investing Cash Flow'] },
                                        { label: 'Financing Cash Flow', search: ['Financing Cash Flow'] },
                                        { label: 'Net Change In Cash', search: ['Net Change In Cash'] },
                                        { label: 'Free Cash Flow', search: ['Free Cash Flow'] }
                                    ].map((row, idx) => (
                                        <tr key={idx} className="hover:bg-white/5 transition-colors group">
                                            <td className="py-5 text-slate-300 font-medium">{row.label}</td>
                                            {years.map(yr => (
                                                <td key={yr} className="py-5 text-right text-slate-400 font-mono">
                                                    {getValue(yr, row.search, currentTabMetrics)}
                                                </td>
                                            ))}
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
