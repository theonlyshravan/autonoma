"use client";

import { useEffect, useState } from "react";
import { Card } from "@/components/ui/card";
import { Activity, Brain, Database, MessageSquare, Wrench, ShieldAlert } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

export function AgentFlowVisualizer() {
    const [activeNode, setActiveNode] = useState<string>("data");
    const [packets, setPackets] = useState<{ id: number; from: string; to: string }[]>([]);

    useEffect(() => {
        // Simulate Agent Flow loop
        const flow = ["data", "master", "diagnosis", "master", "action"];
        let index = 0;

        const interval = setInterval(() => {
            setActiveNode(flow[index]);

            // Generate visual packet
            const nextIndex = (index + 1) % flow.length;
            const newPacket = { id: Date.now(), from: flow[index], to: flow[nextIndex] };
            setPackets(prev => [...prev, newPacket].slice(-5)); // Keep last 5

            index = nextIndex;
        }, 1500);

        return () => clearInterval(interval);
    }, []);

    const nodes = [
        { id: "data", label: "Data Agent", icon: Database, x: 10, y: 50, color: "text-blue-400" },
        { id: "master", label: "Master Agent", icon: Brain, x: 50, y: 50, color: "text-primary" },
        { id: "diagnosis", label: "Diagnosis Agent", icon: ShieldAlert, x: 50, y: 10, color: "text-yellow-400" },
        { id: "action", label: "Service/Engagement", icon: Wrench, x: 90, y: 50, color: "text-green-400" },
    ];

    return (
        <Card className="h-[600px] bg-black/40 border-white/10 relative overflow-hidden backdrop-blur-xl p-8">
            <h2 className="text-xl font-display font-bold text-foreground mb-4 flex items-center gap-2">
                <Activity className="w-5 h-5 text-primary" />
                LIVE_AGENT_NETWORK_VISUALIZER
            </h2>

            <div className="absolute inset-0 top-16">
                {/* Connection Lines */}
                <svg className="absolute inset-0 w-full h-full pointer-events-none stroke-white/20" strokeWidth="2">
                    <line x1="10%" y1="50%" x2="50%" y2="50%" /> {/* Data -> Master */}
                    <line x1="50%" y1="50%" x2="50%" y2="10%" /> {/* Master -> Diagnosis */}
                    <line x1="50%" y1="50%" x2="90%" y2="50%" /> {/* Master -> Action */}
                </svg>

                {/* Nodes */}
                {nodes.map(node => (
                    <div
                        key={node.id}
                        className={`absolute -translate-x-1/2 -translate-y-1/2 flex flex-col items-center gap-2 transition-all duration-500
                            ${activeNode === node.id ? "scale-110 opacity-100" : "scale-100 opacity-60"}
                        `}
                        style={{ left: `${node.x}%`, top: `${node.y}%` }}
                    >
                        <div className={`
                             w-16 h-16 rounded-full bg-black/50 border-2 flex items-center justify-center
                             ${activeNode === node.id ? "border-primary shadow-[0_0_30px_rgba(230,40,21,0.5)]" : "border-white/20"}
                         `}>
                            <node.icon className={`w-8 h-8 ${node.color}`} />
                        </div>
                        <div className="bg-black/80 px-3 py-1 rounded text-xs border border-white/10 font-mono">
                            {node.label}
                        </div>
                        {activeNode === node.id && (
                            <div className="text-[10px] text-primary animate-pulse">PROCESSING...</div>
                        )}
                    </div>
                ))}

                {/* Animated Packets */}
                <AnimatePresence>
                    {packets.map(packet => {
                        const startNode = nodes.find(n => n.id === packet.from);
                        const endNode = nodes.find(n => n.id === packet.to);
                        if (!startNode || !endNode) return null;

                        return (
                            <motion.div
                                key={packet.id}
                                initial={{ left: `${startNode.x}%`, top: `${startNode.y}%`, opacity: 1 }}
                                animate={{ left: `${endNode.x}%`, top: `${endNode.y}%`, opacity: 0 }}
                                transition={{ duration: 1.5, ease: "linear" }}
                                className="absolute w-3 h-3 bg-primary rounded-full shadow-lg z-10"
                            />
                        );
                    })}
                </AnimatePresence>
            </div>

            <div className="absolute bottom-4 left-4 p-4 bg-black/50 border border-white/10 rounded-lg max-w-sm">
                <p className="font-mono text-xs text-muted-foreground mb-1">SYSTEM_LOG &gt; STREAM</p>
                <div className="text-sm font-mono text-green-400">
                    {`[${new Date().toLocaleTimeString()}] AGENT_${activeNode.toUpperCase()} ACTIVE`}
                </div>
            </div>
        </Card>
    );
}
