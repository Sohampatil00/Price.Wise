"use client"

import { useMemo } from 'react';
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer } from 'recharts';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { useAppState } from '@/lib/store';
import { ChartContainer, ChartTooltipContent, type ChartConfig } from '@/components/ui/chart';
import { Badge } from '../ui/badge';
  
export function InventoryHealthCard() {
    const { onboardingData } = useAppState();

    const inventoryData = useMemo(() => {
        if (!onboardingData.salesHistory || !onboardingData.analysis) {
            return [];
        }

        const salesLines = onboardingData.salesHistory.split('\n').slice(1); // skip header
        const products = new Set<string>();
        salesLines.forEach(line => {
            const columns = line.split(',');
            if (columns.length > 1 && columns[1]) {
                products.add(columns[1].trim());
            }
        });

        const essentialGoodNames = (onboardingData.analysis.essentialGoods || [])
            .map(tag => tag.trim().toLowerCase());

        const chartColors = ["hsl(var(--chart-1))", "hsl(var(--chart-2))", "hsl(var(--chart-3))", "hsl(var(--chart-4))", "hsl(var(--chart-5))"];

        return Array.from(products).map((productName, index) => {
            const isEssential = essentialGoodNames.includes(productName.toLowerCase());
            return {
                name: productName,
                value: Math.floor(Math.random() * 200) + 10, // Random stock value
                fill: chartColors[index % chartColors.length],
                essential: isEssential
            };
        });

    }, [onboardingData]);

    const chartConfig = useMemo(() => {
        const config: ChartConfig = {};
        if (inventoryData.length > 0) {
            inventoryData.forEach((item) => {
                config[item.name] = {
                    label: item.name,
                    color: item.fill,
                };
            });
        }
        return config;
    }, [inventoryData]);

    const essentialGoods = inventoryData.filter(item => item.essential);
    const nonEssentialGoods = inventoryData.filter(item => !item.essential);

    if (inventoryData.length === 0) {
        return (
             <Card className="h-full">
                <CardHeader>
                    <CardTitle>Inventory Health</CardTitle>
                    <CardDescription>No inventory data found. Please complete onboarding.</CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="flex items-center justify-center h-[200px] text-muted-foreground">
                        Awaiting data...
                    </div>
                </CardContent>
            </Card>
        )
    }

    return (
        <Card className="h-full">
            <CardHeader>
                <CardTitle>Inventory Health</CardTitle>
                <CardDescription>Stock levels of essential vs. non-essential goods.</CardDescription>
            </CardHeader>
            <CardContent>
                 <ChartContainer
                    config={chartConfig}
                    className="mx-auto aspect-square h-[200px]"
                    >
                    <ResponsiveContainer width="100%" height="100%">
                        <PieChart>
                        <Tooltip
                            cursor={false}
                            content={<ChartTooltipContent hideLabel />}
                        />
                        <Pie
                            data={inventoryData}
                            dataKey="value"
                            nameKey="name"
                            cx="50%"
                            cy="50%"
                            outerRadius={80}
                            labelLine={false}
                        >
                            {inventoryData.map((entry) => (
                                <Cell key={entry.name} fill={entry.fill} />
                            ))}
                        </Pie>
                        </PieChart>
                    </ResponsiveContainer>
                </ChartContainer>
                <div className="mt-4 space-y-4">
                    <div>
                        <h4 className="text-sm font-medium mb-2">Essential Goods</h4>
                        <div className="flex flex-wrap gap-2">
                        {essentialGoods.map(item => (
                            <Badge key={item.name} variant="secondary" className="bg-green-100 text-green-800 border-green-200">
                                {item.name}: {item.value}
                            </Badge>
                        ))}
                        </div>
                    </div>
                    <div>
                        <h4 className="text-sm font-medium mb-2">Non-Essential Goods</h4>
                        <div className="flex flex-wrap gap-2">
                        {nonEssentialGoods.map(item => (
                            <Badge key={item.name} variant="outline">
                                {item.name}: {item.value}
                            </Badge>
                        ))}
                        </div>
                    </div>
                </div>
            </CardContent>
        </Card>
    )
}
