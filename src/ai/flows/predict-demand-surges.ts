'use server';
/**
 * @fileOverview Predicts demand surges and identifies potential stock risks in advance.
 *
 * - predictDemandSurge - A function that handles the prediction of demand surges and stock risks.
 * - PredictDemandSurgeInput - The input type for the predictDemandSurge function.
 * - PredictDemandSurgeOutput - The return type for the predictDemandSurge function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const PredictDemandSurgeInputSchema = z.object({
  historicalSalesData: z
    .string()
    .describe('Historical sales data in CSV format.'),
  currentInventoryLevels: z
    .string()
    .describe('Current inventory levels for each product.'),
  leadTimeDays: z.number().describe('Supplier lead time in days.'),
});
export type PredictDemandSurgeInput = z.infer<typeof PredictDemandSurgeInputSchema>;

const SurgePredictionSchema = z.object({
    productName: z.string().describe('The name of the product.'),
    predictedSurgeDate: z.string().describe('The estimated date of the demand surge (e.g., YYYY-MM-DD).'),
    surgeFactor: z.number().describe('The predicted increase in demand (e.g., 1.5 for a 50% increase).'),
});

const StockRiskSchema = z.object({
    productName: z.string().describe('The name of the product.'),
    riskDate: z.string().describe('The estimated date of stockout risk (e.g., YYYY-MM-DD).'),
    daysOfStockLeft: z.number().describe('Estimated number of days of stock remaining at current consumption rates.'),
});

const RecommendedActionSchema = z.object({
    action: z.string().describe('A brief description of the recommended action (e.g., "Reorder Stock", "Adjust Price").'),
    productName: z.string().describe('The product this action applies to.'),
    details: z.string().describe('Specific details for the action, such as quantity to reorder or new price point.'),
    priority: z.enum(['high', 'medium', 'low']).describe('The priority of the action.'),
});


const PredictDemandSurgeOutputSchema = z.object({
  summary: z.string().describe('A brief, high-level summary of the supply chain analysis.'),
  predictedDemandSurges: z.array(SurgePredictionSchema).describe('A list of predicted demand surges for key products.'),
  stockRiskProducts: z.array(StockRiskSchema).describe('A list of products at risk of stocking out.'),
  recommendedActions: z.array(RecommendedActionSchema).describe('A prioritized list of actions to mitigate risks and capitalize on opportunities.'),
});
export type PredictDemandSurgeOutput = z.infer<typeof PredictDemandSurgeOutputSchema>;

export async function predictDemandSurge(
  input: PredictDemandSurgeInput
): Promise<PredictDemandSurgeOutput> {
  return predictDemandSurgeFlow(input);
}

const prompt = ai.definePrompt({
  name: 'predictDemandSurgePrompt',
  input: {schema: PredictDemandSurgeInputSchema},
  output: {schema: PredictDemandSurgeOutputSchema},
  prompt: `You are an expert supply chain and pricing analyst. Analyze the provided data to predict demand surges and stock risks.

Historical Sales Data: {{{historicalSalesData}}}
Current Inventory Levels: {{{currentInventoryLevels}}}
Supplier Lead Time (days): {{{leadTimeDays}}}

Based on this information:
1. Provide a brief, high-level summary of the analysis.
2. Predict potential demand surges for key products. Include the product name, estimated surge date, and the factor of demand increase.
3. Identify products at risk of stockout. For each, provide the product name, the estimated risk date, and the estimated days of stock left.
4. Recommend prioritized actions (high, medium, low) to mitigate risks. Actions could include reordering, price adjustments, or stock redistribution. Be specific in your recommendations.

Output MUST be a valid JSON object matching the defined schema.`,
});

const predictDemandSurgeFlow = ai.defineFlow(
  {
    name: 'predictDemandSurgeFlow',
    inputSchema: PredictDemandSurgeInputSchema,
    outputSchema: PredictDemandSurgeOutputSchema,
    model: 'gemini-1.5-flash-latest',
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
