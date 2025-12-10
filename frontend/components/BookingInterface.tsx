"use client";

import { useState, useEffect } from "react";
import { format, startOfMonth, endOfMonth, eachDayOfInterval, isSameMonth, isSameDay, addMonths, subMonths } from "date-fns";
import { ChevronLeft, ChevronRight, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";

interface BookingInterfaceProps {
    onBook: (date: Date, slot: string) => void;
    availableSlots?: string[];
}

export function BookingInterface({ onBook, availableSlots = [] }: BookingInterfaceProps) {
    const [currentMonth, setCurrentMonth] = useState(new Date());
    const [selectedDate, setSelectedDate] = useState<Date | null>(new Date());
    const [selectedSlot, setSelectedSlot] = useState<string | null>(null);
    const [fetchedSlots, setFetchedSlots] = useState<string[]>([]);
    const [isLoading, setIsLoading] = useState(false);

    // Fetch slots when date changes
    useEffect(() => {
        if (!selectedDate) return;

        const fetchSlots = async () => {
            setIsLoading(true);
            try {
                // Format YYYY-MM-DD
                const dateStr = format(selectedDate, "yyyy-MM-dd");
                const res = await fetch(`http://localhost:8000/api/service-center/slots?date=${dateStr}`);
                if (res.ok) {
                    const slots = await res.json();
                    setFetchedSlots(slots);
                }
            } catch (e) {
                console.error("Failed to fetch slots", e);
            } finally {
                setIsLoading(false);
            }
        };

        fetchSlots();
        setSelectedSlot(null); // Reset selection
    }, [selectedDate]);

    // Use fetched slots, fallback to empty (or prop if needed, but dynamic is better)
    const displaySlots = fetchedSlots.length > 0 ? fetchedSlots : (isLoading ? [] : ["No Slots Available"]);

    const monthStart = startOfMonth(currentMonth);
    const monthEnd = endOfMonth(currentMonth);
    const daysInMonth = eachDayOfInterval({ start: monthStart, end: monthEnd });

    // Handle empty days at start of month for grid alignment
    const startDay = monthStart.getDay(); // 0 is Sunday
    const emptyDays = Array.from({ length: startDay });

    const handleBook = () => {
        if (selectedDate && selectedSlot) {
            onBook(selectedDate, selectedSlot);
        }
    };

    return (
        <Card className="w-full max-w-4xl mx-auto bg-card border border-border overflow-hidden flex flex-col md:flex-row shadow-2xl animate-in fade-in zoom-in duration-500">
            {/* Left: Calendar */}
            <div className="p-6 md:w-1/2 border-r border-border">
                <div className="flex items-center justify-between mb-6">
                    <Button variant="ghost" size="icon" onClick={() => setCurrentMonth(subMonths(currentMonth, 1))}>
                        <ChevronLeft className="w-5 h-5" />
                    </Button>
                    <h3 className="font-bold text-lg">{format(currentMonth, "MMMM yyyy")}</h3>
                    <Button variant="ghost" size="icon" onClick={() => setCurrentMonth(addMonths(currentMonth, 1))}>
                        <ChevronRight className="w-5 h-5" />
                    </Button>
                </div>

                <div className="grid grid-cols-7 text-center text-xs text-muted-foreground mb-2 font-mono">
                    <div>S</div><div>M</div><div>T</div><div>W</div><div>T</div><div>F</div><div>S</div>
                </div>

                <div className="grid grid-cols-7 gap-1">
                    {emptyDays.map((_, i) => <div key={`empty-${i}`} />)}
                    {daysInMonth.map((day) => {
                        const isSelected = selectedDate && isSameDay(day, selectedDate);
                        const isToday = isSameDay(day, new Date());

                        return (
                            <button
                                key={day.toString()}
                                onClick={() => setSelectedDate(day)}
                                className={`
                                    h-10 w-10 rounded-lg flex items-center justify-center text-sm transition-all
                                    ${isSelected ? "bg-primary text-primary-foreground shadow-lg scale-110" : "hover:bg-muted"}
                                    ${isToday && !isSelected ? "border border-primary/50 text-primary" : ""}
                                `}
                            >
                                {format(day, "d")}
                            </button>
                        );
                    })}
                </div>
            </div>

            {/* Right: Slots */}
            <div className="p-6 md:w-1/2 flex flex-col bg-muted/10">
                <div className="mb-6">
                    <h3 className="text-xl font-bold bg-muted/50 p-3 rounded-lg text-center border border-white/5">
                        {selectedDate ? format(selectedDate, "do MMMM, yyyy") : "Select a date"}
                    </h3>
                </div>

                <div className="flex-1">
                    <div className="grid grid-cols-2 gap-3">
                        {displaySlots.map(slot => (
                            <button
                                key={slot}
                                onClick={() => setSelectedSlot(slot)}
                                className={`
                                    p-3 rounded-md text-sm font-medium transition-all border
                                    ${selectedSlot === slot
                                        ? "bg-emerald-600/20 border-emerald-500 text-emerald-400 shadow-emerald-500/20 shadow-lg"
                                        : "bg-card border-white/5 hover:border-primary/50 hover:bg-primary/10"}
                                `}
                            >
                                {slot}
                            </button>
                        ))}
                    </div>
                </div>

                <div className="mt-8 pt-4 border-t border-white/10 flex justify-end">
                    <Button
                        onClick={handleBook}
                        disabled={!selectedDate || !selectedSlot}
                        className="w-full md:w-auto bg-primary hover:bg-primary/90 text-white gap-2 font-bold"
                    >
                        {selectedDate && selectedSlot
                            ? `Confirm for ${selectedSlot}`
                            : "Select Time Slot"}
                        <Check className="w-4 h-4" />
                    </Button>
                </div>
            </div>
        </Card>
    );
}
