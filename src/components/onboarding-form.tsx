"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { motion, AnimatePresence } from "framer-motion";
import {
  ArrowLeft,
  ArrowRight,
  Building,
  DollarSign,
  Upload,
  Sparkles,
  Loader2,
  BarChart as BarChartIcon,
  CheckCircle,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Progress } from "@/components/ui/progress";
import { Alert, AlertTitle, AlertDescription } from "@/components/ui/alert";
import { analyzeSalesData, AnalyzeSalesDataOutput } from "@/ai/flows/analyze-sales-data";
import { useAppState } from "@/lib/store";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  ResponsiveContainer,
  CartesianGrid,
} from "recharts";
import {
  ChartContainer,
  ChartTooltipContent,
} from "@/components/ui/chart";
import {
    Table,
    TableHeader,
    TableBody,
    TableCell,
    TableHead,
    TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";

const businessDetailsSchema = z.object({
  name: z.string().min(2, "Business name is required"),
  type: z.string().min(1, "Business type is required"),
  region: z.string().min(2, "Region is required"),
  targetCustomer: z.string().min(1, "Target customer class is required"),
  productCount: z.coerce.number().min(1, "Must have at least one product"),
});

const financialInputsSchema = z.object({
  monthlySales: z.coerce.number().min(0),
  avgProfitMargin: z.coerce.number().min(0).max(100),
  avgCostPerProduct: z.coerce.number().min(0),
  inventoryCapacity: z.coerce.number().min(0),
  supplierLeadTime: z.coerce.number().min(0),
});

const dataUploadSchema = z.object({
  salesHistory: z.any().refine((files) => files?.length > 0, "Sales history file is required."),
});

type FormData = z.infer<typeof businessDetailsSchema> &
  z.infer<typeof financialInputsSchema> &
  z.infer<typeof dataUploadSchema>;

const steps = [
  {
    title: "Business Details",
    icon: Building,
    schema: businessDetailsSchema,
    fields: ["name", "type", "region", "targetCustomer", "productCount"],
  },
  {
    title: "Financial Inputs",
    icon: DollarSign,
    schema: financialInputsSchema,
    fields: [
      "monthlySales",
      "avgProfitMargin",
      "avgCostPerProduct",
      "inventoryCapacity",
      "supplierLeadTime",
    ],
  },
  {
    title: "Historical Data",
    icon: Upload,
    schema: dataUploadSchema,
    fields: ["salesHistory"],
  },
  {
    title: "Analysis",
    icon: Sparkles,
  },
];

export default function OnboardingForm() {
  const [step, setStep] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [analysisResult, setAnalysisResult] = useState<AnalyzeSalesDataOutput | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [salesFile, setSalesFile] = useState<File | null>(null);
  const { setOnboardingData } = useAppState();

  const form = useForm<FormData>({
    resolver: zodResolver(
      (steps[step].schema || z.object({})) as z.ZodType<any, any>
    ),
    mode: "onChange",
    shouldUnregister: false,
  });

  const { register, handleSubmit, trigger, formState: { errors, isValid } } = form;

  const nextStep = async () => {
    const fields = steps[step].fields;
    const output = await trigger(fields as any, { shouldFocus: true });
    if (!output) return;
    setOnboardingData(form.getValues());
    setStep((prev) => prev + 1);
  };

  const prevStep = () => {
    setStep((prev) => prev - 1);
  };

  const onFinalSubmit = async (data: FormData) => {
    setIsLoading(true);
    setError(null);
    setAnalysisResult(null);
    setOnboardingData(data);

    const file = salesFile;
    if (!file) {
        setError("Sales history file not found. Please go back and upload it.");
        setIsLoading(false);
        return;
    }
    
    const reader = new FileReader();
    reader.readAsText(file);
    reader.onload = async () => {
      try {
        const salesData = reader.result as string;
        const businessDetails = `Business: ${data.name} (${data.type}), Region: ${data.region}, Target Customer: ${data.targetCustomer}`;
        const result = await analyzeSalesData({ salesData, businessDetails });
        setAnalysisResult(result);
        setOnboardingData({ salesHistory: salesData, analysis: result });
      } catch (e) {
        setError("Failed to analyze data. Please check the CSV format and try again.");
      } finally {
        setIsLoading(false);
      }
    };
    reader.onerror = () => {
        setError("Failed to read the file. Please try again.");
        setIsLoading(false);
    };
  };

  const progress = ((step + 1) / steps.length) * 100;
  
  const salesHistoryRegistration = register("salesHistory");

  return (
    <Card className="w-full">
      <CardHeader>
        <Progress value={progress} className="mb-4 h-2" />
        <div className="flex items-center gap-3">
            <div className="bg-primary/10 text-primary p-2 rounded-md">
                {React.createElement(steps[step].icon, { className: "h-6 w-6" })}
            </div>
            <div>
                <CardTitle className="text-2xl font-bold font-headline">
                {steps[step].title}
                </CardTitle>
                <CardDescription>
                Step {step + 1} of {steps.length}
                </CardDescription>
            </div>
        </div>
      </CardHeader>
      <CardContent>
        <AnimatePresence mode="wait">
          <motion.div
            key={step}
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -50 }}
            transition={{ duration: 0.3 }}
          >
            {step === 0 && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="name">Business Name</Label>
                  <Input id="name" {...register("name")} />
                  {errors.name && <p className="text-destructive text-sm">{errors.name.message}</p>}
                </div>
                <div className="space-y-2">
                  <Label htmlFor="type">Business Type</Label>
                  <Select onValueChange={(value) => form.setValue("type", value)}>
                    <SelectTrigger><SelectValue placeholder="Select type..." /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="retail">Retail</SelectItem>
                      <SelectItem value="pharma">Pharma</SelectItem>
                      <SelectItem value="grocery">Grocery</SelectItem>
                      <SelectItem value="manufacturing">Manufacturing</SelectItem>
                      <SelectItem value="e-commerce">E-commerce</SelectItem>
                    </SelectContent>
                  </Select>
                  {errors.type && <p className="text-destructive text-sm">{errors.type.message}</p>}
                </div>
                <div className="space-y-2">
                  <Label htmlFor="region">Region/City/Country</Label>
                  <Input id="region" {...register("region")} />
                  {errors.region && <p className="text-destructive text-sm">{errors.region.message}</p>}
                </div>
                <div className="space-y-2">
                  <Label htmlFor="targetCustomer">Target Customer Class</Label>
                  <Select onValueChange={(value) => form.setValue("targetCustomer", value)}>
                    <SelectTrigger><SelectValue placeholder="Select class..." /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="low">Low Income</SelectItem>
                      <SelectItem value="middle">Middle Income</SelectItem>
                      <SelectItem value="high">High Income</SelectItem>
                    </SelectContent>
                  </Select>
                  {errors.targetCustomer && <p className="text-destructive text-sm">{errors.targetCustomer.message}</p>}
                </div>
                <div className="space-y-2 md:col-span-2">
                  <Label htmlFor="productCount">Number of Products Sold</Label>
                  <Input id="productCount" type="number" {...register("productCount")} />
                  {errors.productCount && <p className="text-destructive text-sm">{errors.productCount.message}</p>}
                </div>
              </div>
            )}
            {step === 1 && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="monthlySales">Monthly Sales Volume (Rs)</Label>
                  <Input id="monthlySales" type="number" {...register("monthlySales")} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="avgProfitMargin">Average Profit Margin (%)</Label>
                  <Input id="avgProfitMargin" type="number" {...register("avgProfitMargin")} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="avgCostPerProduct">Average Cost per Product (Rs)</Label>
                  <Input id="avgCostPerProduct" type="number" {...register("avgCostPerProduct")} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="inventoryCapacity">Inventory Capacity (units)</Label>
                  <Input id="inventoryCapacity" type="number" {...register("inventoryCapacity")} />
                </div>
                <div className="space-y-2 md:col-span-2">
                  <Label htmlFor="supplierLeadTime">Supplier Lead Time (days)</Label>
                  <Input id="supplierLeadTime" type="number" {...register("supplierLeadTime")} />
                </div>
              </div>
            )}
            {step === 2 && (
              <div>
                <Label htmlFor="salesHistory" className="text-base">Upload Sales History</Label>
                <p className="text-muted-foreground text-sm mb-4">Provide a CSV file with columns: date, product_name, price, quantity.</p>
                <Input
                  id="salesHistory"
                  type="file"
                  accept=".csv"
                  {...salesHistoryRegistration}
                  onChange={(e) => {
                    salesHistoryRegistration.onChange(e); // Inform react-hook-form
                    if (e.target.files && e.target.files.length > 0) {
                      setSalesFile(e.target.files[0]);
                    } else {
                      setSalesFile(null);
                    }
                  }}
                  className="pt-2 h-auto"
                />
                {errors.salesHistory && <p className="text-destructive text-sm mt-2">{errors.salesHistory.message as string}</p>}
              </div>
            )}
            {step === 3 && (
              <div className="text-center">
                 {!analysisResult && !isLoading && (
                    <>
                        <h2 className="text-xl font-semibold">Ready to Analyze Your Data</h2>
                        <p className="text-muted-foreground mt-2 mb-6">Click the button below to run the AI analysis and complete your onboarding.</p>
                        <Button size="lg" onClick={handleSubmit(onFinalSubmit)}>
                            <Sparkles className="mr-2" />
                            Start AI Analysis
                        </Button>
                    </>
                 )}
                {isLoading && (
                  <div className="flex flex-col items-center justify-center h-48">
                    <Loader2 className="h-12 w-12 animate-spin text-primary mb-4" />
                    <p className="text-lg text-muted-foreground">Analyzing your data... this may take a moment.</p>
                  </div>
                )}
                {error && (
                    <Alert variant="destructive">
                        <AlertTitle>Analysis Failed</AlertTitle>
                        <AlertDescription>{error}</AlertDescription>
                    </Alert>
                )}
                {analysisResult && (
                    <div className="text-left space-y-8">
                        <Alert className="bg-accent/10 border-accent/30 text-accent-foreground">
                            <BarChartIcon className="h-5 w-5 text-accent" />
                            <AlertTitle className="text-accent font-bold">Analysis Complete!</AlertTitle>
                            <AlertDescription>
                                {analysisResult.summary}
                            </AlertDescription>
                        </Alert>
                
                        <Card>
                            <CardHeader>
                                <CardTitle>Optimal Price Ranges</CardTitle>
                                <CardDescription>Recommended price ranges to maximize revenue for your top products.</CardDescription>
                            </CardHeader>
                            <CardContent className="pl-2">
                                <ChartContainer config={{
                                    minPrice: { label: 'Min Price', color: 'hsl(var(--chart-2))' },
                                    maxPrice: { label: 'Max Price', color: 'hsl(var(--chart-1))' }
                                }} className="h-[300px] w-full">
                                    <ResponsiveContainer>
                                        <BarChart data={analysisResult.optimalPriceRanges} margin={{left: -10, right: 10}}>
                                            <CartesianGrid vertical={false} />
                                            <XAxis dataKey="productName" stroke="#888888" fontSize={12} tickLine={false} axisLine={false} interval={0}/>
                                            <YAxis stroke="#888888" fontSize={12} tickLine={false} axisLine={false} tickFormatter={(value) => `Rs${value}`} />
                                            <Tooltip cursor={{ fill: 'hsl(var(--background))' }} content={<ChartTooltipContent />} />
                                            <Legend wrapperStyle={{fontSize: "12px"}}/>
                                            <Bar dataKey="minPrice" name="Min Price" fill="var(--color-minPrice)" radius={[4, 4, 0, 0]} />
                                            <Bar dataKey="maxPrice" name="Max Price" fill="var(--color-maxPrice)" radius={[4, 4, 0, 0]} />
                                        </BarChart>
                                    </ResponsiveContainer>
                                </ChartContainer>
                            </CardContent>
                        </Card>
                
                        <div className="grid md:grid-cols-2 gap-6">
                            <Card>
                                <CardHeader>
                                    <CardTitle>Demand Analysis</CardTitle>
                                    <CardDescription>Price elasticity for your top products.</CardDescription>
                                </CardHeader>
                                <CardContent>
                                    <Table>
                                        <TableHeader>
                                            <TableRow>
                                                <TableHead>Product</TableHead>
                                                <TableHead>Elasticity</TableHead>
                                                <TableHead className="hidden sm:table-cell">Analysis</TableHead>
                                            </TableRow>
                                        </TableHeader>
                                        <TableBody>
                                            {analysisResult.demandElasticity.map((p) => (
                                                <TableRow key={p.productName}>
                                                    <TableCell className="font-medium">{p.productName}</TableCell>
                                                    <TableCell>
                                                        <Badge variant={p.elasticity < -1 ? "destructive" : "secondary"}>
                                                            {p.elasticity.toFixed(2)}
                                                        </Badge>
                                                    </TableCell>
                                                    <TableCell className="hidden sm:table-cell">{p.analysis}</TableCell>
                                                </TableRow>
                                            ))}
                                        </TableBody>
                                    </Table>
                                </CardContent>
                            </Card>
                
                            <Card>
                                <CardHeader>
                                    <CardTitle>Product Insights</CardTitle>
                                    <CardDescription>Baselines and classifications.</CardDescription>
                                </CardHeader>
                                <CardContent>
                                    <h4 className="font-medium text-sm mb-2">Essential Goods</h4>
                                    <div className="flex flex-wrap gap-2 mb-4">
                                        {analysisResult.essentialGoods.length > 0 ? analysisResult.essentialGoods.map(good => (
                                            <Badge key={good} variant="default" className="bg-accent text-accent-foreground">{good}</Badge>
                                        )) : <p className="text-sm text-muted-foreground">No essential goods identified.</p>}
                                    </div>
                                    <h4 className="font-medium text-sm mb-2">Pricing Baselines</h4>
                                     <Table>
                                        <TableHeader>
                                            <TableRow>
                                                <TableHead>Product</TableHead>
                                                <TableHead className="text-right">Baseline Price</TableHead>
                                            </TableRow>
                                        </TableHeader>
                                        <TableBody>
                                            {analysisResult.pricingBaseline.map((p) => (
                                                <TableRow key={p.productName}>
                                                    <TableCell className="font-medium">{p.productName}</TableCell>
                                                    <TableCell className="text-right">Rs{p.baselinePrice.toFixed(2)}</TableCell>
                                                </TableRow>
                                            ))}
                                        </TableBody>
                                    </Table>
                                </CardContent>
                            </Card>
                        </div>
                    </div>
                )}
              </div>
            )}
          </motion.div>
        </AnimatePresence>
      </CardContent>
      <CardFooter className="flex justify-between">
        {step > 0 && !analysisResult && (
          <Button variant="outline" onClick={prevStep} disabled={isLoading}>
            <ArrowLeft className="mr-2" />
            Previous
          </Button>
        )}
        {step > 0 && analysisResult && <div />}
        {step < steps.length - 1 && (
          <Button onClick={nextStep} disabled={!isValid}>
            Next
            <ArrowRight className="ml-2" />
          </Button>
        )}
        {analysisResult && (
            <Button asChild size="lg">
                <Link href="/dashboard">
                    Go to Dashboard
                    <CheckCircle className="ml-2" />
                </Link>
            </Button>
        )}
      </CardFooter>
    </Card>
  );
}
