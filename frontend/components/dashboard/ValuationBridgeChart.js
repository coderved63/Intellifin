"use client";
import React from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell, LabelList } from 'recharts';

/**
 * ValuationBridgeChart
 * Visualizes the bridge from Enterprise Value to Equity Value.
 * @param {Number} ev - Enterprise Value
 * @param {Number} netDebt - Net Debt
 * @param {Number} eqVal - Equity Value
 */
export default function ValuationBridgeChart({ ev, netDebt, eqVal }) {
    if (!ev && !eqVal) return <div className="h-[300px] bg-black/20 rounded-xl animate-pulse" />;

    const data = [
        { name: 'Enterprise Value', value: ev, color: '#6366f1' },
        { name: 'Net Debt', value: netDebt, color: '#ef4444' },
        { name: 'Equity Value', value: eqVal, color: '#10b981' }
    ];

    const formatCurrency = (val) => `₹${(val / 1000000).toFixed(1)}M`;

    return (
        <div className="bg-[#0a0a0a] p-8 rounded-2xl border border-white/5 shadow-2xl space-y-6">
            <div className="flex justify-between items-center">
                <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest">Valuation Bridge (EV to Equity)</h3>
                <span className="text-[9px] text-slate-600 font-bold uppercase tracking-tighter bg-white/5 px-2 py-0.5 rounded border border-white/5">
                    Units: ₹ '000
                </span>
            </div>

            <div className="h-[300px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={data} margin={{ top: 20, right: 30, left: 40, bottom: 20 }}>
                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(255,255,255,0.03)" />
                        <XAxis
                            dataKey="name"
                            axisLine={false}
                            tickLine={false}
                            tick={{ fill: '#475569', fontSize: 10, fontWeight: 600 }}
                        />
                        <YAxis
                            axisLine={false}
                            tickLine={false}
                            tick={{ fill: '#475569', fontSize: 10, fontWeight: 600 }}
                            tickFormatter={formatCurrency}
                        />
                        <Tooltip
                            contentStyle={{
                                backgroundColor: '#050505',
                                border: '1px solid rgba(255,255,255,0.1)',
                                borderRadius: '12px'
                            }}
                            itemStyle={{ fontSize: '11px', fontWeight: 600 }}
                            cursor={{ fill: 'rgba(255,255,255,0.02)' }}
                            formatter={(val) => [`₹${val.toLocaleString()}`, 'Value']}
                        />
                        <Bar dataKey="value" radius={[6, 6, 0, 0]} barSize={60}>
                            {data.map((entry, index) => (
                                <Cell key={`cell-${index}`} fill={entry.color} fillOpacity={0.8} />
                            ))}
                            <LabelList
                                dataKey="value"
                                position="top"
                                formatter={(val) => `₹${(val / 1000000).toFixed(1)}M`}
                                fill="#94a3b8"
                                fontSize={10}
                                fontWeight={600}
                                offset={10}
                            />
                        </Bar>
                    </BarChart>
                </ResponsiveContainer>
            </div>

            <div className="pt-4 border-t border-white/5">
                <p className="text-[10px] text-slate-500 leading-relaxed italic">
                    Enterprise Value is the total business value (Assets). Equity Value is the value remaining for shareholders after settling Net Debt.
                </p>
            </div>
        </div>
    );
}
