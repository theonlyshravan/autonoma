"use client";

import { cn } from "@/lib/utils";
import React from "react";

interface ScannerInputProps extends React.InputHTMLAttributes<HTMLInputElement> {
    label?: string;
    icon?: React.ReactNode;
}

export function ScannerInput({ className, label, icon, ...props }: ScannerInputProps) {
    return (
        <div className="group relative w-full">
            {label && (
                <label className="block text-xs font-mono text-muted-foreground mb-1.5 uppercase tracking-widest pl-1">
                    {label}
                </label>
            )}
            <div className="relative flex items-center">
                <div className="absolute left-4 text-muted-foreground group-focus-within:text-neon-cyan transition-colors duration-300">
                    {icon}
                </div>

                <input
                    className={cn(
                        "w-full bg-input/30 border border-white/5 rounded-lg py-3 px-4 pl-12 text-foreground font-sans placeholder:text-muted-foreground/50 focus:outline-none focus:bg-input/50 transition-all duration-300",
                        className
                    )}
                    {...props}
                />

                {/* Scanner Line Animation */}
                <div className="absolute bottom-0 left-0 h-[2px] w-0 bg-neon-cyan group-focus-within:w-full transition-all duration-500 ease-out shadow-[0_0_10px_#00F0FF]" />

                {/* Active scan effect */}
                <div className="absolute bottom-0 left-0 w-full h-[1px] overflow-hidden opacity-0 group-focus-within:opacity-100 pointer-events-none">
                    <div className="w-[50%] h-full bg-gradient-to-r from-transparent via-neon-cyan to-transparent animate-scanline" />
                </div>
            </div>
        </div>
    );
}
