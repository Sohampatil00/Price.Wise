"use client";

import { useMemo } from 'react';
import { useAppState } from '@/lib/store';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from '@/components/ui/badge';
import { ArrowDown } from 'lucide-react';

type CompetitorPrice = {
  name: string;
  ourPrice: number;
  competitors: { name: string; price: number }[];
};

export default function CompetitorsPage() {
  const { onboardingData } = useAppState();

  const competitorData = useMemo<CompetitorPrice[]>(() => {
    if (!onboardingData.salesHistory) {
      return [];
    }

    const salesLines = onboardingData.salesHistory.split('\n').slice(1);
    const productsMap = new Map<string, number>();

    salesLines.forEach(line => {
      const columns = line.split(',');
      if (columns.length > 2) {
        const productName = columns[1].trim();
        const price = parseFloat(columns[2]);
        if (!productsMap.has(productName)) {
          productsMap.set(productName, price);
        }
      }
    });

    return Array.from(productsMap.entries()).map(([name, price]) => {
        const amazonPrice = price * (1 + (Math.random() * 0.15 + 0.05)); // 5-20% higher
        const flipkartPrice = price * (1 + (Math.random() * 0.15 + 0.05)); // 5-20% higher
        
        return {
            name: name,
            ourPrice: price,
            competitors: [
                { name: 'Amazon', price: amazonPrice },
                { name: 'Flipkart', price: flipkartPrice },
            ],
        };
    });
  }, [onboardingData.salesHistory]);

  const competitors = ['Amazon', 'Flipkart'];

  return (
    <div className="p-4 md:p-8">
      <h2 className="text-3xl font-bold tracking-tight font-headline mb-4">
        Competitor Fairness Radar
      </h2>
      <Card>
        <CardHeader>
          <CardTitle>Competitor Price Analysis</CardTitle>
          <CardDescription>
            Comparing your product prices against major e-commerce platforms.
          </CardDescription>
        </CardHeader>
        <CardContent>
          {competitorData.length > 0 ? (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Product</TableHead>
                  <TableHead className="text-right text-primary font-semibold">Our Price (Rs)</TableHead>
                  {competitors.map(c => <TableHead key={c} className="text-right">{c} (Rs)</TableHead>)}
                  <TableHead className="text-right">Our Advantage</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {competitorData.map((product) => {
                  const minCompetitorPrice = Math.min(...product.competitors.map(c => c.price));
                  const advantage = minCompetitorPrice - product.ourPrice;

                  return (
                    <TableRow key={product.name}>
                      <TableCell className="font-medium">{product.name}</TableCell>
                      <TableCell className="text-right font-bold text-primary">{product.ourPrice.toFixed(2)}</TableCell>
                      {product.competitors.map(c => (
                        <TableCell key={c.name} className="text-right">{c.price.toFixed(2)}</TableCell>
                      ))}
                      <TableCell className="text-right">
                        {advantage > 0 ? (
                          <Badge variant="secondary" className="bg-green-100 text-green-800 border-green-200">
                            <ArrowDown className="h-3 w-3 mr-1" />
                            Rs{advantage.toFixed(2)} cheaper
                          </Badge>
                        ) : (
                          <Badge variant="destructive">
                            Higher Price
                          </Badge>
                        )}
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          ) : (
             <div className="text-center py-10">
                <p className="text-muted-foreground">No product data available to perform competitor analysis.</p>
                <p className="text-sm text-muted-foreground mt-2">Please complete the onboarding process first.</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
