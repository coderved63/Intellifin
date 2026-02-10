"use client";
import React from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

export default function FundamentalLineChart({ data, title, metricKey, color = "#4f46e5", unit = "₹ '000" }) {
    if (!data || data.length === 0) return (
        <div className="h-[300px] w-full bg-[#0a0a0a] p-6 rounded-2xl border border-white/5 flex items-center justify-center text-slate-500 text-xs italic">
            Insufficient data for {title} chart.
        </div>
    );

    return (
        <div className="bg-[#0a0a0a] p-6 rounded-2xl border border-white/5 shadow-2xl space-y-4">
            <div className="flex justify-between items-center">
                <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest">{title}</h3>
                <span className="text-[9px] text-slate-600 font-bold uppercase tracking-tighter bg-white/5 px-2 py-0.5 rounded border border-white/5">
                    {unit}
                </span>
            </div>

            <div className="h-[240px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={data} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(255,255,255,0.03)" />
                        <XAxis
                            dataKey="year"
                            axisLine={false}
                            tickLine={false}
                            tick={{ fill: '#475569', fontSize: 10, fontWeight: 600 }}
                            padding={{ left: 10, right: 10 }}
                        />
                        <YAxis
                            axisLine={false}
                            tickLine={false}
                            tick={{ fill: '#475569', fontSize: 10, fontWeight: 600 }}
                            tickFormatter={(val) => `₹${(val / 1000000).toFixed(1)}M`}
                        />
                        <Tooltip
                            contentStyle={{
                                backgroundColor: '#050505',
                                border: '1px solid rgba(255,255,255,0.1)',
                                borderRadius: '12px',
                                boxShadow: '0 20px 25px -5px rgb(0 0 0 / 0.5)'
                            }}
                            itemStyle={{ fontSize: '11px', fontWeight: 600 }}
                            labelStyle={{ color: '#64748b', fontSize: '10px', marginBottom: '4px' }}
                            formatter={(val) => [`₹${val.toLocaleString()}`, title]}
                        />
                        <Line
                            type="monotone"
                            dataKey={metricKey}
                            stroke={color}
                            strokeWidth={2.5}
                            dot={{ fill: color, strokeWidth: 2, r: 4, stroke: '#0a0a0a' }}
                            activeDot={{ r: 6, strokeWidth: 0 }}
                            animationDuration={1500}
                        />
                    </LineChart>
                </ResponsiveContainer>
            </div>

            <p className="text-[10px] text-slate-600 italic leading-relaxed">
                Fundamental metric sourced from audited {title.toLowerCase()} data.
            </p>
        </div>
    );
}
