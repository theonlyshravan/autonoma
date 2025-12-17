"use client";

import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";
import React, { useState } from "react";

interface NeonButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
    variant?: "primary" | "secondary" | "danger";
    children: React.ReactNode;
}

export function NeonButton({ className, variant = "primary", children, onClick, ...props }: NeonButtonProps) {
    const [clickPos, setClickPos] = useState({ x: 0, y: 0 });
    const [isBursting, setIsBursting] = useState(false);

    const handleClick = (e: React.MouseEvent<HTMLButtonElement>) => {
        const rect = e.currentTarget.getBoundingClientRect();
        setClickPos({ x: e.clientX - rect.left, y: e.clientY - rect.top });
        setIsBursting(true);
        setTimeout(() => setIsBursting(false), 500);

        if (onClick) onClick(e);
    };

    const variantStyles = {
        primary: "border-neon-cyan text-neon-cyan shadow-[0_0_10px_rgba(0,240,255,0.3)] hover:shadow-[0_0_20px_rgba(0,240,255,0.6)] hover:bg-neon-cyan/10",
        secondary: "border-plasma-magenta text-plasma-magenta shadow-[0_0_10px_rgba(255,0,153,0.3)] hover:shadow-[0_0_20px_rgba(255,0,153,0.6)] hover:bg-plasma-magenta/10",
        danger: "border-destructive text-destructive shadow-[0_0_10px_rgba(255,51,51,0.3)] hover:shadow-[0_0_20px_rgba(255,51,51,0.6)] hover:bg-destructive/10"
    };

    return (
        <button
            className={cn(
                "relative overflow-hidden px-8 py-3 rounded-xl border font-display font-bold tracking-wider uppercase transition-all duration-300",
                variantStyles[variant],
                className
            )}
            onClick={handleClick}
            {...props}
        >
            <span className="relative z-10 flex items-center gap-2">
                {children}
            </span>

            {/* Click Burst Effect */}
            <AnimatePresence>
                {isBursting && (
                    <motion.span
                        className="absolute rounded-full bg-white opacity-50"
                        initial={{ width: 0, height: 0, x: clickPos.x, y: clickPos.y, opacity: 0.5 }}
                        animate={{ width: 500, height: 500, x: clickPos.x - 250, y: clickPos.y - 250, opacity: 0 }}
                        exit={{ opacity: 0 }}
                        transition={{ duration: 0.4 }}
                    />
                )}
            </AnimatePresence>
        </button>
    );
}
