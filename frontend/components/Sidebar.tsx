"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import {
    LayoutDashboard,
    Wrench,
    Factory,
    Settings,
    LogOut,
    ShieldCheck,
    Activity, // Icon for Actions
    Box
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/app/contexts/AuthContext";

const navItems = {
    customer: [
        { name: "My Vehicle", href: "/dashboard/customer", icon: LayoutDashboard },
        { name: "Settings", href: "/dashboard/customer/settings", icon: Settings },
    ],
    service: [
        { name: "Service Queue", href: "/dashboard/service", icon: Wrench },
        { name: "Actons & Visuals", href: "/dashboard/actions", icon: Activity },
    ],
    manufacturer: [
        { name: "Insights", href: "/dashboard/manufacturing", icon: Factory },
        { name: "Actions & Visuals", href: "/dashboard/actions", icon: Activity },
    ]
};

export function Sidebar() {
    const pathname = usePathname();
    const { user, logout } = useAuth();

    // Default to 'customer' if role not found, or handle generic
    const roleKey = (user?.role || "customer") as keyof typeof navItems;
    const activeGroup = navItems[roleKey] || navItems.customer;

    // Assuming isCollapsed is managed elsewhere or is always false for this context
    const isCollapsed = false;

    return (
        <div className="flex flex-col h-full w-64 border-r border-white/10 bg-[#050505]/80 backdrop-blur-md text-foreground relative overflow-hidden">
            {/* Ambient Background Glow */}
            <div className="absolute -top-20 -left-20 w-64 h-64 bg-neon-cyan/5 rounded-full blur-3xl pointer-events-none" />

            <div className="p-4 flex items-center gap-3 mb-8">
                <Link href="/dashboard" className="flex items-center gap-2 group">
                    <div className="relative w-10 h-10 flex items-center justify-center bg-white/5 rounded-xl border border-white/10 group-hover:border-neon-cyan/50 group-hover:shadow-[0_0_15px_rgba(0,240,255,0.3)] transition-all duration-300">
                        <Box className="w-6 h-6 text-neon-cyan group-hover:scale-110 transition-transform" />
                    </div>
                    <div className={`transition-all duration-300 ${isCollapsed ? "opacity-0 w-0 overflow-hidden" : "opacity-100 w-auto"}`}>
                        <h1 className="font-display font-bold text-xl tracking-wider text-white">
                            AUTONOMA
                        </h1>
                    </div>
                </Link>
            </div>

            <nav className="flex-1 p-4 space-y-2 relative z-10">
                {activeGroup.map((item) => {
                    const isActive = pathname === item.href;
                    return (
                        <Link key={item.href} href={item.href}>
                            <Button
                                variant="ghost"
                                className={cn(
                                    "w-full justify-start transition-all duration-300 font-sans tracking-wide",
                                    isActive
                                        ? "bg-neon-cyan/10 text-neon-cyan border-r-2 border-neon-cyan rounded-none shadow-[0_0_15px_rgba(0,240,255,0.2)]"
                                        : "text-muted-foreground hover:text-white hover:bg-white/5 hover:pl-5"
                                )}
                            >
                                <item.icon className={cn("mr-3 h-4 w-4", isActive && "drop-shadow-[0_0_5px_rgba(0,240,255,0.8)]")} />
                                {item.name}
                            </Button>
                        </Link>
                    );
                })}
            </nav>

            <div className="p-4 border-t border-white/10 relative z-10">
                <Button
                    variant="outline"
                    className="w-full justify-start text-destructive hover:text-red-400 hover:bg-destructive/10 border-destructive/20 hover:border-destructive/50 transition-all duration-300 font-mono text-xs tracking-widest uppercase"
                    onClick={logout}
                >
                    <LogOut className="mr-2 h-4 w-4" />
                    Disconnect
                </Button>
            </div>
        </div>
    );
}
