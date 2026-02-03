"use client";

import { useMemo } from "react";
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
import { useToast } from "@/hooks/use-toast";

export default function DashboardPage() {
  const { onboardingData } = useAppState();
  const { toast } = useToast();

  const activeProductsCount = useMemo(() => {
    if (!onboardingData.salesHistory) {
      return onboardingData.productCount || 0;
    }
    const salesLines = onboardingData.salesHistory.split('\n').slice(1).filter(line => line.trim() !== '');
    const productSet = new Set<string>();
    salesLines.forEach(line => {
      const columns = line.split(',');
      if (columns.length > 1 && columns[1]) {
        productSet.add(columns[1].trim());
      }
    });
    return productSet.size;
  }, [onboardingData.salesHistory, onboardingData.productCount]);

  const complianceScore = useMemo(() => {
    if (!onboardingData.salesHistory || !onboardingData.analysis?.optimalPriceRanges || onboardingData.analysis.optimalPriceRanges.length === 0) {
      return 100; // Default to 100% if no data to analyze
    }

    const priceRanges = new Map(onboardingData.analysis.optimalPriceRanges.map(p => [p.productName.trim().toLowerCase(), { min: p.minPrice, max: p.maxPrice }]));
    
    const salesLines = onboardingData.salesHistory.split('\n').slice(1).filter(line => line.trim() !== '');
    
    if (salesLines.length === 0) {
      return 100;
    }

    let compliantSales = 0;
    let totalSalesWithRange = 0;
    
    salesLines.forEach(line => {
      const columns = line.split(',');
      if (columns.length >= 4) {
        const productName = columns[1].trim().toLowerCase();
        const price = parseFloat(columns[2]);
        
        const range = priceRanges.get(productName);
        if (range) {
          totalSalesWithRange++;
          if (price >= range.min && price <= range.max) {
            compliantSales++;
          }
        }
      }
    });
    
    if (totalSalesWithRange === 0) {
        return 100;
    }

    return (compliantSales / totalSalesWithRange) * 100;

  }, [onboardingData.salesHistory, onboardingData.analysis]);


  const handleDownloadReport = () => {
    if (!onboardingData.analysis) {
      toast({
        title: "No data to report",
        description: "Please complete the onboarding process to generate a report.",
        variant: "destructive",
      });
      return;
    }

    const { analysis, name, type, region, targetCustomer } = onboardingData;

    const escapeCsvCell = (cellData: any) => {
        const stringData = String(cellData === null || cellData === undefined ? '' : cellData);
        if (stringData.includes(',') || stringData.includes('"') || stringData.includes('\n')) {
            return `"${stringData.replace(/"/g, '""')}"`;
        }
        return stringData;
    };
    
    let csvString = "";

    csvString += `Equitable Edge Report for,${escapeCsvCell(name)}\n\n`;

    csvString += "AI Analysis Summary\n";
    csvString += `${escapeCsvCell(analysis.summary)}\n\n`;

    csvString += "Business Information\n";
    csvString += `Business Name,${escapeCsvCell(name)}\n`;
    csvString += `Business Type,${escapeCsvCell(type)}\n`;
    csvString += `Region,${escapeCsvCell(region)}\n`;
    csvString += `Target Customer,${escapeCsvCell(targetCustomer)}\n\n`;

    csvString += "Optimal Price Ranges\n";
    csvString += "Product Name,Min Price (Rs),Max Price (Rs)\n";
    analysis.optimalPriceRanges.forEach(p => {
        csvString += `${escapeCsvCell(p.productName)},${escapeCsvCell(p.minPrice.toFixed(2))},${escapeCsvCell(p.maxPrice.toFixed(2))}\n`;
    });
    csvString += "\n";

    csvString += "Demand Elasticity\n";
    csvString += "Product Name,Elasticity,Analysis\n";
    analysis.demandElasticity.forEach(p => {
        csvString += `${escapeCsvCell(p.productName)},${escapeCsvCell(p.elasticity.toFixed(2))},${escapeCsvCell(p.analysis)}\n`;
    });
    csvString += "\n";

    csvString += "Pricing Baseline\n";
    csvString += "Product Name,Baseline Price (Rs)\n";
    analysis.pricingBaseline.forEach(p => {
        csvString += `${escapeCsvCell(p.productName)},${escapeCsvCell(p.baselinePrice.toFixed(2))}\n`;
    });
    csvString += "\n";

    csvString += "Essential Goods\n";
    csvString += "Product Name\n";
    analysis.essentialGoods.forEach(good => {
        csvString += `${escapeCsvCell(good)}\n`;
    });
    csvString += "\n";

    const blob = new Blob([csvString], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement("a");
    const url = URL.createObjectURL(blob);
    link.setAttribute("href", url);
    link.setAttribute("download", `equitable-edge-report-${new Date().toISOString().split('T')[0]}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="flex-1 space-y-4 p-4 md:p-8 pt-6">
      <div className="flex items-center justify-between space-y-2">
        <h2 className="text-3xl font-bold tracking-tight font-headline">
          {onboardingData.name ? `${onboardingData.name} Dashboard` : "Seller Dashboard"}
        </h2>
        <div className="flex items-center space-x-2">
          <Button onClick={handleDownloadReport}>
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
                <div className="text-2xl font-bold">Rs{onboardingData.monthlySales?.toLocaleString('en-IN', {maximumFractionDigits: 0}) || '0'}</div>
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
                <div className="text-2xl font-bold">+{activeProductsCount}</div>
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
                <div className="text-2xl font-bold">{complianceScore.toFixed(1)}%</div>
                <p className="text-xs text-muted-foreground">
                  Alignment with AI price recommendations
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
