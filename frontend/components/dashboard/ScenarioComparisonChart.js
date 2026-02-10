"use client";
import React from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell, LabelList } from 'recharts';

/**
 * ScenarioComparisonChart
 * Visualizes the difference between Base Case and What-If Scenario.
 * @param {Number} baseValue - Original intrinsic value
 * @param {Number} scenarioValue - Adjusted intrinsic value
 */
export default function ScenarioComparisonChart({ baseValue, scenarioValue }) {
    const data = [
        { name: 'Base Case', value: baseValue, color: '#475569', dashed: false },
        { name: 'What-If Scenario', value: scenarioValue, color: '#6366f1', dashed: true }
    ];

    return (
        <div className="bg-[#0a0a0a] p-8 rounded-2xl border border-white/5 shadow-2xl space-y-6">
            <div className="flex justify-between items-center">
                <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest">Sensitivity Analysis</h3>
                <span className="text-[9px] text-indigo-400 font-bold uppercase tracking-tighter bg-indigo-500/5 px-2 py-0.5 rounded border border-indigo-500/10">
                    Real-time Simulation
                </span>
            </div>

            <div className="h-[240px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={data} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(255,255,255,0.03)" />
                        <XAxis
                            dataKey="name"
                            axisLine={false}
                            tickLine={false}
                            tick={{ fill: '#475569', fontSize: 10, fontWeight: 600 }}
                        />
                        <YAxis
                            hide
                            domain={[0, Math.max(baseValue, scenarioValue) * 1.2]}
                        />
                        <Tooltip
                            contentStyle={{
                                backgroundColor: '#050505',
                                border: '1px solid rgba(255,255,255,0.1)',
                                borderRadius: '12px'
                            }}
                            itemStyle={{ fontSize: '11px', fontWeight: 600 }}
                            cursor={{ fill: 'rgba(255,255,255,0.02)' }}
                            formatter={(val) => [`₹${val.toFixed(2)}`, 'Value']}
                        />
                        <Bar dataKey="value" radius={[4, 4, 0, 0]} barSize={50}>
                            {data.map((entry, index) => (
                                <Cell
                                    key={`cell-${index}`}
                                    fill={entry.color}
                                    fillOpacity={entry.dashed ? 0.4 : 0.8}
                                    stroke={entry.color}
                                    strokeDasharray={entry.dashed ? "5 5" : "0"}
                                    strokeWidth={entry.dashed ? 2 : 0}
                                />
                            ))}
                            <LabelList
                                dataKey="value"
                                position="top"
                                formatter={(val) => `₹${val.toFixed(2)}`}
                                fill="#94a3b8"
                                fontSize={11}
                                fontWeight={700}
                                offset={10}
                            />
                        </Bar>
                    </BarChart>
                </ResponsiveContainer>
            </div>

            <div className="pt-4 border-t border-white/5">
                <p className="text-[10px] text-slate-600 italic leading-relaxed">
                    Values shown are simulated fair-value estimates per share. Solid bar represents the audited baseline; dashed bar represents the "What-If" projection.
                </p>
            </div>
        </div>
    );
}
