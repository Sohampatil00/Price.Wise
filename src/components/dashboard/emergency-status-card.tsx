"use client"

import { useState } from "react";
import { Shield, ShieldAlert, ShieldCheck } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

export default function EmergencyStatusCard() {
    const [isEmergency, setIsEmergency] = useState(false);

    const status = isEmergency ? "Active" : "Inactive";
    const Icon = isEmergency ? ShieldAlert : ShieldCheck;
    const variant = isEmergency ? "destructive" : "secondary";
    const badgeBg = isEmergency ? "bg-destructive" : "bg-accent";
    const textColor = isEmergency ? "text-destructive" : "text-accent";

    return (
        <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
                Emergency Status
            </CardTitle>
            <Icon className={`h-4 w-4 text-muted-foreground ${textColor}`} />
            </CardHeader>
            <CardContent>
                <div className={`text-2xl font-bold ${textColor}`}>{status}</div>
                <p className="text-xs text-muted-foreground">
                    Pricing controls are currently {status.toLowerCase()}.
                </p>
            </CardContent>
      </Card>
    )
}
