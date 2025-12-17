import { GlassCard } from "@/components/ui/GlassCard";
import { CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Bell, AlertTriangle, CalendarCheck } from "lucide-react";

type Notification = {
    id: string;
    type: "ALERT" | "BOOKING";
    message: string;
    timestamp: string;
};

export function NotificationSidebar({ notifications }: { notifications: Notification[] }) {
    return (
        <GlassCard className="h-full flex flex-col border-none bg-black/20" hoverEffect={false}>
            <CardHeader className="pb-2">
                <CardTitle className="flex items-center gap-2 font-display tracking-wider text-sm text-neon-cyan">
                    <Bell className="w-4 h-4 drop-shadow-[0_0_5px_rgba(0,240,255,0.8)]" />
                    LIVE_FEED // STREAM
                </CardTitle>
            </CardHeader>
            <CardContent className="flex-1 overflow-y-auto space-y-3 p-4 pt-0 custom-scrollbar">
                {notifications.map((notif) => (
                    <div
                        key={notif.id}
                        className="p-3 bg-white/5 border border-white/5 rounded-r-lg border-l-2 border-l-neon-cyan text-sm relative pl-4 hover:bg-white/10 transition-colors"
                    >
                        <div className="absolute right-2 top-2 opacity-50">
                            {notif.type === "ALERT" ? (
                                <AlertTriangle className="w-3 h-3 text-plasma-magenta" />
                            ) : (
                                <CalendarCheck className="w-3 h-3 text-acid-lime" />
                            )}
                        </div>
                        <p className="text-gray-300 leading-snug font-sans text-xs">{notif.message}</p>
                        <p className="text-[10px] text-muted-foreground mt-1 font-mono tracking-wider opacity-60 uppercase">{notif.timestamp}</p>
                    </div>
                ))}
            </CardContent>
        </GlassCard>
    );
}
