"use client";

import { useState, useEffect } from "react";
import { ServiceCalendar, Booking } from "@/components/ServiceCalendar";
import { LiveFeed } from "@/components/LiveFeed";
import { DailyBookingsModal } from "@/components/DailyBookingsModal";

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
        <div className="h-[calc(100vh-6rem)] p-4 md:p-8 max-w-[1600px] mx-auto w-full grid grid-cols-1 lg:grid-cols-3 gap-6">

            {/* Calendar Section */}
            <div className="lg:col-span-2 h-full">
                <ServiceCalendar
                    bookings={bookings}
                    onDateClick={(date, dayBookings) => {
                        setSelectedDate(date);
                        setDailyBookings(dayBookings);
                    }}
                />
            </div>

            {/* Live Feed Section */}
            <div className="lg:col-span-1 h-full">
                <LiveFeed />
            </div>

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
