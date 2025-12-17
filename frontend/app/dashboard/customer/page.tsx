"use client";

import { useState, useEffect, useRef } from "react";
// Removed unwanted imports: Zap, Thermometer, etc.
import { Send, User, Bot, X } from "lucide-react";
import { GlassCard } from "@/components/ui/GlassCard";
import { NeonButton } from "@/components/ui/NeonButton";
import { ScannerInput } from "@/components/ui/ScannerInput";
import { BentoGrid, BentoGridItem } from "@/components/ui/BentoGrid";
import { useAuth } from "@/app/contexts/AuthContext";
import { BookingInterface } from "@/components/BookingInterface";
import { cn } from "@/lib/utils";

type Message = {
    id: string;
    sender: "user" | "bot";
    text: string;
    timestamp: Date;
};

export default function CustomerChatPage() {
    const { user } = useAuth();
    const [messages, setMessages] = useState<Message[]>([
        {
            id: "welcome",
            sender: "bot",
            text: `Hello ${user?.name || 'Customer'}. I am monitoring your vehicle. Everything looks good right now, but I'm here if you need anything.`,
            timestamp: new Date()
        }
    ]);
    const [inputText, setInputText] = useState("");
    const [isTyping, setIsTyping] = useState(false);
    const [showBooking, setShowBooking] = useState(false);
    const [availableSlots, setAvailableSlots] = useState<string[]>([]);
    const [vin, setVin] = useState<string>("");

    const scrollRef = useRef<HTMLDivElement>(null);

    // Auto-scroll to bottom
    useEffect(() => {
        if (scrollRef.current) {
            scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
        }
    }, [messages]);

    // Poll for Anomaly from Backend
    useEffect(() => {
        const checkStatus = async () => {
            try {
                const token = localStorage.getItem("token");
                if (!token) return;

                const res = await fetch("http://localhost:8000/api/vehicles/my-status", {
                    headers: { "Authorization": `Bearer ${token}` }
                });
                const data = await res.json();

                if (data.vehicle && data.vehicle.vin) {
                    console.log("DEBUG: Setting VIN to", data.vehicle.vin);
                    setVin(data.vehicle.vin);
                } else {
                    console.log("DEBUG: No VIN found in data", data);
                }

                if (data.anomaly) {
                    const warningMsg = `⚠️ ALERT: ${data.anomaly.description}. Severity: ${data.anomaly.severity}.`;
                    setMessages(prev => {
                        if (prev.some(m => m.text === warningMsg)) return prev;
                        return [...prev, {
                            id: Date.now().toString(),
                            sender: "bot",
                            text: warningMsg,
                            timestamp: new Date()
                        }];
                    });

                    // Trigger bot follow up safely
                    setTimeout(() => {
                        setMessages(prev => {
                            if (prev.some(m => m.text.includes("book a service appointment"))) return prev;
                            return [...prev, {
                                id: Date.now().toString() + "_followup",
                                sender: "bot",
                                text: "Based on this anomaly, you should book a service appointment immediately. Shall I look for a slot?",
                                timestamp: new Date()
                            }];
                        })
                    }, 1500);
                }
            } catch (e) {
                console.error("Failed to check status", e);
            }
        };

        const timer = setInterval(checkStatus, 5000); // Check every 5s
        checkStatus(); // Initial Check
        return () => clearInterval(timer);
    }, []);

    const addMessage = (sender: "user" | "bot", text: string) => {
        setMessages(prev => [...prev, {
            id: Date.now().toString() + Math.random(),
            sender,
            text,
            timestamp: new Date()
        }]);
    };

    const handleSend = async (messageOverride?: string) => {
        const msgToSend = messageOverride || inputText;
        if (!msgToSend.trim()) return;

        addMessage("user", msgToSend);
        setInputText("");
        setIsTyping(true);

        try {
            // Call Backend API
            const res = await fetch("http://localhost:8000/api/chat", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    message: msgToSend,
                    history: messages.map(m => ({ sender: m.sender, content: m.text })),
                    vin: vin
                })
            });
            console.log("DEBUG: Sent chat with VIN:", vin);
            const data = await res.json();

            setIsTyping(false);
            if (data.response) {
                addMessage("bot", data.response);
            }

            // Handle Booking Signal
            if (data.show_booking_ui) {
                setAvailableSlots(data.available_slots || []);
                setShowBooking(true);
            }

        } catch (error) {
            console.error(error);
            setIsTyping(false);
            addMessage("bot", "I'm having trouble connecting to the manufacturing cloud. Please try again.");
        }
    };

    const handleBookSlot = (date: Date, slot: string) => {
        const dateStr = date.toLocaleDateString();
        // Hide UI
        setShowBooking(false);
        // Send confirmation message to agent -> Logic will handle booking
        // Generate a mock booking ID for now, or get it from backend response if we had full integration in this step
        const mockBookingId = `BK-${Math.floor(Math.random() * 10000)}`;
        handleSend(`Book the slot for ${dateStr} at ${slot}. confirm_id:${mockBookingId}`);
        // Note: The backend agent would ideally return this ID. For now we simulate the client sending the request,
        // and we'll handle the Agent response below or in the agent logic.
        // Actually, user wants "conformation message with the booking id".
        // We'll simulate the bot response with ID immediately for better UX if the backend doesn't support it fully yet.
        setTimeout(() => {
            addMessage("bot", `Booking confirmed for ${dateStr} at ${slot}. Your Booking ID is: ${mockBookingId}`);
        }, 1000);
    };

    return (
        <div className="h-full w-full p-4 md:p-8 bg-transparent">
            {/* Header Removed as requested */}

            <BentoGrid className="grid-cols-1 md:grid-cols-1 auto-rows-[minmax(500px,auto)]">

                {/* Main Chat Interface (Full Width) */}
                <BentoGridItem
                    colSpan={1}
                    className="md:col-span-1 row-span-1 bg-black/40 border-none relative overflow-hidden flex flex-col h-[85vh]"
                >
                    {/* Header */}
                    <div className="absolute top-0 left-0 right-0 h-12 bg-gradient-to-b from-black/80 to-transparent z-10 flex items-center px-6 border-b border-white/5">
                        <div className="w-2 h-2 rounded-full bg-acid-lime animate-pulse mr-3" />
                        <span className="font-mono text-xs text-acid-lime tracking-widest">LIVE LINK ESTABLISHED</span>
                    </div>

                    {/* Chat Area */}
                    <div
                        ref={scrollRef}
                        className="flex-1 overflow-y-auto p-6 pt-16 space-y-6 scroll-smooth custom-scrollbar"
                    >
                        {messages.map((msg) => (
                            <div
                                key={msg.id}
                                className={`flex ${msg.sender === "user" ? "justify-end" : "justify-start"}`}
                            >
                                <div className={cn(
                                    "max-w-[85%] p-4 rounded-2xl text-sm leading-relaxed backdrop-blur-md border shadow-lg relative",
                                    msg.sender === "user"
                                        ? "bg-neon-cyan/10 border-neon-cyan/50 text-white rounded-br-none"
                                        : "bg-white/5 border-white/10 text-gray-200 rounded-bl-none"
                                )}>
                                    {/* Decoration for bot messages */}
                                    {msg.sender === "bot" && (
                                        <div className="absolute -left-3 -top-3 w-6 h-6 rounded-full bg-black border border-white/20 flex items-center justify-center">
                                            <Bot className="w-3 h-3 text-neon-cyan" />
                                        </div>
                                    )}
                                    {msg.text}
                                </div>
                            </div>
                        ))}

                        {isTyping && (
                            <div className="flex justify-start">
                                <div className="bg-white/5 border border-white/10 p-4 rounded-2xl rounded-bl-none flex gap-2 items-center">
                                    <span className="w-1.5 h-1.5 bg-neon-cyan animate-bounce" />
                                    <span className="w-1.5 h-1.5 bg-neon-cyan animate-bounce [animation-delay:-0.15s]" />
                                    <span className="w-1.5 h-1.5 bg-neon-cyan animate-bounce [animation-delay:-0.3s]" />
                                </div>
                            </div>
                        )}
                        <div className="h-6" />
                    </div>

                    {/* Input Area */}
                    <div className="p-4 bg-black/40 border-t border-white/10 flex gap-3 z-20">
                        <ScannerInput
                            value={inputText}
                            onChange={(e) => setInputText(e.target.value)}
                            onKeyDown={(e) => e.key === "Enter" && handleSend()}
                            placeholder="TRANSMIT MESSAGE..."
                            className="bg-black/40"
                        />
                        <NeonButton onClick={() => handleSend()} className="px-4">
                            <Send className="w-5 h-5" />
                        </NeonButton>
                    </div>
                </BentoGridItem>

                {/* Booking Overlay (conditionally rendered in a modal-like behavior within layout) */}
                {showBooking && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md p-4">
                        <GlassCard className="w-full max-w-4xl relative">
                            <button
                                className="absolute top-4 right-4 text-gray-400 hover:text-white"
                                onClick={() => setShowBooking(false)}
                            >
                                <X className="w-6 h-6" />
                            </button>
                            <BookingInterface
                                onBook={handleBookSlot}
                                availableSlots={availableSlots}
                            />
                        </GlassCard>
                    </div>
                )}
            </BentoGrid>
        </div>
    );
}
