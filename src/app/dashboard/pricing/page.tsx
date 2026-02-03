"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { DollarSign, Loader2, Sparkles } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { calculateFairPrice, CalculateFairPriceOutput } from "@/ai/flows/dynamic-pricing-based-on-equity";
import { Switch } from "@/components/ui/switch";

const pricingSchema = z.object({
  basePrice: z.coerce.number().min(0.01, "Base price must be positive."),
  regionalIncomeLevel: z.string().min(1, "Region is required."),
  costOfLiving: z.coerce.number().min(0, "Cost of living must be positive."),
  demandPressure: z.coerce.number().min(0).max(1, "Must be between 0 and 1."),
  supplyAvailability: z.coerce.number().min(0).max(1, "Must be between 0 and 1."),
  isEssentialGood: z.boolean(),
});

type PricingFormData = z.infer<typeof pricingSchema>;

export default function PricingPage() {
  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState<CalculateFairPriceOutput | null>(null);
  const [error, setError] = useState<string | null>(null);

  const form = useForm<PricingFormData>({
    resolver: zodResolver(pricingSchema),
    defaultValues: {
      basePrice: 100,
      regionalIncomeLevel: "medium",
      costOfLiving: 1.0,
      demandPressure: 0.5,
      supplyAvailability: 0.8,
      isEssentialGood: false,
    },
  });

  const { register, handleSubmit, control, formState: { errors } } = form;

  const onSubmit = async (data: PricingFormData) => {
    setIsLoading(true);
    setError(null);
    setResult(null);
    try {
      const response = await calculateFairPrice(data);
      setResult(response);
    } catch (e) {
      setError("Failed to calculate fair price. Please try again later.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="p-4 md:p-8">
      <h2 className="text-3xl font-bold tracking-tight font-headline mb-4">
        Equity-Based Pricing
      </h2>
      <div className="grid gap-8 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Fair Price Calculator</CardTitle>
            <CardDescription>
              Use the AI-powered algorithm to calculate a fair price based on market and social factors.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="basePrice">Base Price (Rs)</Label>
                  <Input id="basePrice" type="number" step="0.01" {...register("basePrice")} />
                  {errors.basePrice && <p className="text-destructive text-sm">{errors.basePrice.message}</p>}
                </div>
                 <div className="space-y-2">
                  <Label htmlFor="regionalIncomeLevel">Regional Income Level</Label>
                   <Select onValueChange={(v) => form.setValue("regionalIncomeLevel", v)} defaultValue="medium">
                    <SelectTrigger><SelectValue/></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="low">Low</SelectItem>
                      <SelectItem value="medium">Medium</SelectItem>
                      <SelectItem value="high">High</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

               <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                 <div className="space-y-2">
                    <Label htmlFor="costOfLiving">Cost of Living Index</Label>
                    <Input id="costOfLiving" type="number" step="0.1" {...register("costOfLiving")} />
                    {errors.costOfLiving && <p className="text-destructive text-sm">{errors.costOfLiving.message}</p>}
                </div>
                <div className="flex items-center space-x-2 pt-6">
                    <Switch id="isEssentialGood" onCheckedChange={(c) => form.setValue("isEssentialGood", c)} />
                    <Label htmlFor="isEssentialGood">Is an Essential Good?</Label>
                </div>
               </div>
              
              <div>
                <Label>Demand Pressure: {form.watch("demandPressure")}</Label>
                <Input type="range" min="0" max="1" step="0.1" {...register("demandPressure")} />
              </div>

              <div>
                <Label>Supply Availability: {form.watch("supplyAvailability")}</Label>
                <Input type="range" min="0" max="1" step="0.1" {...register("supplyAvailability")} />
              </div>

              <Button type="submit" disabled={isLoading} className="w-full">
                {isLoading ? (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                ) : (
                  <Sparkles className="mr-2 h-4 w-4" />
                )}
                Calculate Fair Price
              </Button>
            </form>
          </CardContent>
        </Card>
        <div className="space-y-4">
            {result && (
                <Card className="bg-primary/5">
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                        <DollarSign className="text-primary"/>
                        AI Pricing Recommendation
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="text-center">
                            <p className="text-sm text-muted-foreground">Calculated Fair Price</p>
                            <p className="text-5xl font-bold text-primary">Rs{result.fairPrice.toFixed(2)}</p>
                        </div>
                        <Alert>
                            <Sparkles className="h-4 w-4" />
                            <AlertTitle>Reasoning</AlertTitle>
                            <AlertDescription>{result.reasoning}</AlertDescription>
                        </Alert>
                    </CardContent>
                </Card>
            )}
            {error && <Alert variant="destructive"><AlertTitle>Error</AlertTitle><AlertDescription>{error}</AlertDescription></Alert>}
        </div>
      </div>
    </div>
  );
}
