"use client";

import { useAuth } from "@/app/contexts/AuthContext";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { User, Phone, Mail, Car, Calendar, ShieldCheck } from "lucide-react";
import { Separator } from "@/components/ui/separator";

export default function CustomerSettingsPage() {
    const { user } = useAuth();

    // Mock user details if not fully present in auth context
    const userDetails = {
        name: user?.name || "The Only User",
        phone: "+91 98765 43210",
        email: user?.email || "user@example.com",
        vehicleName: "Tesla Model S Plaid",
        vehicleNumber: "EV-8823-X",
        issuedDate: "2024-08-15"
    };

    return (
        <div className="h-full p-8 flex flex-col gap-6 max-w-4xl mx-auto w-full">
            <header>
                <h1 className="text-3xl font-display font-bold text-foreground">ACCOUNT_SETTINGS</h1>
                <p className="text-muted-foreground">Manage your profile and vehicle details.</p>
            </header>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Personal Information */}
                <Card className="bg-card/50 backdrop-blur-sm border-white/10">
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2 text-primary">
                            <User className="w-5 h-5" />
                            PERSONAL_INFO
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="flex items-center gap-3 p-3 bg-black/20 rounded border border-white/5">
                            <User className="w-4 h-4 text-muted-foreground" />
                            <div>
                                <p className="text-xs text-muted-foreground">FULL NAME</p>
                                <p className="text-sm font-medium text-foreground">{userDetails.name}</p>
                            </div>
                        </div>
                        <div className="flex items-center gap-3 p-3 bg-black/20 rounded border border-white/5">
                            <Phone className="w-4 h-4 text-muted-foreground" />
                            <div>
                                <p className="text-xs text-muted-foreground">PHONE</p>
                                <p className="text-sm font-medium text-foreground">{userDetails.phone}</p>
                            </div>
                        </div>
                        <div className="flex items-center gap-3 p-3 bg-black/20 rounded border border-white/5">
                            <Mail className="w-4 h-4 text-muted-foreground" />
                            <div>
                                <p className="text-xs text-muted-foreground">EMAIL</p>
                                <p className="text-sm font-medium text-foreground">{userDetails.email}</p>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                {/* Vehicle Information */}
                <Card className="bg-card/50 backdrop-blur-sm border-white/10">
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2 text-primary">
                            <Car className="w-5 h-5" />
                            VEHICLE_DETAILS
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="flex items-center gap-3 p-3 bg-black/20 rounded border border-white/5">
                            <Car className="w-4 h-4 text-muted-foreground" />
                            <div>
                                <p className="text-xs text-muted-foreground">VEHICLE NAME</p>
                                <p className="text-sm font-medium text-foreground">{userDetails.vehicleName}</p>
                            </div>
                        </div>
                        <div className="flex items-center gap-3 p-3 bg-black/20 rounded border border-white/5">
                            <ShieldCheck className="w-4 h-4 text-muted-foreground" />
                            <div>
                                <p className="text-xs text-muted-foreground">VEHICLE NUMBER</p>
                                <p className="text-sm font-medium text-foreground font-mono">{userDetails.vehicleNumber}</p>
                            </div>
                        </div>
                        <div className="flex items-center gap-3 p-3 bg-black/20 rounded border border-white/5">
                            <Calendar className="w-4 h-4 text-muted-foreground" />
                            <div>
                                <p className="text-xs text-muted-foreground">ISSUED DATE</p>
                                <p className="text-sm font-medium text-foreground">{userDetails.issuedDate}</p>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
