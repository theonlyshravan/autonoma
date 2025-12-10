"use client";

import { useState, useEffect, useRef } from "react";
import { Send, User, Bot, X } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useAuth } from "@/app/contexts/AuthContext";
import { BookingInterface } from "@/components/BookingInterface";

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
            text: `Hello ${user?.name || 'Customer'}. I am monitoring your vehicle (VIN: EV-8823-X). Everything looks good right now, but I'm here if you need anything.`,
            timestamp: new Date()
        }
    ]);
    const [inputText, setInputText] = useState("");
    const [isTyping, setIsTyping] = useState(false);
    const [showBooking, setShowBooking] = useState(false);
    const [availableSlots, setAvailableSlots] = useState<string[]>([]);

    const scrollRef = useRef<HTMLDivElement>(null);

    // Auto-scroll to bottom
    useEffect(() => {
        if (scrollRef.current) {
            scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
        }
    }, [messages]);

    // Simulate incoming alert from backend (Mock)
    useEffect(() => {
        const timer = setTimeout(() => {
            const warningMsg = "⚠️ ALERT: Sensors indicate Battery Cell #4 temperature is rising (62°C). This exceeds the safety threshold. Coolant pump efficiency is dropping.";
            // Only add if not already there to prevent dupes in strict mode
            setMessages(prev => {
                if (prev.some(m => m.text === warningMsg)) return prev;
                return [...prev, {
                    id: Date.now().toString(),
                    sender: "bot",
                    text: warningMsg,
                    timestamp: new Date()
                }];
            });

            setTimeout(() => {
                addMessage("bot", "Based on my analysis, you should book a service appointment immediately to prevent thermal runaway. Shall I look for a slot?");
            }, 1500);
        }, 5000);
        return () => clearTimeout(timer);
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
                    history: messages.map(m => ({ sender: m.sender, content: m.text }))
                })
            });
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
        handleSend(`Book the slot for ${dateStr} at ${slot}`);
    };

    return (
        <div className="h-[calc(100vh-6rem)] flex flex-col gap-4 p-4 md:p-8 max-w-5xl mx-auto w-full relative">
            <header className="mb-2">
                <h1 className="text-3xl font-display font-bold text-foreground">
                    AUTONOMA <span className="text-primary">ASSISTANT</span>
                </h1>
                <p className="text-muted-foreground">AI-Powered Vehicle Support • VIN: EV-8823-X</p>
            </header>

            <div className="flex-1 relative min-h-0">
                <Card className="h-full overflow-hidden flex flex-col bg-card/80 backdrop-blur-md border border-white/5 shadow-2xl relative">
                    {/* Chat Area */}
                    <div
                        ref={scrollRef}
                        className="flex-1 overflow-y-auto p-4 space-y-4 scroll-smooth"
                    >
                        {messages.map((msg) => (
                            <div
                                key={msg.id}
                                className={`flex ${msg.sender === "user" ? "justify-end" : "justify-start"}`}
                            >
                                <div className={`
                                    max-w-[80%] p-4 rounded-2xl text-sm leading-relaxed
                                    ${msg.sender === "user"
                                        ? "bg-primary text-primary-foreground rounded-br-none"
                                        : "bg-muted/30 text-foreground border border-white/5 rounded-bl-none"}
                                `}>
                                    {msg.text}
                                </div>
                            </div>
                        ))}

                        {isTyping && (
                            <div className="flex justify-start">
                                <div className="bg-muted/30 p-4 rounded-2xl rounded-bl-none flex gap-2 items-center">
                                    <span className="w-2 h-2 bg-primary animate-bounce" />
                                    <span className="w-2 h-2 bg-primary animate-bounce [animation-delay:-0.15s]" />
                                    <span className="w-2 h-2 bg-primary animate-bounce [animation-delay:-0.3s]" />
                                </div>
                            </div>
                        )}

                        <div className="h-4" /> {/* spacer */}
                    </div>

                    {/* Input Area */}
                    <div className="p-4 bg-background/50 border-t border-white/5 flex gap-3">
                        <Input
                            value={inputText}
                            onChange={(e) => setInputText(e.target.value)}
                            onKeyDown={(e) => e.key === "Enter" && handleSend()}
                            placeholder="Type your message..."
                            className="flex-1 bg-black/20 border-white/10 focus-visible:ring-primary"
                        />
                        <Button onClick={() => handleSend()} size="icon" className="bg-primary hover:bg-primary/90 text-white">
                            <Send className="w-5 h-5" />
                        </Button>
                    </div>
                </Card>

                {/* Booking Interface Overlay */}
                {showBooking && (
                    <div className="absolute inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-sm animate-in fade-in duration-300 p-4">
                        <div className="relative w-full max-w-4xl">
                            <Button
                                size="icon"
                                variant="destructive"
                                className="absolute -top-4 -right-4 z-50 rounded-full w-8 h-8 shadow-lg"
                                onClick={() => setShowBooking(false)}
                            >
                                <X className="w-4 h-4" />
                            </Button>
                            <BookingInterface
                                onBook={handleBookSlot}
                                availableSlots={availableSlots}
                            />
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
