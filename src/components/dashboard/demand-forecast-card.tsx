"use client"

import { useState, useEffect } from "react"
import { Line, LineChart, CartesianGrid, XAxis, YAxis, Tooltip } from "recharts"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { ChartContainer, ChartTooltipContent, type ChartConfig } from "@/components/ui/chart"
import { Skeleton } from "@/components/ui/skeleton"

const chartConfig = {
  demand: {
    label: "Demand",
    color: "hsl(var(--primary))",
  },
} satisfies ChartConfig

const generateDemandData = () => [
    { month: "Jan", demand: Math.floor(Math.random() * 2000) + 1000 },
    { month: "Feb", demand: Math.floor(Math.random() * 2000) + 1200 },
    { month: "Mar", demand: Math.floor(Math.random() * 2000) + 1500 },
    { month: "Apr", demand: Math.floor(Math.random() * 2000) + 1300 },
    { month: "May", demand: Math.floor(Math.random() * 2000) + 1600 },
    { month: "Jun", demand: Math.floor(Math.random() * 2000) + 2000 },
    { month: "Jul", demand: Math.floor(Math.random() * 2000) + 2300 },
    { month: "Aug", demand: Math.floor(Math.random() * 2000) + 2200 },
    { month: "Sep", demand: Math.floor(Math.random() * 2000) + 2500 },
    { month: "Oct", demand: Math.floor(Math.random() * 2000) + 2100 },
    { month: "Nov", demand: Math.floor(Math.random() * 2000) + 2700 },
    { month: "Dec", demand: Math.floor(Math.random() * 2000) + 3000 },
];


export function DemandForecastCard() {
  const [data, setData] = useState<ReturnType<typeof generateDemandData> | null>(null)

  useEffect(() => {
    // This will only run on the client, after initial hydration
    setData(generateDemandData())
  }, [])

  return (
    <Card className="h-full">
      <CardHeader>
        <CardTitle>Demand Forecast</CardTitle>
        <CardDescription>
          Projected demand for your products over the next 12 months.
        </CardDescription>
      </CardHeader>
      <CardContent className="pl-2">
        {data ? (
          <ChartContainer config={chartConfig} className="h-[300px] w-full">
              <LineChart
                  accessibilityLayer
                  data={data}
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
        ) : (
          <div className="h-[300px] w-full p-2">
            <Skeleton className="h-full w-full" />
          </div>
        )}
      </CardContent>
    </Card>
  )
}
