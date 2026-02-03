'use client';

import { useState, useEffect } from 'react';
import OnboardingForm from "@/components/onboarding-form";
import { Card, CardHeader, CardContent, CardFooter } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { Progress } from '@/components/ui/progress';


function OnboardingFormSkeleton() {
    return (
        <Card className="w-full">
            <CardHeader>
                <Progress value={25} className="mb-4 h-2" />
                <div className="flex items-center gap-3">
                    <Skeleton className="p-2 rounded-md h-10 w-10" />
                    <div>
                        <Skeleton className="h-6 w-40" />
                        <Skeleton className="h-4 w-24 mt-2" />
                    </div>
                </div>
            </CardHeader>
            <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                        <Skeleton className="h-5 w-32" />
                        <Skeleton className="h-10 w-full" />
                    </div>
                    <div className="space-y-2">
                        <Skeleton className="h-5 w-32" />
                        <Skeleton className="h-10 w-full" />
                    </div>
                    <div className="space-y-2">
                        <Skeleton className="h-5 w-32" />
                        <Skeleton className="h-10 w-full" />
                    </div>
                    <div className="space-y-2">
                        <Skeleton className="h-5 w-32" />
                        <Skeleton className="h-10 w-full" />
                    </div>
                    <div className="space-y-2 md:col-span-2">
                        <Skeleton className="h-5 w-48" />
                        <Skeleton className="h-10 w-full" />
                    </div>
                </div>
            </CardContent>
            <CardFooter className="flex justify-between">
                <div />
                <Skeleton className="h-10 w-28" />
            </CardFooter>
        </Card>
    );
}


export default function OnboardingClientWrapper() {
    const [isClient, setIsClient] = useState(false);

    useEffect(() => {
        setIsClient(true);
    }, []);

    if (!isClient) {
        return <OnboardingFormSkeleton />;
    }

    return <OnboardingForm />;
}
