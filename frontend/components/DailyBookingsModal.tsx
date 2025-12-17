"use client";

import { X, Calendar, ArrowRight, AlertTriangle } from "lucide-react";
import { createPortal } from "react-dom";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { GlassCard } from "@/components/ui/GlassCard";

interface Booking {
    id: string;
    vin: string;
    owner: string;
    time: string;
    date: string;
    issue: string;
    severity: string;
    status: string;
    purchase_date?: string;
}

interface DailyBookingsModalProps {
    isOpen: boolean;
    onClose: () => void;
    date: Date | null;
    bookings: Booking[];
}

export function DailyBookingsModal({ isOpen, onClose, date, bookings }: DailyBookingsModalProps) {
    if (!isOpen || !date) return null;

    // Sort by time
    const sortedBookings = [...bookings].sort((a, b) => a.time.localeCompare(b.time));

    return createPortal(
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-300">
            <GlassCard className="w-full max-w-2xl border-none bg-black/50 flex flex-col max-h-[80vh] overflow-hidden animate-in zoom-in-95 duration-300 relative shadow-2xl shadow-neon-cyan/5">
                {/* Header */}
                <div className="flex items-center justify-between p-6 border-b border-white/10 bg-white/5">
                    <div className="flex items-center gap-3">
                        <div className="p-3 bg-acid-lime/10 border border-acid-lime/20 rounded-lg text-acid-lime shadow-[0_0_10px_rgba(57,255,20,0.2)]">
                            <Calendar className="w-6 h-6" />
                        </div>
                        <div>
                            <h2 className="text-xl font-display font-bold text-white tracking-wide uppercase">
                                {date.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}
                            </h2>
                            <p className="text-xs font-mono text-gray-400 tracking-wider">
                                {bookings.length} APPOINTMENTS SCHEDULED
                            </p>
                        </div>
                    </div>
                    <button
                        onClick={onClose}
                        className="p-2 rounded-full hover:bg-white/10 text-gray-400 hover:text-white transition-colors"
                    >
                        <X className="w-5 h-5" />
                    </button>
                </div>

                {/* Content */}
                <div className="overflow-y-auto p-6 space-y-3 custom-scrollbar">
                    {sortedBookings.length === 0 ? (
                        <div className="text-center py-12 text-gray-500 font-mono text-sm">
                            NO BOOKINGS FOUND FOR THIS DATE.
                        </div>
                    ) : (
                        sortedBookings.map((booking) => (
                            <div
                                key={booking.id}
                                className="group flex items-center gap-4 p-4 rounded-xl bg-white/5 border border-white/10 hover:border-neon-cyan/50 hover:bg-neon-cyan/5 transition-all duration-300"
                            >
                                {/* Time */}
                                <div className="flex flex-col items-center justify-center w-16 px-2 py-2 bg-black/30 rounded-lg border border-white/5 font-mono text-sm">
                                    <span className="font-bold text-white">{booking.time.split(' ')[0]}</span>
                                    <span className="text-[10px] text-gray-500 uppercase">{booking.time.split(' ')[1]}</span>
                                </div>

                                {/* Info */}
                                <div className="flex-1 min-w-0">
                                    <div className="flex items-center gap-2 mb-1">
                                        <h3 className="font-bold text-white font-display tracking-wide truncate">{booking.vin}</h3>
                                        {booking.severity === 'High' || booking.severity === 'Critical' ? (
                                            <span className="text-[10px] px-2 py-0.5 rounded-full bg-plasma-magenta/10 text-plasma-magenta border border-plasma-magenta/30 flex items-center gap-1 font-mono uppercase">
                                                <AlertTriangle className="w-3 h-3" /> {booking.severity}
                                            </span>
                                        ) : (
                                            <span className="text-[10px] px-2 py-0.5 rounded-full bg-acid-lime/10 text-acid-lime border border-acid-lime/30 font-mono uppercase">
                                                {booking.severity}
                                            </span>
                                        )}
                                    </div>
                                    <p className="text-xs text-gray-400 font-sans truncate tracking-wide">
                                        {booking.issue} <span className="text-gray-600 mx-1">//</span> <span className="text-gray-500 font-mono uppercase">{booking.owner}</span>
                                    </p>
                                </div>

                                {/* Action */}
                                <Link
                                    href={`/dashboard/service/vehicle/${booking.id}`}
                                    className="opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                                >
                                    <Button size="sm" className="gap-2 bg-neon-cyan/10 hover:bg-neon-cyan text-neon-cyan hover:text-black border border-neon-cyan/50 hover:border-neon-cyan transition-all font-mono text-xs uppercase tracking-wider">
                                        Inspect <ArrowRight className="w-3 h-3" />
                                    </Button>
                                </Link>
                            </div>
                        ))
                    )}
                </div>
            </GlassCard>
        </div>,
        document.body
    );
}
