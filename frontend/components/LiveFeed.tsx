"use client";

import { useEffect, useState } from "react";
import { Bell, CheckCircle, Clock } from "lucide-react";

export function LiveFeed() {
    const [events, setEvents] = useState([
        { id: 1, text: "System Initialized. Waiting for appointments...", time: "Now", icon: Clock }
    ]);

    // Mock live feed updates
    useEffect(() => {
        const interval = setInterval(() => {
            if (Math.random() > 0.7) {
                const newEvent = {
                    id: Date.now(),
                    text: "New telemetry data received from connected fleet.",
                    time: "Just now",
                    icon: CheckCircle
                };
                setEvents(prev => [newEvent, ...prev].slice(0, 5));
            }
        }, 5000);
        return () => clearInterval(interval);
    }, []);

    return (
        <div className="h-full bg-transparent p-6 flex flex-col">
            <div className="flex items-center gap-3 mb-6">
                <div className="p-2 bg-neon-cyan/10 border border-neon-cyan/20 rounded-lg text-neon-cyan shadow-[0_0_10px_rgba(0,240,255,0.2)]">
                    <Bell className="w-5 h-5" />
                </div>
                <div>
                    <h2 className="text-lg font-bold font-display tracking-wide text-white">LIVE_FEED</h2>
                    <div className="flex items-center gap-2">
                        <span className="w-1.5 h-1.5 rounded-full bg-neon-cyan animate-pulse" />
                        <span className="text-[10px] font-mono text-neon-cyan/70 tracking-widest uppercase">Stream Active</span>
                    </div>
                </div>
            </div>

            <div className="space-y-3 overflow-y-auto flex-1 pr-2 custom-scrollbar">
                {events.map((event) => (
                    <div key={event.id} className="relative pl-4 border-l border-white/10 pb-4 last:border-0 last:pb-0 animate-in slide-in-from-right-4 duration-500">
                        {/* Timeline Dot */}
                        <div className="absolute -left-[5px] top-1 w-2.5 h-2.5 rounded-full bg-black border border-neon-cyan shadow-[0_0_5px_#00F0FF]" />

                        <div className="p-3 rounded-lg bg-white/5 border border-white/5 hover:bg-white/10 transition-colors">
                            <p className="text-xs font-sans text-gray-300 leading-snug mb-1">{event.text}</p>
                            <span className="text-[10px] text-neon-cyan/60 font-mono tracking-wider uppercase">{event.time}</span>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}
