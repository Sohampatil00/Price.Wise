'use server';
/**
 * @fileOverview Implements dynamic pricing based on regional income levels using AI.
 *
 * - calculateFairPrice - Calculates a fair price based on regional income and other factors.
 * - CalculateFairPriceInput - Input type for the calculateFairPrice function.
 * - CalculateFairPriceOutput - Return type for the calculateFairPrice function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const CalculateFairPriceInputSchema = z.object({
  regionalIncomeLevel: z
    .string()
    .describe(
      'The regional income level (e.g., low, medium, high).',
    ),
  costOfLiving: z.number().describe('The cost of living in the region.'),
  demandPressure: z.number().describe('The demand pressure (e.g., 0 to 1).'),
  supplyAvailability: z
    .number()
    .describe('The supply availability (e.g., 0 to 1).'),
  basePrice: z.number().describe('The base price of the product.'),
  isEssentialGood: z.boolean().describe('Whether the product is an essential good.'),
});
export type CalculateFairPriceInput = z.infer<typeof CalculateFairPriceInputSchema>;

const CalculateFairPriceOutputSchema = z.object({
  fairPrice: z.number().describe('The calculated fair price for the product.'),
  reasoning: z.string().describe('The reasoning behind the price adjustment.'),
});
export type CalculateFairPriceOutput = z.infer<typeof CalculateFairPriceOutputSchema>;

export async function calculateFairPrice(input: CalculateFairPriceInput): Promise<CalculateFairPriceOutput> {
  return calculateFairPriceFlow(input);
}

const prompt = ai.definePrompt({
  name: 'calculateFairPricePrompt',
  input: {schema: CalculateFairPriceInputSchema},
  output: {schema: CalculateFairPriceOutputSchema},
  prompt: `You are an AI pricing specialist that helps businesses determine the optimal price of goods based on the region in which they are sold.

  Given the following information, calculate a fair price for the product:

  Regional Income Level: {{{regionalIncomeLevel}}}
  Cost of Living: {{{costOfLiving}}}
  Demand Pressure: {{{demandPressure}}}
  Supply Availability: {{{supplyAvailability}}}
  Base Price: {{{basePrice}}}
  Is Essential Good: {{{isEssentialGood}}}

  Consider that in low-income regions, essential goods should have reduced pricing, while high-income regions can allow for a small premium. Balance profits across regions to ensure fairness and maximize overall revenue.

  Return the fair price and the reasoning behind the adjustment.
  `,
});

const calculateFairPriceFlow = ai.defineFlow(
  {
    name: 'calculateFairPriceFlow',
    inputSchema: CalculateFairPriceInputSchema,
    outputSchema: CalculateFairPriceOutputSchema,
    model: 'gemini-2.5-flash',
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
