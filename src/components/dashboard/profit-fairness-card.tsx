"use client"

import { Bar, BarChart, XAxis, YAxis, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { profitFairnessData } from '@/lib/data';
import { ChartTooltipContent } from '@/components/ui/chart';

export function ProfitFairnessCard() {
    return (
        <Card className="h-full">
            <CardHeader>
                <CardTitle>Profit vs. Fairness</CardTitle>
                <CardDescription>Balancing profitability with equitable pricing across regions.</CardDescription>
            </CardHeader>
            <CardContent className="pl-2">
                <div style={{ width: '100%', height: 350 }}>
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
                            <Bar dataKey="fairness" name="Fairness Index" fill="hsl(var(--accent))" radius={[4, 4, 0, 0]} />
                            <Bar dataKey="profit" name="Profit" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} />
                        </BarChart>
                    </ResponsiveContainer>
                </div>
            </CardContent>
        </Card>
    )
}
