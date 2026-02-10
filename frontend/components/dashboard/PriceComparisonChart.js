"use client";
import React from 'react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell, ReferenceLine, Label } from 'recharts';

/**
 * PriceComparisonChart
 * Visualizes the difference between Current Market Price and Intrinsic Value.
 * @param {Number} marketPrice - Current trading price
 * @param {Number} intrinsicValue - Calculated fair value
 * @param {String} recommendation - BUY/HOLD/SELL signal
 */
export default function PriceComparisonChart({ marketPrice, intrinsicValue, recommendation }) {
    const upside = ((intrinsicValue - marketPrice) / marketPrice * 100).toFixed(1);
    const isPositive = intrinsicValue > marketPrice;

    const data = [
        { name: 'Market Price', value: marketPrice, color: '#94a3b8' },
        { name: 'Intrinsic Value', value: intrinsicValue, color: '#6366f1' }
    ];

    return (
        <div className="bg-[#0a0a0a] p-8 rounded-2xl border border-white/5 shadow-2xl space-y-8 h-full">
            <div className="flex justify-between items-start">
                <div>
                    <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-1">Market vs Intrinsic Value</h3>
                    <p className="text-[10px] text-indigo-400 font-bold uppercase tracking-tighter bg-indigo-500/5 px-2 py-0.5 rounded border border-indigo-500/10 w-fit">
                        Market ≠ Intrinsic
                    </p>
                </div>
                <div className={`text-right px-4 py-2 rounded-xl border ${isPositive ? 'bg-emerald-500/5 border-emerald-500/20' : 'bg-rose-500/5 border-rose-500/20'}`}>
                    <span className={`text-[10px] font-bold uppercase block mb-1 ${isPositive ? 'text-emerald-400' : 'text-rose-400'}`}>
                        {upside > 0 ? 'Potential Upside' : 'Potential Overvaluation'}
                    </span>
                    <span className={`text-2xl font-black font-mono ${isPositive ? 'text-emerald-400' : 'text-rose-400'}`}>
                        {upside}%
                    </span>
                </div>
            </div>

            <div className="h-[200px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={data} layout="vertical" margin={{ top: 5, right: 60, left: 40, bottom: 5 }}>
                        <XAxis type="number" hide domain={[0, Math.max(marketPrice, intrinsicValue) * 1.2]} />
                        <YAxis
                            dataKey="name"
                            type="category"
                            axisLine={false}
                            tickLine={false}
                            tick={{ fill: '#64748b', fontSize: 10, fontWeight: 700 }}
                            width={100}
                        />
                        <Tooltip
                            contentStyle={{
                                backgroundColor: '#050505',
                                border: '1px solid rgba(255,255,255,0.1)',
                                borderRadius: '12px'
                            }}
                            itemStyle={{ fontSize: '11px', fontWeight: 600 }}
                            cursor={{ fill: 'rgba(255,255,255,0.02)' }}
                            formatter={(val) => [`₹${val.toLocaleString()}`, 'Price']}
                        />
                        <Bar dataKey="value" radius={[0, 4, 4, 0]} barSize={32}>
                            {data.map((entry, index) => (
                                <Cell key={`cell-${index}`} fill={entry.color} fillOpacity={0.8} />
                            ))}
                        </Bar>
                    </BarChart>
                </ResponsiveContainer>
            </div>

            <div className={`mt-6 p-6 rounded-2xl border flex flex-col items-center justify-center text-center space-y-2 ${isPositive ? 'bg-indigo-600/10 border-indigo-500/20' : 'bg-slate-800/10 border-white/5'}`}>
                <span className="text-[10px] text-slate-400 font-bold uppercase tracking-[0.2em]">Fundamental Signal</span>
                <span className="text-4xl font-black text-white tracking-tighter uppercase">{recommendation}</span>
                <p className="text-[10px] text-slate-500 max-w-[240px] leading-relaxed">
                    Based on Discounted Cash Flow analysis, the asset is currently {isPositive ? 'undervalued' : 'trading above its fair value'}.
                </p>
            </div>
        </div>
    );
}
