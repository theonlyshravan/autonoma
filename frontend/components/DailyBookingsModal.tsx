"use client";

import { X, Calendar, ArrowRight, AlertTriangle } from "lucide-react";
import { createPortal } from "react-dom";
import { Button } from "@/components/ui/button";
import Link from "next/link";

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
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
            <div className="relative w-full max-w-2xl bg-card border border-white/10 rounded-xl shadow-2xl flex flex-col max-h-[80vh] overflow-hidden animate-in zoom-in-95 duration-200">
                {/* Header */}
                <div className="flex items-center justify-between p-6 border-b border-white/10 bg-muted/20">
                    <div className="flex items-center gap-3">
                        <div className="p-3 bg-primary/20 rounded-lg text-primary">
                            <Calendar className="w-6 h-6" />
                        </div>
                        <div>
                            <h2 className="text-xl font-bold text-foreground">
                                {date.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}
                            </h2>
                            <p className="text-sm text-muted-foreground">{bookings.length} Appointments Scheduled</p>
                        </div>
                    </div>
                    <button
                        onClick={onClose}
                        className="p-2 rounded-full hover:bg-white/10 text-muted-foreground hover:text-foreground transition-colors"
                    >
                        <X className="w-5 h-5" />
                    </button>
                </div>

                {/* Content */}
                <div className="overflow-y-auto p-6 space-y-3">
                    {sortedBookings.length === 0 ? (
                        <div className="text-center py-12 text-muted-foreground">
                            No bookings for this date.
                        </div>
                    ) : (
                        sortedBookings.map((booking) => (
                            <div
                                key={booking.id}
                                className="group flex items-center gap-4 p-4 rounded-xl bg-black/20 border border-white/5 hover:border-primary/50 hover:bg-primary/5 transition-all"
                            >
                                {/* Time */}
                                <div className="flex flex-col items-center justify-center w-16 px-2 py-2 bg-muted/30 rounded-lg border border-white/5 font-mono text-sm">
                                    <span className="font-bold text-foreground">{booking.time.split(' ')[0]}</span>
                                    <span className="text-xs text-muted-foreground">{booking.time.split(' ')[1]}</span>
                                </div>

                                {/* Info */}
                                <div className="flex-1 min-w-0">
                                    <div className="flex items-center gap-2 mb-1">
                                        <h3 className="font-bold text-foreground truncate">{booking.vin}</h3>
                                        {booking.severity === 'High' || booking.severity === 'Critical' ? (
                                            <span className="text-xs px-2 py-0.5 rounded-full bg-red-500/20 text-red-500 border border-red-500/30 flex items-center gap-1">
                                                <AlertTriangle className="w-3 h-3" /> {booking.severity}
                                            </span>
                                        ) : (
                                            <span className="text-xs px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-500 border border-emerald-500/30">
                                                {booking.severity}
                                            </span>
                                        )}
                                    </div>
                                    <p className="text-sm text-muted-foreground truncate">{booking.issue} • {booking.owner}</p>
                                </div>

                                {/* Action */}
                                <Link
                                    href={`/dashboard/service/vehicle/${booking.id}`}
                                    target="_blank"
                                >
                                    <Button size="sm" className="gap-2 bg-white/5 hover:bg-primary hover:text-white border border-white/10 transition-all">
                                        Inspect <ArrowRight className="w-4 h-4" />
                                    </Button>
                                </Link>
                            </div>
                        ))
                    )}
                </div>
            </div>
        </div>,
        document.body
    );
}
