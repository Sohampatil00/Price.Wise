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

const PredictDemandSurgeOutputSchema = z.object({
  predictedDemandSurges: z
    .string()
    .describe('Predicted demand surges for each product with dates.'),
  stockRiskProducts: z
    .string()
    .describe('Products at risk of stockout with estimated risk dates.'),
  recommendedActions: z
    .string()
    .describe(
      'Recommended actions, including pricing adjustments, reorder alerts, and stock distribution changes.'
    ),
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

Based on this information, predict potential demand surges, identify products at risk of stockout, and recommend actions to prevent shortages. Consider pricing adjustments, reorder alerts, and stock distribution changes.  Your analysis should be thorough and specific.

Output should be in a human-readable format.`,
});

const predictDemandSurgeFlow = ai.defineFlow(
  {
    name: 'predictDemandSurgeFlow',
    inputSchema: PredictDemandSurgeInputSchema,
    outputSchema: PredictDemandSurgeOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
