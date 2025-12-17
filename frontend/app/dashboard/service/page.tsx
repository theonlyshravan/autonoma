"use client";

import { useState, useEffect } from "react";
import { ServiceCalendar, Booking } from "@/components/ServiceCalendar";
import { LiveFeed } from "@/components/LiveFeed";
import { DailyBookingsModal } from "@/components/DailyBookingsModal";
import { BentoGrid, BentoGridItem } from "@/components/ui/BentoGrid";

export default function ServiceDashboard() {
    // State
    const [bookings, setBookings] = useState<Booking[]>([]);
    const [selectedDate, setSelectedDate] = useState<Date | null>(null);
    const [dailyBookings, setDailyBookings] = useState<Booking[]>([]);

    useEffect(() => {
        const fetchBookings = async () => {
            try {
                const res = await fetch("http://localhost:8000/api/service-center/bookings");
                if (res.ok) {
                    const data = await res.json();
                    setBookings(data);
                }
            } catch (error) {
                console.error("Failed to fetch bookings", error);
            }
        };

        fetchBookings();
        const interval = setInterval(fetchBookings, 5000);
        return () => clearInterval(interval);
    }, []);

    return (
        <div className="h-full w-full p-4 md:p-8 bg-transparent">
            <header className="mb-6">
                <h1 className="text-4xl font-display font-bold text-transparent bg-clip-text bg-gradient-to-r from-acid-lime to-white tracking-widest neon-text">
                    SERVICE SCHEDULE
                </h1>
                <p className="text-xs font-mono text-acid-lime/60 tracking-[0.3em] uppercase mt-1">
                    APPOINTMENT LOGISTICS // SECTOR 7
                </p>
            </header>

            <BentoGrid className="grid-cols-1 md:grid-cols-3 auto-rows-[minmax(300px,auto)]">
                {/* Calendar Section (2x2 on desktop) */}
                <BentoGridItem colSpan={2} className="row-span-2 md:col-span-2 bg-black/40 border-none p-0 overflow-hidden">
                    <ServiceCalendar
                        bookings={bookings}
                        onDateClick={(date, dayBookings) => {
                            setSelectedDate(date);
                            setDailyBookings(dayBookings);
                        }}
                    />
                </BentoGridItem>

                {/* Live Feed Section (Right Column) */}
                <BentoGridItem colSpan={1} className="row-span-2 md:col-span-1 bg-black/40 border-none p-0 overflow-hidden">
                    <LiveFeed />
                </BentoGridItem>
            </BentoGrid>

            {/* Daily Bookings List Modal */}
            <DailyBookingsModal
                isOpen={!!selectedDate}
                onClose={() => setSelectedDate(null)}
                date={selectedDate}
                bookings={dailyBookings}
            />
        </div>
    );
}
