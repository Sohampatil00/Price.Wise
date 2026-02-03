"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Warehouse, Loader2, Sparkles, AlertTriangle, Check, ListChecks } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { predictDemandSurge, PredictDemandSurgeOutput } from "@/ai/flows/predict-demand-surges";

const demandSchema = z.object({
  historicalSalesData: z.string().min(10, "Please provide sample sales data."),
  currentInventoryLevels: z.string().min(5, "Please provide sample inventory data."),
  leadTimeDays: z.coerce.number().min(0, "Lead time must be non-negative."),
});

type DemandFormData = z.infer<typeof demandSchema>;

export default function SupplyChainPage() {
  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState<PredictDemandSurgeOutput | null>(null);
  const [error, setError] = useState<string | null>(null);

  const form = useForm<DemandFormData>({
    resolver: zodResolver(demandSchema),
    defaultValues: {
      historicalSalesData: "date,product_id,sales\n2023-01-01,P1,100\n2023-01-02,P1,120",
      currentInventoryLevels: "product_id,stock\nP1,500\nP2,300",
      leadTimeDays: 14,
    },
  });

  const { register, handleSubmit, formState: { errors } } = form;

  const onSubmit = async (data: DemandFormData) => {
    setIsLoading(true);
    setError(null);
    setResult(null);
    try {
      const response = await predictDemandSurge(data);
      setResult(response);
    } catch (e) {
      setError("Failed to predict demand. Please try again later.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="p-4 md:p-8">
      <h2 className="text-3xl font-bold tracking-tight font-headline mb-4">
        Predictive Shortage Prevention
      </h2>
      <div className="grid gap-8 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Demand Surge Prediction</CardTitle>
            <CardDescription>
              Analyze historical data and inventory to predict demand surges and identify stockout risks.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
              <div>
                <Label htmlFor="historicalSalesData">Historical Sales Data (CSV format)</Label>
                <Textarea id="historicalSalesData" {...register("historicalSalesData")} rows={5} />
                {errors.historicalSalesData && <p className="text-destructive text-sm">{errors.historicalSalesData.message}</p>}
              </div>
              <div>
                <Label htmlFor="currentInventoryLevels">Current Inventory Levels (CSV format)</Label>
                <Textarea id="currentInventoryLevels" {...register("currentInventoryLevels")} rows={3} />
                {errors.currentInventoryLevels && <p className="text-destructive text-sm">{errors.currentInventoryLevels.message}</p>}
              </div>
              <div>
                <Label htmlFor="leadTimeDays">Supplier Lead Time (days)</Label>
                <Input id="leadTimeDays" type="number" {...register("leadTimeDays")} />
                {errors.leadTimeDays && <p className="text-destructive text-sm">{errors.leadTimeDays.message}</p>}
              </div>
              <Button type="submit" disabled={isLoading} className="w-full">
                {isLoading ? (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                ) : (
                  <Sparkles className="mr-2 h-4 w-4" />
                )}
                Predict Demand
              </Button>
            </form>
          </CardContent>
        </Card>
        <div className="space-y-4">
            {result && (
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                        <Warehouse className="text-primary"/>
                        Supply Chain Analysis
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-6">
                        <Alert>
                            <Sparkles className="h-4 w-4"/>
                            <AlertTitle>Predicted Demand Surges</AlertTitle>
                            <AlertDescription className="whitespace-pre-wrap">{result.predictedDemandSurges}</AlertDescription>
                        </Alert>
                         <Alert variant="destructive">
                            <AlertTriangle className="h-4 w-4"/>
                            <AlertTitle>Stock Risk Products</AlertTitle>
                            <AlertDescription className="whitespace-pre-wrap">{result.stockRiskProducts}</AlertDescription>
                        </Alert>
                         <Alert className="bg-accent/10 border-accent/20">
                            <ListChecks className="h-4 w-4 text-accent"/>
                            <AlertTitle className="text-accent">Recommended Actions</AlertTitle>
                            <AlertDescription className="whitespace-pre-wrap text-accent-foreground/80">{result.recommendedActions}</AlertDescription>
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
