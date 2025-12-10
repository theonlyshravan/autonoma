"use client";

import { useState } from "react";
import { format, startOfMonth, endOfMonth, eachDayOfInterval, isSameDay, subMonths, addMonths } from "date-fns";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Calendar as CalendarIcon, ChevronLeft, ChevronRight } from "lucide-react";

export type Booking = {
    id: string;
    vin: string;
    owner: string;
    time: string;
    date: string; // YYYY-MM-DD
    issue: string;
    severity: "Critical" | "High" | "Medium" | "Low";
    status: "PENDING" | "CONFIRMED" | "COMPLETED";
    purchase_date?: string;
};

interface ServiceCalendarProps {
    bookings: Booking[];
    onDateClick?: (date: Date, bookings: Booking[]) => void;
}

export function ServiceCalendar({ bookings, onDateClick }: ServiceCalendarProps) {
    const [currentMonth, setCurrentMonth] = useState(new Date());

    const monthStart = startOfMonth(currentMonth);
    const monthEnd = endOfMonth(currentMonth);
    const daysInMonth = eachDayOfInterval({ start: monthStart, end: monthEnd });

    // Handle empty slots for alignment
    const startDay = monthStart.getDay();
    const emptyDays = Array.from({ length: startDay });

    return (
        <Card className="h-full bg-card/50 backdrop-blur-sm border-white/10 p-6 flex flex-col">
            <div className="flex items-center justify-between mb-8">
                <div className="flex items-center gap-4">
                    <div className="p-2 bg-primary/20 rounded-lg text-primary">
                        <CalendarIcon className="w-6 h-6" />
                    </div>
                    <div>
                        <h2 className="text-xl font-bold font-display uppercase tracking-wider">
                            Service_Schedule // {format(currentMonth, "MMM yyyy")}
                        </h2>
                        <p className="text-xs text-muted-foreground font-mono">
                            {bookings.length} ACTIVE APPOINTMENTS
                        </p>
                    </div>
                </div>
                <div className="flex items-center gap-2">
                    <Button variant="ghost" size="icon" onClick={() => setCurrentMonth(subMonths(currentMonth, 1))}>
                        <ChevronLeft className="w-5 h-5" />
                    </Button>
                    <Button variant="ghost" size="icon" onClick={() => setCurrentMonth(addMonths(currentMonth, 1))}>
                        <ChevronRight className="w-5 h-5" />
                    </Button>
                </div>
            </div>

            <div className="grid grid-cols-7 mb-4 text-center">
                {['SUN', 'MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT'].map(day => (
                    <div key={day} className="text-xs font-mono text-muted-foreground py-2">{day}</div>
                ))}
            </div>

            <div className="grid grid-cols-7 gap-3 flex-1 auto-rows-fr">
                {emptyDays.map((_, i) => <div key={`empty-${i}`} className="bg-transparent" />)}

                {daysInMonth.map(day => {
                    const dateKey = format(day, "yyyy-MM-dd");
                    const dayBookings = bookings.filter(b => b.date === dateKey);
                    const isToday = isSameDay(day, new Date());
                    const hasBookings = dayBookings.length > 0;

                    // Severity check for indicator color
                    const hasHighSeverity = dayBookings.some(b => b.severity === 'High' || b.severity === 'Critical');

                    return (
                        <div
                            key={day.toString()}
                            onClick={() => onDateClick?.(day, dayBookings)}
                            className={`
                                relative p-3 rounded-xl border transition-all cursor-pointer group flex flex-col justify-between
                                ${isToday ? "border-primary/50 bg-primary/5" : "border-white/5 bg-black/20"}
                                ${hasBookings ? "hover:border-primary hover:bg-primary/10 hover:shadow-lg hover:shadow-primary/10" : "hover:bg-white/5"}
                            `}
                        >
                            <span className={`text-sm font-mono ${isToday ? "text-primary font-bold" : "text-muted-foreground group-hover:text-foreground"}`}>
                                {format(day, "d")}
                            </span>

                            {hasBookings && (
                                <div className="mt-2">
                                    <div className={`
                                        inline-flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-bold w-full justify-center transition-colors
                                        ${hasHighSeverity
                                            ? "bg-amber-500/10 text-amber-500 border border-amber-500/20 group-hover:bg-amber-500/20"
                                            : "bg-blue-500/10 text-blue-400 border border-blue-500/20 group-hover:bg-blue-500/20"}
                                    `}>
                                        <span>{dayBookings.length} APPT{dayBookings.length > 1 ? 'S' : ''}</span>
                                    </div>

                                    {/* Visual dots for specific bookings (max 3) */}
                                    <div className="flex gap-1 justify-center mt-2">
                                        {dayBookings.slice(0, 3).map((b, i) => (
                                            <div
                                                key={i}
                                                className={`w-1.5 h-1.5 rounded-full ${b.severity === 'High' ? 'bg-red-500' : 'bg-emerald-500'}`}
                                            />
                                        ))}
                                        {dayBookings.length > 3 && <div className="w-1.5 h-1.5 rounded-full bg-muted" />}
                                    </div>
                                </div>
                            )}
                        </div>
                    );
                })}
            </div>
        </Card>
    );
}
