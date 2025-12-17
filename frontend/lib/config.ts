
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "https://autonoma.onrender.com";

// Remove trailing slash if present
export const API_URL = API_BASE_URL.replace(/\/$/, "");

// Derive WebSocket URL (replace http/https with ws/wss)
export const WS_URL = API_URL.replace(/^http/, "ws") + "/ws/telemetry";
