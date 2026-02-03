"use client";

import { useAppState } from "@/lib/store";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { PlaceHolderImages } from "@/lib/placeholder-images";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Building, Briefcase, MapPin, Target } from 'lucide-react';

export default function ProfilePage() {
    const { onboardingData } = useAppState();
    const userAvatar = PlaceHolderImages.find(img => img.id === 'user-avatar');

    return (
        <div className="p-4 md:p-8">
            <h2 className="text-3xl font-bold tracking-tight font-headline mb-4">
                Profile
            </h2>
            <div className="grid gap-8 md:grid-cols-3">
                <div className="md:col-span-1">
                    <Card>
                        <CardHeader className="items-center text-center">
                            <Avatar className="h-24 w-24 mb-2">
                                {userAvatar && <AvatarImage src={userAvatar.imageUrl} data-ai-hint={userAvatar.imageHint} alt="User Avatar" />}
                                <AvatarFallback>U</AvatarFallback>
                            </Avatar>
                            <CardTitle>Admin User</CardTitle>
                            <CardDescription>admin@equitable.edge</CardDescription>
                        </CardHeader>
                        <CardContent>
                           <Badge className="w-full justify-center" variant="secondary">Administrator</Badge>
                        </CardContent>
                    </Card>
                </div>
                <div className="md:col-span-2">
                     <Card>
                        <CardHeader>
                            <CardTitle>Business Information</CardTitle>
                            <CardDescription>Details provided during onboarding.</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-6">
                            <div className="flex items-center gap-4">
                                <Building className="h-5 w-5 text-muted-foreground" />
                                <div className="flex-1">
                                    <Label>Business Name</Label>
                                    <p className="text-sm font-medium">{onboardingData.name || 'N/A'}</p>
                                </div>
                            </div>
                             <div className="flex items-center gap-4">
                                <Briefcase className="h-5 w-5 text-muted-foreground" />
                                <div className="flex-1">
                                    <Label>Business Type</Label>
                                    <p className="text-sm font-medium capitalize">{onboardingData.type || 'N/A'}</p>
                                </div>
                            </div>
                             <div className="flex items-center gap-4">
                                <MapPin className="h-5 w-5 text-muted-foreground" />
                                <div className="flex-1">
                                    <Label>Region</Label>
                                    <p className="text-sm font-medium">{onboardingData.region || 'N/A'}</p>
                                </div>
                            </div>
                             <div className="flex items-center gap-4">
                                <Target className="h-5 w-5 text-muted-foreground" />
                                <div className="flex-1">
                                    <Label>Target Customer</Label>
                                    <p className="text-sm font-medium capitalize">{onboardingData.targetCustomer ? `${onboardingData.targetCustomer} Income` : 'N/A'}</p>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </div>
    );
}
