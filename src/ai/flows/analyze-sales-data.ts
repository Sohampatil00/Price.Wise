'use server';

/**
 * @fileOverview Analyzes historical sales data to identify demand elasticity and optimal price ranges.
 *
 * - analyzeSalesData - Analyzes sales data to provide insights on demand elasticity and price optimization.
 * - AnalyzeSalesDataInput - The input type for the analyzeSalesData function.
 * - AnalyzeSalesDataOutput - The return type for the analyzeSalesData function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const AnalyzeSalesDataInputSchema = z.object({
  salesData: z
    .string()
    .describe(
      'Historical sales data in CSV format. Columns should include date, product ID, price, and quantity sold.'
    ),
  businessDetails: z
    .string()
    .optional()
    .describe('Additional details about the business to improve the analysis.'),
});
export type AnalyzeSalesDataInput = z.infer<typeof AnalyzeSalesDataInputSchema>;

const AnalyzeSalesDataOutputSchema = z.object({
  demandElasticity: z
    .string()
    .describe(
      'Analysis of demand elasticity for each product, indicating how demand changes with price.'
    ),
  optimalPriceRanges: z
    .string()
    .describe(
      'Recommended price ranges for each product to maximize revenue and profit.'
    ),
  essentialGoodsTags: z
    .string()
    .describe('Categorization of products by necessity to the target customer.'),
  pricingBaseline: z
    .string()
    .describe('A baseline of what is a fair price during normal times.'),
});
export type AnalyzeSalesDataOutput = z.infer<typeof AnalyzeSalesDataOutputSchema>;

export async function analyzeSalesData(input: AnalyzeSalesDataInput): Promise<AnalyzeSalesDataOutput> {
  return analyzeSalesDataFlow(input);
}

const analyzeSalesDataPrompt = ai.definePrompt({
  name: 'analyzeSalesDataPrompt',
  input: {schema: AnalyzeSalesDataInputSchema},
  output: {schema: AnalyzeSalesDataOutputSchema},
  prompt: `You are an expert pricing analyst. Analyze the provided sales data to determine demand elasticity and suggest optimal price ranges.

Sales Data: {{{salesData}}}

Business Details: {{{businessDetails}}}

Instructions:

1.  Analyze the sales data to determine the demand elasticity for each product.
2.  Identify optimal price ranges for each product to maximize revenue and profit, considering factors like cost per product and competitor pricing.
3.  Categorize products as essential goods based on their necessity to the target customer class (low/middle/high income), as determined in the onboarding data.
4.  Establish a pricing baseline based on typical margins during non-crisis times.

Output MUST be in plain English.

Output: {
  "demandElasticity": "",
  "optimalPriceRanges": "",
  "essentialGoodsTags": "",
  "pricingBaseline": ""
}`,
});

const analyzeSalesDataFlow = ai.defineFlow(
  {
    name: 'analyzeSalesDataFlow',
    inputSchema: AnalyzeSalesDataInputSchema,
    outputSchema: AnalyzeSalesDataOutputSchema,
  },
  async input => {
    const {output} = await analyzeSalesDataPrompt(input);
    return output!;
  }
);
