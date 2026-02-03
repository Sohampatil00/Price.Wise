"use client"

import { Line, LineChart, CartesianGrid, XAxis, YAxis, Tooltip } from "recharts"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { demandForecastData } from "@/lib/data"
import { ChartContainer, ChartTooltipContent, type ChartConfig } from "@/components/ui/chart"

const chartConfig = {
  demand: {
    label: "Demand",
    color: "hsl(var(--primary))",
  },
} satisfies ChartConfig

export function DemandForecastCard() {
  return (
    <Card className="h-full">
      <CardHeader>
        <CardTitle>Demand Forecast</CardTitle>
        <CardDescription>
          Projected demand for your products over the next 12 months.
        </CardDescription>
      </CardHeader>
      <CardContent className="pl-2">
        <ChartContainer config={chartConfig} className="h-[300px] w-full">
            <LineChart
                accessibilityLayer
                data={demandForecastData}
                margin={{
                    top: 5,
                    right: 10,
                    left: 10,
                    bottom: 0,
                }}
                >
                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                <XAxis
                    dataKey="month"
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
                    tickFormatter={(value) => `${value}`}
                />
                <Tooltip
                    content={<ChartTooltipContent />}
                    cursor={{ stroke: 'hsl(var(--primary))', strokeWidth: 2, strokeDasharray: "3 3" }}
                 />
                <Line
                    type="monotone"
                    dataKey="demand"
                    stroke="var(--color-demand)"
                    strokeWidth={2}
                    dot={{ r: 4, fill: "var(--color-demand)" }}
                    activeDot={{ r: 8, style: { stroke: 'hsl(var(--background))' } }}
                />
            </LineChart>
        </ChartContainer>
      </CardContent>
    </Card>
  )
}
