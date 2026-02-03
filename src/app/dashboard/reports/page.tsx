
"use client";

import { useMemo } from 'react';
import { useAppState } from '@/lib/store';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from '@/components/ui/button';
import { Download, TrendingUp, ShieldAlert, CheckCircle2, FileDown } from 'lucide-react';
import { BarChart, Bar, ResponsiveContainer, XAxis, YAxis, Tooltip } from 'recharts';
import { ChartContainer, ChartTooltipContent } from '@/components/ui/chart';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';

type SalesByProduct = {
  name: string;
  revenue: number;
  unitsSold: number;
};

type NonCompliantSale = {
  productName: string;
  salePrice: number;
  recommendedMin: number;
  recommendedMax: number;
  date: string;
};

export default function ReportsPage() {
  const { onboardingData } = useAppState();
  const { toast } = useToast();

  const hasData = useMemo(() => !!onboardingData.salesHistory && !!onboardingData.analysis, [onboardingData]);

  const { salesByProduct, totalRevenue } = useMemo(() => {
    if (!hasData) {
      return { salesByProduct: [], totalRevenue: 0 };
    }
    const lines = onboardingData.salesHistory!.split('\n').slice(1).filter(l => l.trim() !== '');
    const productMap = new Map<string, { revenue: number, unitsSold: number }>();
    let totalRevenue = 0;

    lines.forEach(line => {
      const [, name, priceStr, quantityStr] = line.split(',');
      if (name && priceStr && quantityStr) {
        const price = parseFloat(priceStr);
        const quantity = parseInt(quantityStr, 10);
        if (!isNaN(price) && !isNaN(quantity)) {
          const revenue = price * quantity;
          const current = productMap.get(name.trim()) || { revenue: 0, unitsSold: 0 };
          productMap.set(name.trim(), {
            revenue: current.revenue + revenue,
            unitsSold: current.unitsSold + quantity
          });
          totalRevenue += revenue;
        }
      }
    });

    const salesByProduct = Array.from(productMap.entries()).map(([name, data]) => ({
      name,
      ...data
    })).sort((a, b) => b.revenue - a.revenue);

    return { salesByProduct, totalRevenue };
  }, [hasData, onboardingData.salesHistory]);

  const { compliantSalesCount, nonCompliantSalesCount, complianceReport, compliancePercentage } = useMemo(() => {
    if (!hasData) {
        return { compliantSalesCount: 0, nonCompliantSalesCount: 0, complianceReport: [], compliancePercentage: 100 };
    }
    const lines = onboardingData.salesHistory!.split('\n').slice(1).filter(l => l.trim() !== '');
    const priceRanges = new Map(onboardingData.analysis!.optimalPriceRanges.map(p => [p.productName.trim().toLowerCase(), { min: p.minPrice, max: p.maxPrice }]));

    let compliantSales = 0;
    const nonCompliantSales: NonCompliantSale[] = [];
    let totalSalesWithRange = 0;

    lines.forEach(line => {
        const [date, name, priceStr] = line.split(',');
        if (name && priceStr) {
            const productName = name.trim().toLowerCase();
            const salePrice = parseFloat(priceStr);
            const range = priceRanges.get(productName);
            if (range) {
                totalSalesWithRange++;
                if (salePrice >= range.min && salePrice <= range.max) {
                    compliantSales++;
                } else {
                    nonCompliantSales.push({
                        productName: name.trim(),
                        salePrice,
                        recommendedMin: range.min,
                        recommendedMax: range.max,
                        date,
                    });
                }
            }
        }
    });
    
    const percentage = totalSalesWithRange > 0 ? (compliantSales / totalSalesWithRange) * 100 : 100;
    
    return { 
        compliantSalesCount: compliantSales, 
        nonCompliantSalesCount: nonCompliantSales.length, 
        complianceReport: nonCompliantSales,
        compliancePercentage: percentage
    };
  }, [hasData, onboardingData.salesHistory, onboardingData.analysis]);

  const complianceChartData = [
      { name: 'Compliance', Compliant: compliantSalesCount, 'Non-Compliant': nonCompliantSalesCount },
  ];

  const escapeCsvCell = (cellData: any) => {
    const stringData = String(cellData === null || cellData === undefined ? '' : cellData);
    if (stringData.includes(',') || stringData.includes('"') || stringData.includes('\n')) {
        return `"${stringData.replace(/"/g, '""')}"`;
    }
    return stringData;
  };
  
  const handleDownload = (reportType: 'sales' | 'compliance' | 'full') => {
    if (!hasData) {
        toast({
            title: "No data available",
            description: "Please complete onboarding to generate reports.",
            variant: "destructive"
        });
        return;
    }

    let csvString = '';
    let fileName = `pricewise-report-${new Date().toISOString().split('T')[0]}.csv`;

    if (reportType === 'full') {
        const { analysis, name, type, region, targetCustomer } = onboardingData;
        csvString += `PriceWise Full Report for,${escapeCsvCell(name)}\n\n`;
        csvString += "AI Analysis Summary\n";
        csvString += `${escapeCsvCell(analysis!.summary)}\n\n`;
        csvString += "Business Information\n";
        csvString += `Business Name,${escapeCsvCell(name)}\n`;
        csvString += `Business Type,${escapeCsvCell(type)}\n`;
        csvString += `Region,${escapeCsvCell(region)}\n`;
        csvString += `Target Customer,${escapeCsvCell(targetCustomer)}\n\n`;
        csvString += "Optimal Price Ranges\n";
        csvString += "Product Name,Min Price (Rs),Max Price (Rs)\n";
        analysis!.optimalPriceRanges.forEach(p => {
            csvString += `${escapeCsvCell(p.productName)},${escapeCsvCell(p.minPrice.toFixed(2))},${escapeCsvCell(p.maxPrice.toFixed(2))}\n`;
        });
        csvString += "\n";
        csvString += "Demand Elasticity\n";
        csvString += "Product Name,Elasticity,Analysis\n";
        analysis!.demandElasticity.forEach(p => {
            csvString += `${escapeCsvCell(p.productName)},${escapeCsvCell(p.elasticity.toFixed(2))},${escapeCsvCell(p.analysis)}\n`;
        });
        csvString += "\n";
    } else if (reportType === 'sales') {
        fileName = `sales-report-${new Date().toISOString().split('T')[0]}.csv`;
        csvString += "Sales Report by Product\n";
        csvString += "Product Name,Total Revenue (Rs),Units Sold\n";
        salesByProduct.forEach(p => {
            csvString += `${escapeCsvCell(p.name)},${escapeCsvCell(p.revenue.toFixed(2))},${escapeCsvCell(p.unitsSold)}\n`;
        });
    } else if (reportType === 'compliance') {
        fileName = `compliance-report-${new Date().toISOString().split('T')[0]}.csv`;
        csvString += "Pricing Compliance Report (Non-Compliant Sales)\n";
        csvString += "Product Name,Sale Price (Rs),Recommended Min (Rs),Recommended Max (Rs),Date\n";
        complianceReport.forEach(s => {
            csvString += `${escapeCsvCell(s.productName)},${escapeCsvCell(s.salePrice.toFixed(2))},${escapeCsvCell(s.recommendedMin.toFixed(2))},${escapeCsvCell(s.recommendedMax.toFixed(2))},${escapeCsvCell(s.date)}\n`;
        });
    }
    
    const blob = new Blob([csvString], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement("a");
    const url = URL.createObjectURL(blob);
    link.setAttribute("href", url);
    link.setAttribute("download", fileName);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  }

  if (!hasData) {
    return (
        <div className="p-4 md:p-8">
            <h2 className="text-3xl font-bold tracking-tight font-headline mb-4">
                Reporting Center
            </h2>
            <Card>
                <CardHeader>
                <CardTitle>No Data Available</CardTitle>
                <CardDescription>
                    The reporting center requires data from the onboarding process to generate insights.
                </CardDescription>
                </CardHeader>
                <CardContent>
                <p>Please complete the onboarding process, including uploading your sales history, to activate the reporting features.</p>
                </CardContent>
            </Card>
        </div>
    );
  }

  return (
    <div className="p-4 md:p-8">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-3xl font-bold tracking-tight font-headline">
            Reporting Center
        </h2>
        <Button onClick={() => handleDownload('full')}>
            <FileDown className="mr-2 h-4 w-4" /> Download Full Report
        </Button>
      </div>

      <Tabs defaultValue="sales" className="space-y-4">
        <TabsList>
          <TabsTrigger value="sales">Sales & Revenue</TabsTrigger>
          <TabsTrigger value="compliance">Pricing Compliance</TabsTrigger>
        </TabsList>
        <TabsContent value="sales" className="space-y-4">
            <Card>
                <CardHeader>
                    <CardTitle>Sales Performance</CardTitle>
                    <CardDescription>A breakdown of revenue and units sold by product.</CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="mb-4">
                        <p className="text-sm text-muted-foreground">Total Revenue</p>
                        <p className="text-2xl font-bold">Rs{totalRevenue.toFixed(2)}</p>
                    </div>
                     <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Product</TableHead>
                                <TableHead className="text-right">Revenue</TableHead>
                                <TableHead className="text-right">Units Sold</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {salesByProduct.map(product => (
                                <TableRow key={product.name}>
                                    <TableCell className="font-medium">{product.name}</TableCell>
                                    <TableCell className="text-right">Rs{product.revenue.toFixed(2)}</TableCell>
                                    <TableCell className="text-right">{product.unitsSold}</TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </CardContent>
            </Card>
            <div className="text-right">
                <Button variant="outline" onClick={() => handleDownload('sales')}>
                    <Download className="mr-2 h-4 w-4" /> Download Sales CSV
                </Button>
            </div>
        </TabsContent>
        <TabsContent value="compliance" className="space-y-4">
            <div className="grid gap-4 md:grid-cols-2">
                 <Card>
                    <CardHeader>
                        <CardTitle>Compliance Overview</CardTitle>
                        <CardDescription>How well your sales align with AI price recommendations.</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="flex items-baseline gap-2">
                            <p className="text-4xl font-bold">{compliancePercentage.toFixed(1)}%</p>
                            <p className="text-sm text-muted-foreground">Compliance Score</p>
                        </div>
                        <ChartContainer config={{}} className="h-[200px] w-full mt-4">
                            <ResponsiveContainer>
                                <BarChart data={complianceChartData} layout="vertical" barSize={30}>
                                    <XAxis type="number" hide />
                                    <YAxis type="category" dataKey="name" hide />
                                    <Tooltip cursor={{ fill: 'hsl(var(--background))' }} content={<ChartTooltipContent />} />
                                    <Bar dataKey="Compliant" stackId="a" fill="hsl(var(--chart-2))" radius={[4, 0, 0, 4]} />
                                    <Bar dataKey="Non-Compliant" stackId="a" fill="hsl(var(--chart-5))" radius={[0, 4, 4, 0]} />
                                </BarChart>
                            </ResponsiveContainer>
                        </ChartContainer>
                         <div className="flex justify-between text-sm mt-2">
                            <div className="flex items-center gap-2"><CheckCircle2 className="h-4 w-4 text-green-500" /> Compliant: {compliantSalesCount}</div>
                            <div className="flex items-center gap-2"><ShieldAlert className="h-4 w-4 text-red-500" /> Non-Compliant: {nonCompliantSalesCount}</div>
                        </div>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader>
                        <CardTitle>Non-Compliant Sales</CardTitle>
                        <CardDescription>Sales that fell outside the recommended price range.</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Product</TableHead>
                                    <TableHead>Sale Price</TableHead>
                                    <TableHead>Recommended</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {complianceReport.slice(0, 5).map((sale, i) => (
                                    <TableRow key={i}>
                                        <TableCell>{sale.productName}</TableCell>
                                        <TableCell>
                                            <Badge variant="destructive">Rs{sale.salePrice.toFixed(2)}</Badge>
                                        </TableCell>
                                        <TableCell className="text-xs">
                                            Rs{sale.recommendedMin.toFixed(2)} - Rs{sale.recommendedMax.toFixed(2)}
                                        </TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                         {complianceReport.length > 5 && <p className="text-xs text-muted-foreground text-center mt-2">...and {complianceReport.length - 5} more</p>}
                    </CardContent>
                </Card>
            </div>
             <div className="text-right">
                <Button variant="outline" onClick={() => handleDownload('compliance')}>
                    <Download className="mr-2 h-4 w-4" /> Download Compliance CSV
                </Button>
            </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}

    
