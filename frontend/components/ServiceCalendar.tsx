"use client";

import { useState } from "react";
import { format, startOfMonth, endOfMonth, eachDayOfInterval, isSameDay, subMonths, addMonths } from "date-fns";
import { GlassCard } from "@/components/ui/GlassCard"; // Using GlassCard for internal structure if reasonable, or just styling div
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
        <div className="h-full bg-transparent p-6 flex flex-col">
            <div className="flex items-center justify-between mb-8">
                <div className="flex items-center gap-4">
                    <div className="p-2 bg-acid-lime/10 border border-acid-lime/20 rounded-lg text-acid-lime shadow-[0_0_10px_rgba(57,255,20,0.2)]">
                        <CalendarIcon className="w-5 h-5" />
                    </div>
                    <div>
                        <h2 className="text-xl font-bold font-display uppercase tracking-wider text-white">
                            {format(currentMonth, "MMMM yyyy")}
                        </h2>
                        <div className="flex items-center gap-2">
                            <span className="w-1.5 h-1.5 rounded-full bg-acid-lime animate-pulse" />
                            <p className="text-[10px] text-acid-lime/70 font-mono tracking-widest">
                                {bookings.length} PENDING IN QUEUE
                            </p>
                        </div>
                    </div>
                </div>
                <div className="flex items-center gap-1 border border-white/10 rounded-lg bg-black/20 p-1">
                    <Button variant="ghost" size="icon" className="h-8 w-8 hover:bg-white/10 hover:text-white text-gray-400" onClick={() => setCurrentMonth(subMonths(currentMonth, 1))}>
                        <ChevronLeft className="w-4 h-4" />
                    </Button>
                    <div className="w-[1px] h-4 bg-white/10" />
                    <Button variant="ghost" size="icon" className="h-8 w-8 hover:bg-white/10 hover:text-white text-gray-400" onClick={() => setCurrentMonth(addMonths(currentMonth, 1))}>
                        <ChevronRight className="w-4 h-4" />
                    </Button>
                </div>
            </div>

            <div className="grid grid-cols-7 mb-4 text-center border-b border-white/5 pb-2">
                {['SUN', 'MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT'].map(day => (
                    <div key={day} className="text-[10px] font-mono text-gray-500 tracking-widest">{day}</div>
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
                                relative p-3 rounded-lg border transition-all duration-300 cursor-pointer group flex flex-col justify-between
                                ${isToday ? "border-acid-lime/50 bg-acid-lime/5 shadow-[0_0_15px_rgba(57,255,20,0.1)]" : "border-white/5 bg-white/5"}
                                ${hasBookings ? "hover:border-acid-lime/30 hover:bg-acid-lime/5" : "hover:bg-white/10 hover:border-white/20"}
                            `}
                        >
                            <span className={`text-sm font-mono ${isToday ? "text-acid-lime font-bold" : "text-gray-400 group-hover:text-white"}`}>
                                {format(day, "d")}
                            </span>

                            {hasBookings && (
                                <div className="mt-2">
                                    <div className={`
                                        flex items-center justify-center h-1.5 w-full gap-0.5
                                    `}>
                                        {dayBookings.slice(0, 3).map((b, i) => (
                                            <div
                                                key={i}
                                                className={`w-1.5 h-1.5 rounded-full ${b.severity === 'High' ? 'bg-plasma-magenta shadow-[0_0_5px_#FF0099]' : 'bg-acid-lime shadow-[0_0_5px_#39FF14]'}`}
                                            />
                                        ))}
                                        {dayBookings.length > 3 && <div className="w-1 h-1 rounded-full bg-gray-600" />}
                                    </div>
                                    <div className="mt-2 text-[9px] font-mono text-center text-gray-500 group-hover:text-acid-lime transition-colors">
                                        {dayBookings.length} SLOT{dayBookings.length > 1 ? 'S' : ''}
                                    </div>
                                </div>
                            )}
                        </div>
                    );
                })}
            </div>
        </div>
    );
}
