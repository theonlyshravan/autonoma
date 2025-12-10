"use client";

import { AgentFlowVisualizer } from "@/components/AgentFlowVisualizer";
import { Badge } from "@/components/ui/badge";

export default function ActionsPage() {
    return (
        <div className="h-[calc(100vh-6rem)] flex flex-col p-6 gap-6">
            <header className="flex justify-between items-center">
                <div>
                    <h1 className="text-3xl font-display font-bold text-foreground">SYSTEM_ACTIONS <span className="text-primary">// VISUALIZER</span></h1>
                    <p className="text-muted-foreground">Real-time view of agent collaboration and data flow.</p>
                </div>
                <div className="flex gap-2">
                    <Badge variant="outline" className="border-green-500 text-green-500 hover:bg-green-500/10 transition-colors cursor-default animate-pulse">
                        <span className="relative flex h-2 w-2 mr-2">
                            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                            <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500"></span>
                        </span>
                        LIVE_NETWORK
                    </Badge>
                </div>
            </header>

            <div className="flex-1 overflow-hidden flex flex-col gap-6">
                <AgentFlowVisualizer />

                {/* Additional Stats Row */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div className="p-4 bg-card/50 border border-white/10 rounded-lg">
                        <div className="text-xs text-muted-foreground mb-1">DATA_PROCESSED</div>
                        <div className="text-2xl font-mono text-foreground">14.2 GB/s</div>
                    </div>
                    <div className="p-4 bg-card/50 border border-white/10 rounded-lg">
                        <div className="text-xs text-muted-foreground mb-1">ACTIVE_AGENTS</div>
                        <div className="text-2xl font-mono text-foreground">06</div>
                    </div>
                    <div className="p-4 bg-card/50 border border-white/10 rounded-lg">
                        <div className="text-xs text-muted-foreground mb-1">DECISION_LATENCY</div>
                        <div className="text-2xl font-mono text-primary">42ms</div>
                    </div>
                </div>
            </div>
        </div>
    );
}
