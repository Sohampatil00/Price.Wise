"use client";

import {
  Calendar as CalendarIcon,
  DollarSign,
  Package,
  ShieldCheck,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";
import { DemandForecastCard } from "@/components/dashboard/demand-forecast-card";
import { InventoryHealthCard } from "@/components/dashboard/inventory-health-card";
import { ProfitFairnessCard } from "@/components/dashboard/profit-fairness-card";
import { RecentSalesCard } from "@/components/dashboard/recent-sales-card";
import { useAppState } from "@/lib/store";

export default function DashboardPage() {
  const { onboardingData } = useAppState();

  return (
    <div className="flex-1 space-y-4 p-4 md:p-8 pt-6">
      <div className="flex items-center justify-between space-y-2">
        <h2 className="text-3xl font-bold tracking-tight font-headline">
          {onboardingData.name ? `${onboardingData.name} Dashboard` : "Seller Dashboard"}
        </h2>
        <div className="flex items-center space-x-2">
          <Button>
            <CalendarIcon className="mr-2 h-4 w-4" />
            Download Report
          </Button>
        </div>
      </div>
      <Tabs defaultValue="overview" className="space-y-4">
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
          <TabsTrigger value="reports" disabled>
            Reports
          </TabsTrigger>
        </TabsList>
        <TabsContent value="overview" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  Total Revenue
                </CardTitle>
                <DollarSign className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">${onboardingData.monthlySales?.toLocaleString('en-US', {maximumFractionDigits: 0}) || '0'}</div>
                <p className="text-xs text-muted-foreground">
                  Based on your onboarding data
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  Active Products
                </CardTitle>
                <Package className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">+{onboardingData.productCount || '0'}</div>
                <p className="text-xs text-muted-foreground">
                  Across your inventory
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  Compliance Score
                </CardTitle>
                <ShieldCheck className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">98.2%</div>
                <p className="text-xs text-muted-foreground">
                  +2% from last month
                </p>
              </CardContent>
            </Card>
          </div>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
            <div className="col-span-4">
                <DemandForecastCard />
            </div>
            <div className="col-span-4 lg:col-span-3">
                <RecentSalesCard />
            </div>
          </div>
        </TabsContent>
        <TabsContent value="analytics" className="space-y-4">
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-2">
                <InventoryHealthCard />
                <ProfitFairnessCard />
            </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
