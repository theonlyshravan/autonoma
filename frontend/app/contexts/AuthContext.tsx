'use client';

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import axios from 'axios';
import { jwtDecode } from 'jwt-decode';

interface User {
    id: string;
    role: 'customer' | 'service' | 'manufacturer';
    exp: number;
    name?: string;
}

interface AuthContextType {
    user: User | null;
    login: (token: string) => void;
    logout: () => void;
    loading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
    const [user, setUser] = useState<User | null>(null);
    const [loading, setLoading] = useState(true);
    const router = useRouter();
    const pathname = usePathname();

    useEffect(() => {
        const token = localStorage.getItem('token');
        if (token) {
            try {
                const decoded: any = jwtDecode(token); // Cast to any to access properties
                // Check expiry
                if (decoded.exp * 1000 < Date.now()) {
                    logout();
                } else {
                    console.log("Token decoded:", decoded);
                    // Map properties safely. Ensure your backend returns "sub" and "role"
                    setUser({
                        id: decoded.sub,
                        role: decoded.role,
                        exp: decoded.exp,
                        name: decoded.name
                    });
                }
            } catch (error) {
                console.error("Invalid token:", error);
                logout();
            }
        }
        setLoading(false);
    }, []);

    const login = (token: string) => {
        localStorage.setItem('token', token);
        const decoded: any = jwtDecode(token);
        setUser({
            id: decoded.sub,
            role: decoded.role,
            exp: decoded.exp,
            name: decoded.name
        });

        // Redirect based on role
        if (decoded.role === 'customer') router.push('/dashboard/customer');
        else if (decoded.role === 'service') router.push('/dashboard/service');
        else if (decoded.role === 'manufacturer') router.push('/dashboard/manufacturing');
        else router.push('/');
    };

    const logout = () => {
        localStorage.removeItem('token');
        setUser(null);
        router.push('/login');
    };

    return (
        <AuthContext.Provider value={{ user, login, logout, loading }}>
            {children}
        </AuthContext.Provider>
    );
}

export function useAuth() {
    const context = useContext(AuthContext);
    if (context === undefined) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
}
