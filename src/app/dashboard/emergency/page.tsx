"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { ShieldAlert, Loader2, Sparkles, CheckCircle, XCircle } from "lucide-react";
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
import { Textarea } from "@/components/ui/textarea";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { autoActivateEmergencyPricing, AutoActivateEmergencyPricingOutput } from "@/ai/flows/auto-activate-emergency-pricing";

const crisisSchema = z.object({
  source: z.string().min(1, "Source is required"),
  type: z.string().min(1, "Crisis type is required"),
  location: z.string().min(1, "Location is required"),
  severity: z.string().min(1, "Severity is required"),
  essentialGoodsImpacted: z.string().min(1, "Please list impacted goods."),
  details: z.string().min(1, "Details are required"),
});

type CrisisFormData = z.infer<typeof crisisSchema>;

export default function EmergencyPage() {
  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState<AutoActivateEmergencyPricingOutput | null>(null);
  const [error, setError] = useState<string | null>(null);

  const form = useForm<CrisisFormData>({
    resolver: zodResolver(crisisSchema),
    defaultValues: {
      source: "FEMA",
      type: "Natural Disaster",
      location: "Coastal Region",
      severity: "high",
      essentialGoodsImpacted: "Water, Batteries, Canned Food",
      details: "Hurricane expected to make landfall in 48 hours.",
    },
  });

  const { register, handleSubmit, formState: { errors } } = form;

  const onSubmit = async (data: CrisisFormData) => {
    setIsLoading(true);
    setError(null);
    setResult(null);
    try {
      const crisisAlert = {
        ...data,
        essentialGoodsImpacted: data.essentialGoodsImpacted.split(',').map(s => s.trim()),
      };
      const response = await autoActivateEmergencyPricing({ crisisAlert });
      setResult(response);
    } catch (e) {
      setError("Failed to process crisis alert. Please try again later.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="p-4 md:p-8">
      <h2 className="text-3xl font-bold tracking-tight font-headline mb-4">
        Emergency Mode Auto-Activation
      </h2>
      <div className="grid gap-8 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Simulate Crisis Alert</CardTitle>
            <CardDescription>
              Trigger the AI to analyze a crisis alert and determine if emergency pricing should be activated.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="source">Source</Label>
                  <Input id="source" {...register("source")} />
                  {errors.source && <p className="text-destructive text-sm">{errors.source.message}</p>}
                </div>
                <div className="space-y-2">
                  <Label htmlFor="type">Crisis Type</Label>
                   <Select onValueChange={(v) => form.setValue("type", v)} defaultValue="Natural Disaster">
                    <SelectTrigger><SelectValue/></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Natural Disaster">Natural Disaster</SelectItem>
                      <SelectItem value="Health Outbreak">Health Outbreak</SelectItem>
                      <SelectItem value="Supply Chain Interruption">Supply Chain Interruption</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

               <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                 <div className="space-y-2">
                    <Label htmlFor="location">Location</Label>
                    <Input id="location" {...register("location")} />
                    {errors.location && <p className="text-destructive text-sm">{errors.location.message}</p>}
                </div>
                <div className="space-y-2">
                  <Label htmlFor="severity">Severity</Label>
                   <Select onValueChange={(v) => form.setValue("severity", v)} defaultValue="high">
                    <SelectTrigger><SelectValue/></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="low">Low</SelectItem>
                      <SelectItem value="medium">Medium</SelectItem>
                      <SelectItem value="high">High</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
               </div>
              
              <div>
                <Label htmlFor="essentialGoodsImpacted">Essential Goods Impacted (comma-separated)</Label>
                <Input id="essentialGoodsImpacted" {...register("essentialGoodsImpacted")} />
                {errors.essentialGoodsImpacted && <p className="text-destructive text-sm">{errors.essentialGoodsImpacted.message}</p>}
              </div>

              <div>
                <Label htmlFor="details">Details</Label>
                <Textarea id="details" {...register("details")} />
                {errors.details && <p className="text-destructive text-sm">{errors.details.message}</p>}
              </div>

              <Button type="submit" disabled={isLoading} className="w-full">
                {isLoading ? (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                ) : (
                  <Sparkles className="mr-2 h-4 w-4" />
                )}
                Analyze Crisis
              </Button>
            </form>
          </CardContent>
        </Card>
        <div className="space-y-4">
            {result && (
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                        <ShieldAlert className="text-primary"/>
                        AI Emergency Response
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <Alert variant={result.pricingDecision.shouldFreezePricing ? "destructive" : "default"}>
                            {result.pricingDecision.shouldFreezePricing ? <CheckCircle className="h-4 w-4" /> : <XCircle className="h-4 w-4" />}
                            <AlertTitle>{result.pricingDecision.shouldFreezePricing ? "Pricing Frozen" : "Pricing Not Frozen"}</AlertTitle>
                            <AlertDescription>{result.pricingDecision.reason}</AlertDescription>
                        </Alert>
                        <Alert>
                            <AlertTitle>Notifications</AlertTitle>
                            <AlertDescription className="whitespace-pre-wrap">
                                {result.notifications.join('\n')}
                            </AlertDescription>
                        </Alert>
                         <Alert>
                            <AlertTitle>Audit Log</AlertTitle>
                            <AlertDescription className="font-mono text-xs">{result.auditLog}</AlertDescription>
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
