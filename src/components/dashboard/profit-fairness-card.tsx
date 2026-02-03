"use client"

import { useMemo } from 'react';
import { Bar, BarChart, XAxis, YAxis, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { useAppState } from '@/lib/store';
import { ChartContainer, ChartTooltipContent, type ChartConfig } from '@/components/ui/chart';

const baseData = [
    { name: 'Low-Income', profit: 4000, fairness: 2400 },
    { name: 'Mid-Income', profit: 3000, fairness: 1398 },
    { name: 'High-Income', profit: 2000, fairness: 9800 },
    { name: 'National Avg', profit: 2780, fairness: 3908 },
    { name: 'Global Avg', profit: 1890, fairness: 4800 },
  ];

const chartConfig = {
    profit: {
        label: "Profit",
        color: "hsl(var(--primary))",
    },
    fairness: {
        label: "Fairness Index",
        color: "hsl(var(--accent))",
    },
} satisfies ChartConfig;

export function ProfitFairnessCard() {
    const { onboardingData } = useAppState();

    const profitFairnessData = useMemo(() => {
        if (!onboardingData.targetCustomer) return baseData;
        
        const { targetCustomer, avgProfitMargin } = onboardingData;
        const profitMarginFactor = (avgProfitMargin || 0) / 20; // Assuming 20% is a baseline

        return baseData.map(item => {
            let name = item.name;
            if (targetCustomer === 'low' && item.name === 'Low-Income') {
                name = `Your Target (${item.name})`;
            } else if (targetCustomer === 'middle' && item.name === 'Mid-Income') {
                name = `Your Target (${item.name})`;
            } else if (targetCustomer === 'high' && item.name === 'High-Income') {
                name = `Your Target (${item.name})`;
            }

            // Adjust profit based on their margin
            const adjustedProfit = item.profit * (1 + profitMarginFactor);

            return {
                ...item,
                name,
                profit: Math.round(adjustedProfit)
            }
        });

    }, [onboardingData]);


    return (
        <Card className="h-full">
            <CardHeader>
                <CardTitle>Profit vs. Fairness</CardTitle>
                <CardDescription>Balancing profitability with equitable pricing across regions.</CardDescription>
            </CardHeader>
            <CardContent className="pl-2">
                <ChartContainer config={chartConfig} className="h-[350px] w-full">
                    <ResponsiveContainer>
                        <BarChart data={profitFairnessData}>
                            <XAxis
                                dataKey="name"
                                stroke="#888888"
                                fontSize={12}
                                tickLine={false}
                                axisLine={false}
                            />
                            <YAxis
                                stroke="#888888"
                                fontSize={12}
                                tickLine={false}
                                axisLine={false}
                                tickFormatter={(value) => `$${value}`}
                            />
                            <Tooltip content={<ChartTooltipContent />} cursor={{fill: 'hsl(var(--background))'}} />
                            <Legend wrapperStyle={{fontSize: "12px"}}/>
                            <Bar dataKey="fairness" name="Fairness Index" fill="var(--color-fairness)" radius={[4, 4, 0, 0]} />
                            <Bar dataKey="profit" name="Profit" fill="var(--color-profit)" radius={[4, 4, 0, 0]} />
                        </BarChart>
                    </ResponsiveContainer>
                </ChartContainer>
            </CardContent>
        </Card>
    )
}
