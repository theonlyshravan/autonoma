"use client";

import { cn } from "@/lib/utils";
import React from "react";

interface BentoGridProps {
    className?: string;
    children: React.ReactNode;
}

export function BentoGrid({ className, children }: BentoGridProps) {
    return (
        <div
            className={cn(
                "grid md:auto-rows-[18rem] grid-cols-1 md:grid-cols-3 gap-6 max-w-7xl mx-auto pb-20",
                className
            )}
        >
            {children}
        </div>
    );
}

interface BentoGridItemProps {
    className?: string;
    title?: string | React.ReactNode;
    description?: string | React.ReactNode;
    header?: React.ReactNode;
    icon?: React.ReactNode;
    children?: React.ReactNode;
    colSpan?: 1 | 2 | 3;
}

export function BentoGridItem({
    className,
    title,
    description,
    header,
    icon,
    children,
    colSpan = 1,
}: BentoGridItemProps) {
    return (
        <div
            className={cn(
                "row-span-1 rounded-xl group/bento hover:shadow-xl transition duration-200 shadow-input dark:shadow-none p-4 dark:bg-black/20 border-white/10 bg-white border justify-between flex flex-col space-y-4 glass-panel",
                colSpan === 2 ? "md:col-span-2" : colSpan === 3 ? "md:col-span-3" : "md:col-span-1",
                className
            )}
        >
            {header}
            <div className="group-hover/bento:translate-x-2 transition duration-200">
                {icon && <div className="mb-2 text-neon-cyan">{icon}</div>}
                {title && (
                    <div className="font-display font-bold text-white mb-1 mt-2 text-lg uppercase tracking-wider">
                        {title}
                    </div>
                )}
                {description && (
                    <div className="font-sans font-normal text-muted-foreground text-xs leading-5">
                        {description}
                    </div>
                )}
                {children}
            </div>
        </div>
    );
}
