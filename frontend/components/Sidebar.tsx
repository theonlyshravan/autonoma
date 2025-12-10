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
    Activity // Icon for Actions
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

    return (
        <div className="flex flex-col h-full w-64 border-r border-white/10 bg-[#1c1d22] text-foreground">
            <div className="p-6 border-b border-white/10">
                <h1 className="text-2xl font-display font-bold text-foreground tracking-tighter">
                    AUTONOMA
                </h1>
                <p className="text-xs text-muted-foreground font-mono mt-1 tracking-widest text-primary">
                    SYSTEM V1.0 // {user?.role?.toUpperCase()}
                </p>
            </div>

            <nav className="flex-1 p-4 space-y-2">
                {activeGroup.map((item) => (
                    <Link key={item.href} href={item.href}>
                        <Button
                            variant="ghost"
                            className={cn(
                                "w-full justify-start transition-all duration-200",
                                pathname === item.href
                                    ? "bg-primary/10 text-primary border-r-2 border-primary rounded-none"
                                    : "text-muted-foreground hover:text-foreground hover:bg-white/5"
                            )}
                        >
                            <item.icon className="mr-2 h-4 w-4" />
                            {item.name}
                        </Button>
                    </Link>
                ))}
            </nav>

            <div className="p-4 border-t border-white/10">
                <Button
                    variant="outline"
                    className="w-full justify-start text-destructive hover:text-destructive hover:bg-destructive/10 border-destructive/20"
                    onClick={logout}
                >
                    <LogOut className="mr-2 h-4 w-4" />
                    Disconnect
                </Button>
            </div>
        </div>
    );
}
