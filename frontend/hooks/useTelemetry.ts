import { useEffect, useState, useRef } from 'react';
import { TelemetryData, AgentAlert, ChatMessage } from '../types';
import { WS_URL } from '@/lib/config';

export function useTelemetry() {
    const [telemetry, setTelemetry] = useState<TelemetryData | null>(null);
    const [telemetryHistory, setTelemetryHistory] = useState<TelemetryData[]>([]);
    const [alert, setAlert] = useState<AgentAlert["data"] | null>(null);
    const [messages, setMessages] = useState<ChatMessage["data"][]>([]);
    const [isConnected, setIsConnected] = useState(false);

    const ws = useRef<WebSocket | null>(null);

    useEffect(() => {
        // Connect to Backend WS
        ws.current = new WebSocket(WS_URL);

        ws.current.onopen = () => {
            console.log('Connected to Telemetry Stream');
            setIsConnected(true);
        };

        ws.current.onclose = () => {
            console.log('Disconnected from Telemetry Stream');
            setIsConnected(false);
        };

        ws.current.onmessage = (event) => {
            try {
                const payload = JSON.parse(event.data);

                if (payload.type === 'telemetry') {
                    setTelemetry(payload.data);
                    setTelemetryHistory(prev => {
                        const newHistory = [...prev, { ...payload.data, timestamp: new Date().toISOString() }];
                        if (newHistory.length > 50) return newHistory.slice(1); // Keep last 50
                        return newHistory;
                    });
                } else if (payload.type === 'alert') {
                    setAlert(payload.data);
                } else if (payload.type === 'chat') {
                    setMessages(prev => [...prev, payload.data]);
                }
            } catch (err) {
                console.error("Error parsing WS message:", err);
            }
        };

        return () => {
            ws.current?.close();
        };
    }, []);

    return { telemetry, telemetryHistory, alert, messages, isConnected };
}
