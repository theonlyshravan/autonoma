"use client";

import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, AreaChart, Area } from 'recharts';
import { GlassCard } from "@/components/ui/GlassCard";
import { cn } from "@/lib/utils";

interface TelemetryChartProps {
    data: Record<string, string | number>[];
    dataKey: string;
    color: string;
    title: string;
    unit: string;
    className?: string; // Allow custom classes
}

export function TelemetryChart({ data, dataKey, color, title, unit, className }: TelemetryChartProps) {
    const currentValue = data.length > 0 ? Number(data[data.length - 1][dataKey]).toFixed(1) : "--";

    return (
        <GlassCard className={cn("h-48 flex flex-col pt-4 border-none bg-black/40", className)}>
            <div className="px-4 pb-2 flex justify-between items-end">
                <div>
                    <h3 className="text-[10px] font-mono text-muted-foreground uppercase tracking-widest leading-none mb-1">{title}</h3>
                    <div className="text-2xl font-display font-bold text-white leading-none">
                        {currentValue} <span className="text-[10px] font-sans text-neon-cyan opacity-80">{unit}</span>
                    </div>
                </div>
                {/* Live Indicator */}
                <div className="flex items-center gap-1.5 mb-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-acid-lime animate-pulse" />
                    <span className="text-[9px] font-mono text-acid-lime tracking-widest opacity-80">LIVE</span>
                </div>
            </div>

            <div className="flex-1 w-full min-h-0 relative">
                {/* Gradient Definition */}
                <svg style={{ height: 0, width: 0, position: 'absolute' }}>
                    <defs>
                        <linearGradient id={`gradient-${dataKey}`} x1="0" y1="0" x2="0" y2="1">
                            <stop offset="0%" stopColor={color} stopOpacity={0.4} />
                            <stop offset="100%" stopColor={color} stopOpacity={0} />
                        </linearGradient>
                    </defs>
                </svg>

                <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={data}>
                        <XAxis dataKey="timestamp" hide />
                        <YAxis hide domain={['auto', 'auto']} />
                        <Tooltip
                            contentStyle={{
                                backgroundColor: 'rgba(5, 5, 5, 0.9)',
                                border: '1px solid rgba(255, 255, 255, 0.1)',
                                borderRadius: '8px',
                                boxShadow: '0 0 10px rgba(0,0,0,0.5)',
                                backdropFilter: 'blur(4px)'
                            }}
                            itemStyle={{ color: color, fontFamily: 'var(--font-mono)', fontSize: '10px' }}
                            labelStyle={{ display: 'none' }}
                            formatter={(value: number) => [`${Number(value).toFixed(2)} ${unit}`, title]}
                            cursor={{ stroke: 'rgba(255,255,255,0.1)', strokeWidth: 1 }}
                        />
                        <Area
                            type="monotone"
                            dataKey={dataKey}
                            stroke={color}
                            strokeWidth={2}
                            fill={`url(#gradient-${dataKey})`}
                            isAnimationActive={true}
                        />
                    </AreaChart>
                </ResponsiveContainer>
            </div>
        </GlassCard>
    );
}
