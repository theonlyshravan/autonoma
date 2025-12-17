'use client';

import Link from 'next/link';
import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import axios from 'axios';
import { motion, AnimatePresence } from 'framer-motion';
import { GlassCard } from '@/components/ui/GlassCard';
import { ScannerInput } from '@/components/ui/ScannerInput';
import { NeonButton } from '@/components/ui/NeonButton';
import { Lock, Mail, ChevronRight, Fingerprint, Globe } from 'lucide-react';
import { cn } from '@/lib/utils';

export default function LoginPage() {
    const [loading, setLoading] = useState(true);
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [isAuthenticating, setIsAuthenticating] = useState(false);
    const { login } = useAuth();

    // Liquid Light Preloader Logic
    useEffect(() => {
        const timer = setTimeout(() => setLoading(false), 2500);
        return () => clearTimeout(timer);
    }, []);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setIsAuthenticating(true);

        try {
            const response = await axios.post('http://localhost:8000/api/auth/login',
                new URLSearchParams({
                    'username': email,
                    'password': password
                }), {
                headers: { 'Content-Type': 'application/x-www-form-urlencoded' }
            });

            const { access_token } = response.data;

            // Success Animation Delay
            setTimeout(() => {
                login(access_token);
            }, 1000);

        } catch (err: any) {
            console.error(err);
            setIsAuthenticating(false);
            setError('ACCESS DENIED // INVALID CREDENTIALS');
        }
    };

    // Preloader Component
    if (loading) {
        return (
            <div className="fixed inset-0 bg-deep-void flex items-center justify-center overflow-hidden z-50">
                <div className="relative flex flex-col items-center">
                    {/* Falling Drop */}
                    <motion.div
                        initial={{ y: -500, opacity: 0 }}
                        animate={{ y: 0, opacity: 1 }}
                        transition={{ duration: 1, ease: "easeIn" }}
                        className="w-1 h-10 bg-neon-cyan rounded-full box-shadow-neon"
                    />

                    {/* Ripple Effect */}
                    <motion.div
                        initial={{ scale: 0, opacity: 1, borderColor: "transparent" }}
                        animate={{ scale: [1, 10, 20], opacity: [1, 0.5, 0], borderColor: ["#00F0FF", "#FF0099", "transparent"] }}
                        transition={{ delay: 1, duration: 1.5, ease: "easeOut" }}
                        className="absolute top-10 border-2 rounded-full w-4 h-4"
                    />

                    {/* Decrypting Text */}
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 1.2 }}
                        className="mt-12 text-neon-cyan font-mono tracking-[0.5em] text-xs animate-pulse"
                    >
                        INITIALIZING SYSTEM...
                    </motion.div>
                </div>
            </div>
        );
    }

    return (
        <div className="relative min-h-screen flex items-center justify-center bg-background overflow-hidden text-foreground">
            {/* Background Effects */}
            <div className="absolute inset-0 z-0">
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-neon-cyan/5 rounded-full blur-[100px] opacity-20 animate-pulse-slow" />
            </div>

            <AnimatePresence>
                {!isAuthenticating ? (
                    <GlassCard className="w-full max-w-lg p-10 z-10 border-none bg-black/40">
                        {/* Header: Gyroscopic Core */}
                        <div className="flex flex-col items-center mb-10 relative">
                            <div className="relative w-24 h-24 mb-6">
                                <motion.div
                                    animate={{ rotate: 360 }}
                                    transition={{ duration: 10, repeat: Infinity, ease: "linear" }}
                                    className="absolute inset-0 border border-neon-cyan/30 rounded-full border-t-neon-cyan"
                                />
                                <motion.div
                                    animate={{ rotate: -360 }}
                                    transition={{ duration: 7, repeat: Infinity, ease: "linear" }}
                                    className="absolute inset-2 border border-plasma-magenta/30 rounded-full border-b-plasma-magenta"
                                />
                                <div className="absolute inset-0 flex items-center justify-center">
                                    <Fingerprint className="w-8 h-8 text-white/80" />
                                </div>
                            </div>

                            <h2 className="text-3xl font-display font-bold tracking-widest text-center text-transparent bg-clip-text bg-gradient-to-r from-neon-cyan to-white">
                                AUTONOMA
                            </h2>
                            <p className="text-[10px] font-mono text-neon-cyan/60 tracking-[0.3em] mt-2">
                                SECURE IDENTITY GATEWAY
                            </p>
                        </div>

                        {error && (
                            <motion.div
                                initial={{ opacity: 0, x: -20 }}
                                animate={{ opacity: 1, x: 0 }}
                                className="mb-6 p-3 bg-destructive/10 border border-destructive/50 text-destructive text-xs font-mono tracking-wide flex items-center gap-2"
                            >
                                <Lock className="w-3 h-3" />
                                {error}
                            </motion.div>
                        )}

                        <form onSubmit={handleSubmit} className="space-y-6">
                            <ScannerInput
                                type="email"
                                label="Email"
                                icon={<Mail className="w-4 h-4" />}
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                placeholder="ENTER ID..."
                                required
                            />

                            <ScannerInput
                                type="password"
                                label="Password"
                                icon={<Lock className="w-4 h-4" />}
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                placeholder="ENTER PASSWORD..."
                                required
                            />

                            <NeonButton
                                type="submit"
                                className="w-full mt-4 group flex items-center justify-center"
                            >
                                <span className="mr-2">LOG IN</span>
                                <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                            </NeonButton>

                            <div className="mt-4 flex justify-center">
                                <Link href="/signup" className="w-full">
                                    <button
                                        type="button"
                                        className="w-full py-3 px-4 bg-transparent border border-white/10 hover:border-neon-cyan/50 text-neon-cyan/80 hover:text-neon-cyan text-xs font-mono tracking-widest rounded transition-all duration-300 uppercase flex items-center justify-center gap-2 group/signup"
                                    >
                                        <Globe className="w-3 h-3 group-hover/signup:animate-pulse" />
                                        <span>SIGN UP</span>
                                    </button>
                                </Link>
                            </div>
                        </form>

                        {/* Footer Credentials */}
                        <div className="mt-8 pt-6 border-t border-white/5 text-center">
                            <p className="text-[10px] text-muted-foreground font-mono mb-2 uppercase tracking-wide">Authorized Personnel Only</p>
                            <div className="grid grid-cols-1 gap-2 text-[10px] text-gray-500 font-mono text-left pl-4 border-l border-white/5 mx-auto max-w-xs">
                                <span>USER: user@demo.com / pass123</span>
                                <span>SERV: service@ey.com / ey_secure</span>
                                <span>MFG: admin@oem.com / admin_pass</span>
                            </div>
                        </div>
                    </GlassCard>
                ) : (
                    // Success Transition (Blast Doors/Zoom)
                    <motion.div
                        initial={{ opacity: 0, scale: 0.8 }}
                        animate={{ opacity: 1, scale: 20 }}
                        transition={{ duration: 0.8, ease: "easeInOut" }}
                        className="fixed inset-0 z-50 flex items-center justify-center bg-neon-cyan mix-blend-screen pointer-events-none"
                    >
                        <div className="text-black text-xs font-bold font-mono">ACCESS GRANTED</div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}
