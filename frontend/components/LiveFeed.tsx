"use client";

import { useEffect, useState } from "react";
import { Card } from "@/components/ui/card";
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
        <Card className="h-full bg-card/50 backdrop-blur-sm border-white/10 p-6 flex flex-col">
            <div className="flex items-center gap-3 mb-6">
                <div className="p-2 bg-primary/20 rounded-lg text-primary">
                    <Bell className="w-5 h-5" />
                </div>
                <h2 className="text-lg font-bold font-display tracking-wide">LIVE_FEED</h2>
            </div>

            <div className="space-y-4 overflow-y-auto flex-1 pr-2">
                {events.map((event) => (
                    <div key={event.id} className="flex gap-3 p-3 rounded-lg bg-black/20 border border-white/5 animate-in slide-in-from-right-4">
                        <event.icon className="w-4 h-4 text-muted-foreground mt-1" />
                        <div>
                            <p className="text-sm font-medium leading-snug">{event.text}</p>
                            <span className="text-xs text-muted-foreground font-mono">{event.time}</span>
                        </div>
                    </div>
                ))}
            </div>
        </Card>
    );
}
