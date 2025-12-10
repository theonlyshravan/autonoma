"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/app/contexts/AuthContext";
import { motion } from "framer-motion";
import { Scan, ShieldAlert } from "lucide-react";

export default function LoginPage() {
  const router = useRouter();
  const { login } = useAuth();
  const [loading, setLoading] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const formData = new FormData();
      formData.append("username", email);
      formData.append("password", password);

      const response = await fetch("http://localhost:8000/api/auth/login", {
        method: "POST",
        body: formData,
      });

      if (!response.ok) {
        throw new Error("Invalid credentials");
      }

      const data = await response.json();
      login(data.access_token);

      // Redirect is handled in AuthContext but we can default here just in case async takes time
      // The context will redirect based on role
    } catch (err) {
      setError("Authentication failed. Please check your credentials.");
      console.error(err);
      setLoading(false);
    }
  };

  return (
    <main className="min-h-screen flex items-center justify-center relative overflow-hidden">
      {/* Background Decor */}
      <div className="absolute inset-0 z-0">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-primary/20 blur-[100px] rounded-full opacity-20 animate-pulse" />
      </div>

      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5 }}
        className="z-10 w-full max-w-md p-4"
      >
        <Card className="border-primary/20 bg-black/60 backdrop-blur-xl relative">
          {/* Scanning Line Animation */}
          {loading && (
            <motion.div
              className="absolute top-0 left-0 w-full h-[2px] bg-primary shadow-[0_0_20px_rgba(0,240,255,0.8)] z-50"
              animate={{ top: ["0%", "100%", "0%"] }}
              transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
            />
          )}

          <CardHeader className="text-center space-y-4 pt-10">
            <div className="mx-auto w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center border border-primary/50 relative">
              <Scan className="w-8 h-8 text-primary animate-pulse" />
              <div className="absolute inset-0 border border-primary/30 rounded-full animate-spin-slow" style={{ borderTopColor: 'transparent', animationDuration: '3s' }} />
            </div>
            <div>
              <CardTitle className="text-2xl tracking-widest text-primary">IDENTITY_VERIFICATION</CardTitle>
              <p className="text-xs text-muted-foreground uppercase tracking-[0.2em] mt-2">Autonoma Secure Gateway</p>
            </div>
          </CardHeader>
          <CardContent className="space-y-6 pt-6">
            <form onSubmit={handleLogin} className="space-y-4">
              <div className="space-y-2">
                <label className="text-xs font-mono text-primary/70 uppercase">/ User_ID</label>
                <Input
                  placeholder="Enter Email"
                  className="border-primary/20 focus-visible:ring-primary/50 bg-black/50"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>
              <div className="space-y-2">
                <label className="text-xs font-mono text-primary/70 uppercase">/ Access_Key</label>
                <Input
                  type="password"
                  placeholder="••••••••"
                  className="border-primary/20 focus-visible:ring-primary/50 bg-black/50"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
              </div>

              {error && (
                <div className="flex items-center gap-2 text-destructive text-xs font-mono bg-destructive/10 p-2 rounded border border-destructive/20">
                  <ShieldAlert className="w-4 h-4" />
                  {error}
                </div>
              )}

              <Button
                variant="cyber"
                className="w-full h-12 mt-4 text-lg font-display tracking-widest hover:bg-primary/20"
                disabled={loading}
                type="submit"
              >
                {loading ? "AUTHENTICATING..." : "INITIATE SESSION"}
              </Button>
            </form>

            <div className="text-center">
              <p className="text-[10px] text-muted-foreground font-mono">
                SECURED BY UEBA PROTOCOLS v4.0
              </p>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </main>
  );
}
