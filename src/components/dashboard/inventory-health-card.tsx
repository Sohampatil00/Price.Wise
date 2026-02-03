"use client"

import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer } from 'recharts';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { inventoryData } from '@/lib/data';
import { ChartTooltipContent } from '@/components/ui/chart';
import { Badge } from '../ui/badge';
  
export function InventoryHealthCard() {
    const essentialGoods = inventoryData.filter(item => item.essential);
    const nonEssentialGoods = inventoryData.filter(item => !item.essential);

    return (
        <Card className="h-full">
            <CardHeader>
                <CardTitle>Inventory Health</CardTitle>
                <CardDescription>Stock levels of essential vs. non-essential goods.</CardDescription>
            </CardHeader>
            <CardContent>
                <div style={{ width: '100%', height: 200 }}>
                    <ResponsiveContainer>
                        <PieChart>
                            <Pie
                                data={inventoryData}
                                cx="50%"
                                cy="50%"
                                labelLine={false}
                                outerRadius={80}
                                fill="#8884d8"
                                dataKey="value"
                                nameKey="name"
                            >
                                {inventoryData.map((entry, index) => (
                                    <Cell key={`cell-${index}`} fill={entry.fill} />
                                ))}
                            </Pie>
                            <Tooltip content={<ChartTooltipContent hideLabel />} />
                        </PieChart>
                    </ResponsiveContainer>
                </div>
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
