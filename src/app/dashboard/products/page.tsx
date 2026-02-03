"use client"; // Needs to be client component

import { useMemo } from 'react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { useAppState } from '@/lib/store';

export default function ProductsPage() {
    const { onboardingData } = useAppState();

    const inventoryData = useMemo(() => {
        if (!onboardingData.salesHistory) {
            return [];
        }

        const salesLines = onboardingData.salesHistory.split('\n').slice(1); // skip header
        const products = new Map<string, { stock: number }>();
        salesLines.forEach(line => {
            const columns = line.split(',');
            if (columns.length > 1 && columns[1]) {
                const productName = columns[1].trim();
                if (!products.has(productName)) {
                    products.set(productName, { stock: Math.floor(Math.random() * 500) });
                }
            }
        });

        const essentialGoods = (onboardingData.analysis?.essentialGoods || [])
            .map(tag => tag.trim().toLowerCase());
        
        return Array.from(products.entries()).map(([name, data]) => ({
            name,
            value: data.stock,
            essential: essentialGoods.includes(name.toLowerCase())
        }));

    }, [onboardingData]);


  return (
    <div className="p-4 md:p-8">
      <h2 className="text-3xl font-bold tracking-tight font-headline mb-4">
        Products
      </h2>
      <Card>
        <CardHeader>
          <CardTitle>Product List</CardTitle>
          <CardDescription>Manage your products and their classifications.</CardDescription>
        </CardHeader>
        <CardContent>
            <Table>
                <TableHeader>
                    <TableRow>
                        <TableHead>Product Name</TableHead>
                        <TableHead>Stock Level</TableHead>
                        <TableHead>Classification</TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {inventoryData.map((product) => (
                        <TableRow key={product.name}>
                            <TableCell className="font-medium">{product.name}</TableCell>
                            <TableCell>{product.value}</TableCell>
                            <TableCell>
                                <Badge variant={product.essential ? "default" : "secondary"} className={product.essential ? "bg-accent text-accent-foreground" : ""}>
                                    {product.essential ? "Essential" : "Non-Essential"}
                                </Badge>
                            </TableCell>
                        </TableRow>
                    ))}
                </TableBody>
            </Table>
        </CardContent>
      </Card>
    </div>
  );
}
