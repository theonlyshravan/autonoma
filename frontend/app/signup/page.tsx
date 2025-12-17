"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/app/contexts/AuthContext";
import { motion } from "framer-motion";
import { Scan, ShieldCheck, ArrowRight, User, Car } from "lucide-react";

export default function SignupPage() {
    const router = useRouter();
    const { login } = useAuth();
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");

    const [formData, setFormData] = useState({
        email: "",
        password: "",
        full_name: "",
        phone_number: "",
        vin: "",
        model: "",
        purchase_date: "", // Used for UI, year extracted for backend
    });

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSignup = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError("");

        try {
            // Extract year from purchase_date (YYYY-MM-DD)
            const year = formData.purchase_date ? new Date(formData.purchase_date).getFullYear() : new Date().getFullYear();

            const payload = {
                email: formData.email,
                password: formData.password,
                full_name: formData.full_name,
                phone_number: formData.phone_number,
                vin: formData.vin, // Mapping Vehicle Number to VIN
                model: formData.model,
                year: year,
                vehicle_type: "EV" // Defaulting to EV for now
            };

            const response = await fetch("http://localhost:8000/api/auth/register", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(payload),
            });

            if (!response.ok) {
                const errData = await response.json();
                throw new Error(errData.detail || "Registration failed");
            }

            const data = await response.json();
            login(data.access_token);
            // AuthContext will handle redirect
        } catch (err: any) {
            setError(err.message || "Registration failed. Please try again.");
            console.error(err);
            setLoading(false);
        }
    };

    return (
        <main className="min-h-screen flex items-center justify-center relative overflow-hidden bg-black text-foreground">
            {/* Background Decor */}
            <div className="absolute inset-0 z-0">
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-primary/10 blur-[120px] rounded-full opacity-30 animate-pulse" />
            </div>

            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
                className="z-10 w-full max-w-2xl p-4"
            >
                <Card className="border-primary/20 bg-black/80 backdrop-blur-xl relative overflow-hidden">
                    <CardHeader className="text-center space-y-4 pt-10">
                        <div className="mx-auto w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center border border-primary/50">
                            <ShieldCheck className="w-6 h-6 text-primary" />
                        </div>
                        <div>
                            <CardTitle className="text-2xl tracking-widest text-primary font-display">Register your Vehicle</CardTitle>
                        </div>
                    </CardHeader>
                    <CardContent className="space-y-6 pt-2">
                        <form onSubmit={handleSignup} className="space-y-8">

                            {/* User Details Section */}
                            <div className="space-y-4">
                                <div className="flex items-center gap-2 text-primary/70 pb-2 border-b border-white/10">
                                    <User className="w-4 h-4" />
                                    <span className="text-xs font-mono uppercase">User Credentials</span>
                                </div>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <label className="text-[10px] font-mono text-muted-foreground uppercase">Full Name</label>
                                        <Input
                                            name="full_name"
                                            placeholder="ex. Raja Sharma"
                                            className="border-white/10 focus-visible:ring-primary/50 bg-white/5"
                                            value={formData.full_name}
                                            onChange={handleChange}
                                            required
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-[10px] font-mono text-muted-foreground uppercase">Email Address</label>
                                        <Input
                                            name="email"
                                            type="email"
                                            placeholder="ex. raja@gmail.com"
                                            className="border-white/10 focus-visible:ring-primary/50 bg-white/5"
                                            value={formData.email}
                                            onChange={handleChange}
                                            required
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-[10px] font-mono text-muted-foreground uppercase">Phone Number</label>
                                        <Input
                                            name="phone_number"
                                            placeholder="+91 8546729978"
                                            className="border-white/10 focus-visible:ring-primary/50 bg-white/5"
                                            value={formData.phone_number}
                                            onChange={handleChange}
                                            required
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-[10px] font-mono text-muted-foreground uppercase">Password</label>
                                        <Input
                                            name="password"
                                            type="password"
                                            placeholder="••••••••"
                                            className="border-white/10 focus-visible:ring-primary/50 bg-white/5"
                                            value={formData.password}
                                            onChange={handleChange}
                                            required
                                        />
                                    </div>
                                </div>
                            </div>

                            {/* Vehicle Details Section */}
                            <div className="space-y-4">
                                <div className="flex items-center gap-2 text-primary/70 pb-2 border-b border-white/10">
                                    <Car className="w-4 h-4" />
                                    <span className="text-xs font-mono uppercase">Vehicle Details</span>
                                </div>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <label className="text-[10px] font-mono text-muted-foreground uppercase">Vehicle Number</label>
                                        <Input
                                            name="vin"
                                            placeholder="ex. OD 01 AP 6654"
                                            className="border-white/10 focus-visible:ring-primary/50 bg-white/5"
                                            value={formData.vin}
                                            onChange={handleChange}
                                            required
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-[10px] font-mono text-muted-foreground uppercase">Vehicle Model Name</label>
                                        <Input
                                            name="model"
                                            placeholder="ex. Mahindra Thar"
                                            className="border-white/10 focus-visible:ring-primary/50 bg-white/5"
                                            value={formData.model}
                                            onChange={handleChange}
                                            required
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-[10px] font-mono text-muted-foreground uppercase">Purchase Date</label>
                                        <Input
                                            name="purchase_date"
                                            type="date"
                                            className="border-white/10 focus-visible:ring-primary/50 bg-white/5 text-white/50" // muted style for date
                                            value={formData.purchase_date}
                                            onChange={handleChange}
                                            required
                                        />
                                    </div>
                                </div>
                            </div>

                            <Button
                                variant="cyber"
                                className="w-full h-12 text-base font-display tracking-widest hover:bg-primary/20 mt-4"
                                disabled={loading}
                                type="submit"
                            >
                                {loading ? "REGISTERING..." : "SIGN UP"}
                            </Button>

                            {error && (
                                <div className="flex items-center gap-2 text-destructive text-xs font-mono bg-destructive/10 p-2 rounded border border-destructive/20 justify-center">
                                    <ShieldCheck className="w-4 h-4" />
                                    {error}
                                </div>
                            )}
                        </form>

                        <div className="text-center pt-4 border-t border-white/5">
                            <button
                                onClick={() => router.push("/login")}
                                className="text-xs text-muted-foreground hover:text-white transition-colors font-mono tracking-widest"
                            >
                                ALREADY REGISTERED? RETURN TO LOGIN
                            </button>
                        </div>
                    </CardContent>
                </Card>
            </motion.div>
        </main>
    );
}
