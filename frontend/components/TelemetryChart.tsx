"use client";

import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';
import { Card, CardHeader, CardTitle } from "@/components/ui/card";

interface TelemetryChartProps {
    data: Record<string, string | number>[];
    dataKey: string;
    color: string;
    title: string;
    unit: string;
}

export function TelemetryChart({ data, dataKey, color, title, unit }: TelemetryChartProps) {
    const currentValue = data.length > 0 ? Number(data[data.length - 1][dataKey]).toFixed(1) : "--";

    return (
        <Card className="h-48 flex flex-col bg-card/50 backdrop-blur-sm border-white/5">
            <CardHeader className="pb-2">
                <div className="flex justify-between items-center">
                    <CardTitle className="text-sm font-mono text-muted-foreground">{title}</CardTitle>
                    <span className="text-xl font-bold font-display" style={{ color }}>
                        {currentValue} <span className="text-xs text-muted-foreground">{unit}</span>
                    </span>
                </div>
            </CardHeader>
            <div className="flex-1 w-full min-h-0">
                <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={data}>
                        <XAxis dataKey="timestamp" hide />
                        <YAxis hide domain={['auto', 'auto']} />
                        <Tooltip
                            contentStyle={{ backgroundColor: '#111', border: '1px solid #333' }}
                            itemStyle={{ color: color }}
                            labelStyle={{ display: 'none' }}
                            formatter={(value: number) => [`${Number(value).toFixed(2)} ${unit}`, title]}
                        />
                        <Line
                            type="monotone"
                            dataKey={dataKey}
                            stroke={color}
                            strokeWidth={2}
                            dot={false}
                            isAnimationActive={false} // Disable animation for performance
                        />
                    </LineChart>
                </ResponsiveContainer>
            </div>
        </Card>
    );
}
