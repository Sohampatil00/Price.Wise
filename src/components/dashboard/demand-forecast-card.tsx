"use client"

import { useMemo } from "react"
import { Line, LineChart, CartesianGrid, XAxis, YAxis, Tooltip } from "recharts"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { ChartContainer, ChartTooltipContent, type ChartConfig } from "@/components/ui/chart"
import { useAppState } from "@/lib/store"
import { format, parseISO } from 'date-fns'

const chartConfig = {
  demand: {
    label: "Total Sales",
    color: "hsl(var(--primary))",
  },
} satisfies ChartConfig

export function DemandForecastCard() {
  const { onboardingData } = useAppState();

  const chartData = useMemo(() => {
    if (!onboardingData.salesHistory) {
      return [];
    }

    const salesLines = onboardingData.salesHistory.split('\n').slice(1).filter(line => line.trim() !== '');
    
    // Aggregate sales by month
    const monthlyDemand: { [key: string]: { date: Date, demand: number } } = {};

    salesLines.forEach(line => {
      const columns = line.split(',');
      if (columns.length < 4) return;

      const dateStr = columns[0];
      const quantity = parseInt(columns[3], 10);
      
      try {
        const date = parseISO(dateStr);
        if (!isNaN(date.getTime()) && !isNaN(quantity)) {
          // Use 'yyyy-MM' as a key to group by month and year
          const monthKey = format(date, 'yyyy-MM');
          
          if (!monthlyDemand[monthKey]) {
            monthlyDemand[monthKey] = {
                date: new Date(date.getFullYear(), date.getMonth(), 1),
                demand: 0
            };
          }
          monthlyDemand[monthKey].demand += quantity;
        }
      } catch (e) {
        // Ignore lines with invalid date formats
      }
    });

    // Convert to array and sort by date
    return Object.values(monthlyDemand)
      .sort((a, b) => a.date.getTime() - b.date.getTime())
      .map(item => ({
        month: format(item.date, 'MMM yy'),
        demand: item.demand,
      }));

  }, [onboardingData.salesHistory]);

  return (
    <Card className="h-full">
      <CardHeader>
        <CardTitle>Demand Forecast</CardTitle>
        <CardDescription>
          {chartData.length > 0
            ? "Monthly product demand based on your sales history."
            : "Projected demand will appear here once you provide sales data."}
        </CardDescription>
      </CardHeader>
      <CardContent className="pl-2">
        {chartData.length > 0 ? (
          <ChartContainer config={chartConfig} className="h-[300px] w-full">
              <LineChart
                  accessibilityLayer
                  data={chartData}
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
                      interval={chartData.length > 12 ? Math.floor(chartData.length / 12) : 0}
                  />
                  <YAxis
                      stroke="#888888"
                      fontSize={12}
                      tickLine={false}
                      axisLine={false}
                      tickFormatter={(value) => `${value}`}
                  />
                  <Tooltip
                      content={<ChartTooltipContent labelClassName="text-sm" indicator="dot" />}
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
          <div className="h-[300px] w-full flex items-center justify-center">
            <p className="text-muted-foreground">No sales data to display forecast.</p>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
