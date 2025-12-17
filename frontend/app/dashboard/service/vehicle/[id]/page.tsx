"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { ArrowLeft, Activity, Thermometer, Zap, AlertTriangle, CheckCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, ResponsiveContainer, AreaChart, Area } from "recharts";
import { API_URL } from "@/lib/config";

type Booking = {
    id: string;
    vin: string;
    owner: string;
    time: string;
    date: string;
    issue: string;
    severity: string;
    status: string;
    purchase_date: string;
};

// Mock Sensor Data Generator
const generateSensorData = () => {
    return Array.from({ length: 20 }, (_, i) => ({
        time: `${i}:00`,
        temp: 45 + Math.random() * 30, // Random temp 45-75
        rpm: 3000 + Math.random() * 2000,
        voltage: 380 + Math.random() * 40
    }));
};

export default function VehicleDetailsPage() {
    const params = useParams();
    const router = useRouter();
    const id = params?.id as string;

    const [booking, setBooking] = useState<Booking | null>(null);
    const [loading, setLoading] = useState(true);
    const [sensorData, setSensorData] = useState<any[]>([]);

    useEffect(() => {
        setSensorData(generateSensorData());
    }, []);

    useEffect(() => {
        if (!id) return;

        const fetchBooking = async () => {
            try {
                const res = await fetch(`${API_URL}/api/service-center/booking/${id}`);
                if (res.ok) {
                    const data = await res.json();
                    setBooking(data);
                }
            } catch (error) {
                console.error("Failed to fetch booking", error);
            } finally {
                setLoading(false);
            }
        };

        fetchBooking();
    }, [id]);

    // Live update simulation
    useEffect(() => {
        const interval = setInterval(() => {
            setSensorData(prev => {
                const newPoint = {
                    time: "Now",
                    temp: 45 + Math.random() * 30,
                    rpm: 3000 + Math.random() * 2000,
                    voltage: 380 + Math.random() * 40
                };
                return [...prev.slice(1), newPoint];
            });
        }, 2000);
        return () => clearInterval(interval);
    }, []);

    if (loading) return <div className="p-8 text-center animate-pulse">LOADING DATA STREAM...</div>;
    if (!booking) return <div className="p-8 text-center text-red-500">DATA NOT FOUND FOR ID: {id}</div>;

    return (
        <div className="min-h-screen bg-background p-6 space-y-6">
            {/* Header */}
            <div className="flex items-center gap-4 border-b border-white/10 pb-6">
                <Button variant="ghost" size="icon" onClick={() => router.back()}>
                    <ArrowLeft className="w-6 h-6" />
                </Button>
                <div>
                    <h1 className="text-3xl font-display font-bold flex items-center gap-3">
                        {booking.vin} <span className="text-primary text-lg font-mono"> // {booking.owner.toUpperCase()}</span>
                    </h1>
                    <p className="text-muted-foreground flex items-center gap-2 text-sm">
                        PURCHASED: {booking.purchase_date} | TICKET: {booking.id}
                    </p>
                </div>
                <div className="ml-auto flex gap-3">
                    <span className={`px-4 py-1 rounded-full border text-sm font-bold flex items-center gap-2 ${booking.severity === 'Critical' ? 'border-red-500 text-red-500 bg-red-500/10' : 'border-yellow-500 text-yellow-500 bg-yellow-500/10'}`}>
                        <AlertTriangle className="w-4 h-4" /> {booking.severity}
                    </span>
                    <span className="px-4 py-1 rounded-full border border-emerald-500 text-emerald-500 bg-emerald-500/10 text-sm font-bold flex items-center gap-2">
                        <CheckCircle className="w-4 h-4" /> {booking.status}
                    </span>
                </div>
            </div>

            {/* Main Content Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Left: Issue Details */}
                <Card className="p-6 border-white/10 bg-card/50 backdrop-blur lg:col-span-1 h-fit">
                    <h2 className="text-xl font-bold mb-4 flex items-center gap-2 text-primary">
                        <Activity className="w-5 h-5" /> DIAGNOSTIC REPORT
                    </h2>
                    <div className="space-y-4">
                        <div className="p-4 bg-black/40 rounded-lg border border-white/5">
                            <label className="text-xs text-muted-foreground font-mono">REPORTED ISSUE</label>
                            <p className="text-lg font-medium">{booking.issue}</p>
                        </div>
                        <div className="p-4 bg-black/40 rounded-lg border border-white/5">
                            <label className="text-xs text-muted-foreground font-mono">SCHEDULED FOR</label>
                            <p className="text-lg font-medium">{booking.date} @ {booking.time}</p>
                        </div>
                        <div className="p-4 bg-black/40 rounded-lg border border-white/5">
                            <label className="text-xs text-muted-foreground font-mono">RECOMMENDED ACTION</label>
                            <p className="text-sm text-foreground/80 leading-relaxed">
                                Inspect high-voltage battery modules. Check coolant flow rate and pump actuation. Possible sensor drift on Module #4.
                            </p>
                        </div>
                    </div>
                </Card>

                {/* Right: Telemetry Graphs */}
                <div className="lg:col-span-2 space-y-6">
                    {/* Graph 1: Battery Temp */}
                    <Card className="p-6 border-white/10 bg-card/50 backdrop-blur">
                        <h2 className="text-lg font-bold mb-4 flex items-center gap-2 text-purple-400">
                            <Thermometer className="w-5 h-5" /> BATTERY THERMAL METRICS
                        </h2>
                        <div className="h-[250px] w-full">
                            <ResponsiveContainer width="100%" height="100%">
                                <AreaChart data={sensorData}>
                                    <defs>
                                        <linearGradient id="colorTemp" x1="0" y1="0" x2="0" y2="1">
                                            <stop offset="5%" stopColor="#a855f7" stopOpacity={0.8} />
                                            <stop offset="95%" stopColor="#a855f7" stopOpacity={0} />
                                        </linearGradient>
                                    </defs>
                                    <CartesianGrid strokeDasharray="3 3" stroke="#ffffff10" />
                                    <XAxis dataKey="time" hide />
                                    <YAxis domain={[40, 90]} stroke="#666" fontSize={12} />
                                    <RechartsTooltip
                                        contentStyle={{ backgroundColor: '#000', borderColor: '#333' }}
                                        itemStyle={{ color: '#a855f7' }}
                                    />
                                    <Area type="monotone" dataKey="temp" stroke="#a855f7" fillOpacity={1} fill="url(#colorTemp)" />
                                </AreaChart>
                            </ResponsiveContainer>
                        </div>
                    </Card>

                    {/* Graph 2: Voltage */}
                    <Card className="p-6 border-white/10 bg-card/50 backdrop-blur">
                        <h2 className="text-lg font-bold mb-4 flex items-center gap-2 text-cyan-400">
                            <Zap className="w-5 h-5" /> HV BUS VOLTAGE
                        </h2>
                        <div className="h-[200px] w-full">
                            <ResponsiveContainer width="100%" height="100%">
                                <LineChart data={sensorData}>
                                    <CartesianGrid strokeDasharray="3 3" stroke="#ffffff10" />
                                    <XAxis dataKey="time" hide />
                                    <YAxis domain={[350, 450]} stroke="#666" fontSize={12} />
                                    <RechartsTooltip
                                        contentStyle={{ backgroundColor: '#000', borderColor: '#333' }}
                                        itemStyle={{ color: '#22d3ee' }}
                                    />
                                    <Line type="step" dataKey="voltage" stroke="#22d3ee" strokeWidth={2} dot={false} />
                                </LineChart>
                            </ResponsiveContainer>
                        </div>
                    </Card>
                </div>
            </div>
        </div>
    );
}
