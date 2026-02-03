"use client";

import { useMemo } from 'react';
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useAppState } from '@/lib/store';

type RecentSale = {
  customerName: string;
  customerIdentifier: string;
  sale: number;
  avatar: string;
};

export function RecentSalesCard() {
  const { onboardingData } = useAppState();

  const recentSales = useMemo<RecentSale[]>(() => {
    if (!onboardingData.salesHistory) return [];

    const salesLines = onboardingData.salesHistory.split('\n').slice(1).filter(line => line.trim() !== '');
    
    // Get last 5 sales for display
    return salesLines.slice(-5).reverse().map((line, index) => {
      const columns = line.split(',');
      const price = parseFloat(columns[2]);
      const quantity = parseInt(columns[3], 10);
      const customerName = `User ${index + 1}`;
      
      return {
        customerName,
        customerIdentifier: `User ID: 00${index + 1}`,
        sale: !isNaN(price) && !isNaN(quantity) ? price * quantity : 0,
        avatar: `https://picsum.photos/seed/${index + 10}/40/40`, // Use a different seed
      };
    });
  }, [onboardingData.salesHistory]);

  const totalSalesCount = useMemo<number>(() => {
    if (!onboardingData.salesHistory) return 0;
    
    const salesLines = onboardingData.salesHistory.split('\n').slice(1).filter(line => line.trim() !== '');

    return salesLines.reduce((acc, line) => {
      const columns = line.split(',');
      if (columns.length > 3) {
        const quantity = parseInt(columns[3], 10);
        return acc + (isNaN(quantity) ? 0 : quantity);
      }
      return acc;
    }, 0);
  }, [onboardingData.salesHistory]);

  return (
    <Card className="h-full">
      <CardHeader>
        <CardTitle>Recent Sales</CardTitle>
        <CardDescription>
          {totalSalesCount > 0 ? `You made ${totalSalesCount} sales this month.` : "No sales data available."}
        </CardDescription>
      </CardHeader>
      <CardContent>
        {recentSales.length > 0 ? (
          <div className="space-y-8">
            {recentSales.map((sale, index) => (
              <div key={index} className="flex items-center">
                <Avatar className="h-9 w-9">
                  <AvatarImage src={sale.avatar} alt="Avatar" />
                  <AvatarFallback>U</AvatarFallback>
                </Avatar>
                <div className="ml-4 space-y-1">
                  <p className="text-sm font-medium leading-none">{sale.customerName}</p>
                  <p className="text-sm text-muted-foreground">
                    {sale.customerIdentifier}
                  </p>
                </div>
                <div className="ml-auto font-medium">+Rs{sale.sale.toFixed(2)}</div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center text-sm text-muted-foreground h-full flex items-center justify-center">
            Your recent sales will appear here once you upload your sales history.
          </div>
        )}
      </CardContent>
    </Card>
  );
}
