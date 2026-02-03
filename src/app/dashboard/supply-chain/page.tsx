"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Warehouse, Loader2, Sparkles, AlertTriangle, ListChecks, TrendingUp } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { predictDemandSurge, PredictDemandSurgeOutput } from "@/ai/flows/predict-demand-surges";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";

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
                        <CardDescription>{result.summary}</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-6">
                        <div>
                            <h3 className="font-semibold mb-2 flex items-center gap-2"><TrendingUp className="h-5 w-5 text-primary"/>Predicted Demand Surges</h3>
                            {result.predictedDemandSurges.length > 0 ? (
                                <Table>
                                    <TableHeader>
                                        <TableRow>
                                            <TableHead>Product</TableHead>
                                            <TableHead>Surge Date</TableHead>
                                            <TableHead>Increase</TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {result.predictedDemandSurges.map((surge) => (
                                            <TableRow key={surge.productName}>
                                                <TableCell className="font-medium">{surge.productName}</TableCell>
                                                <TableCell>{surge.predictedSurgeDate}</TableCell>
                                                <TableCell className="font-mono">{surge.surgeFactor}x</TableCell>
                                            </TableRow>
                                        ))}
                                    </TableBody>
                                </Table>
                            ) : (
                                <p className="text-sm text-muted-foreground p-4 text-center">No significant demand surges predicted.</p>
                            )}
                        </div>

                        <div>
                            <h3 className="font-semibold mb-2 flex items-center gap-2"><AlertTriangle className="h-5 w-5 text-destructive"/>Stock Risk Products</h3>
                            {result.stockRiskProducts.length > 0 ? (
                                <Table>
                                    <TableHeader>
                                        <TableRow>
                                            <TableHead>Product</TableHead>
                                            <TableHead>Est. Stockout</TableHead>
                                            <TableHead>Days Left</TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {result.stockRiskProducts.map((risk) => (
                                            <TableRow key={risk.productName}>
                                                <TableCell className="font-medium">{risk.productName}</TableCell>
                                                <TableCell>{risk.riskDate}</TableCell>
                                                <TableCell>{risk.daysOfStockLeft} days</TableCell>
                                            </TableRow>
                                        ))}
                                    </TableBody>
                                </Table>
                            ) : (
                                <p className="text-sm text-muted-foreground p-4 text-center">No products at immediate risk of stockout.</p>
                            )}
                        </div>

                        <div>
                            <h3 className="font-semibold mb-2 flex items-center gap-2"><ListChecks className="h-5 w-5 text-accent"/>Recommended Actions</h3>
                            {result.recommendedActions.length > 0 ? (
                                <Table>
                                    <TableHeader>
                                        <TableRow>
                                            <TableHead>Priority</TableHead>
                                            <TableHead>Action</TableHead>
                                            <TableHead>Product</TableHead>
                                            <TableHead>Details</TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {result.recommendedActions.map((action, index) => (
                                            <TableRow key={index}>
                                                <TableCell>
                                                    <Badge variant={action.priority === 'high' ? 'destructive' : action.priority === 'medium' ? 'secondary' : 'outline'} className="capitalize">
                                                        {action.priority}
                                                    </Badge>
                                                </TableCell>
                                                <TableCell>{action.action}</TableCell>
                                                <TableCell>{action.productName}</TableCell>
                                                <TableCell>{action.details}</TableCell>
                                            </TableRow>
                                        ))}
                                    </TableBody>
                                </Table>
                            ) : (
                                <p className="text-sm text-muted-foreground p-4 text-center">No immediate actions recommended.</p>
                            )}
                        </div>
                    </CardContent>
                </Card>
            )}
            {error && <Alert variant="destructive"><AlertTitle>Error</AlertTitle><AlertDescription>{error}</AlertDescription></Alert>}
        </div>
      </div>
    </div>
  );
}
