"use client";

import { useMemo, useState } from 'react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { useAppState } from '@/lib/store';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { PlusCircle } from 'lucide-react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';

const productSchema = z.object({
  name: z.string().min(1, "Product name is required"),
  price: z.coerce.number().positive("Price must be a positive number"),
  photo: z.any().optional(),
  tag: z.string().optional(),
  essential: z.boolean().default(false),
});

type ProductFormData = z.infer<typeof productSchema>;

// Define a type for our product
type Product = {
    name: string;
    stock: number;
    price?: number;
    essential: boolean;
    tag?: string;
    photo?: string; // URL to photo
}

export default function ProductsPage() {
    const { onboardingData } = useAppState();
    const [products, setProducts] = useState<Product[]>([]);
    const [isDialogOpen, setIsDialogOpen] = useState(false);

    const form = useForm<ProductFormData>({
        resolver: zodResolver(productSchema),
        defaultValues: {
            name: "",
            price: 0.0,
            tag: "",
            essential: false,
        },
    });

    const onSubmit = (data: ProductFormData) => {
        const newProduct: Product = {
            name: data.name,
            stock: 0, // New products have 0 stock initially
            price: data.price,
            essential: data.essential,
            tag: data.tag,
        };
        
        const file = data.photo?.[0];
        if (file) {
            newProduct.photo = URL.createObjectURL(file);
        }

        setProducts(currentProducts => [...currentProducts, newProduct]);
        setIsDialogOpen(false);
        form.reset();
    };


    const inventoryData: Product[] = useMemo(() => {
        if (!onboardingData.salesHistory) {
            return [];
        }

        const salesLines = onboardingData.salesHistory.split('\n').slice(1); // skip header
        const productsMap = new Map<string, { stock: number; price: number }>();
        salesLines.forEach(line => {
            const columns = line.split(',');
            if (columns.length > 3) {
                const productName = columns[1].trim();
                const price = parseFloat(columns[2]);
                if (!productsMap.has(productName)) {
                    productsMap.set(productName, { stock: Math.floor(Math.random() * 500), price: price });
                }
            }
        });

        const essentialGoods = (onboardingData.analysis?.essentialGoods || [])
            .map(tag => tag.trim().toLowerCase());
        
        return Array.from(productsMap.entries()).map(([name, data]) => ({
            name,
            stock: data.stock,
            price: data.price,
            essential: essentialGoods.includes(name.toLowerCase()),
            tag: '' // No tags from onboarding data
        }));

    }, [onboardingData]);

    const combinedInventory = useMemo(() => {
        return [...inventoryData, ...products];
    }, [inventoryData, products]);

  const photoRegistration = form.register("photo");

  return (
    <div className="p-4 md:p-8">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-3xl font-bold tracking-tight font-headline">
            Products
        </h2>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
                <Button>
                    <PlusCircle className="mr-2 h-4 w-4" /> Add Product
                </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                    <DialogTitle>Add New Product</DialogTitle>
                    <DialogDescription>
                        Fill in the details to add a new product to your inventory.
                    </DialogDescription>
                </DialogHeader>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 pt-4">
                    <div className="space-y-2">
                        <Label htmlFor="name">Product Name</Label>
                        <Input id="name" {...form.register("name")} />
                        {form.formState.errors.name && <p className="text-destructive text-sm">{form.formState.errors.name.message}</p>}
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="price">Price</Label>
                        <Input id="price" type="number" step="0.01" {...form.register("price")} />
                        {form.formState.errors.price && <p className="text-destructive text-sm">{form.formState.errors.price.message}</p>}
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="photo">Product Photo</Label>
                        <Input id="photo" type="file" accept="image/*" {...photoRegistration} />
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="tag">Tag</Label>
                        <Input id="tag" {...form.register("tag")} placeholder="e.g. Electronics, Food" />
                    </div>
                    <div className="flex items-center space-x-2">
                        <Switch id="essential" checked={form.watch('essential')} onCheckedChange={(c) => form.setValue("essential", c)} />
                        <Label htmlFor="essential">Essential Good</Label>
                    </div>
                    <DialogFooter>
                        <Button type="submit">Save Product</Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
      </div>
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
                        <TableHead>Price</TableHead>
                        <TableHead>Tags</TableHead>
                        <TableHead>Classification</TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {combinedInventory.map((product) => (
                        <TableRow key={product.name}>
                            <TableCell className="font-medium">
                                <div className="flex items-center gap-3">
                                {product.photo && <img src={product.photo} alt={product.name} className="h-10 w-10 rounded-md object-cover" />}
                                <span>{product.name}</span>
                                </div>
                            </TableCell>
                            <TableCell>{product.stock}</TableCell>
                            <TableCell>{product.price ? `Rs${product.price.toFixed(2)}` : 'N/A'}</TableCell>
                            <TableCell>
                                {product.tag && <Badge variant="secondary">{product.tag}</Badge>}
                            </TableCell>
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
