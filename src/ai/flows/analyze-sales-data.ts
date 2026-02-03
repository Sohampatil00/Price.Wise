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
      'Historical sales data in CSV format. Columns should include date, product_name, price, and quantity.'
    ),
  businessDetails: z
    .string()
    .optional()
    .describe('Additional details about the business to improve the analysis.'),
});
export type AnalyzeSalesDataInput = z.infer<typeof AnalyzeSalesDataInputSchema>;

const ProductPriceRangeSchema = z.object({
  productName: z.string().describe('The name of the product.'),
  minPrice: z.number().describe('The recommended minimum price.'),
  maxPrice: z.number().describe('The recommended maximum price.'),
});

const ProductBaselineSchema = z.object({
  productName: z.string().describe('The name of the product.'),
  baselinePrice: z.number().describe('The baseline fair price.'),
});

const ProductElasticitySchema = z.object({
    productName: z.string().describe('The name of the product.'),
    elasticity: z.number().describe('The price elasticity of demand (e.g., -1.5). A value between -1 and 0 is inelastic, less than -1 is elastic.'),
    analysis: z.string().describe('A brief analysis of the elasticity.'),
});

const AnalyzeSalesDataOutputSchema = z.object({
  summary: z.string().describe('A high-level summary of the analysis findings in plain English.'),
  demandElasticity: z.array(ProductElasticitySchema).describe('Analysis of demand elasticity for the top 3-5 products.'),
  optimalPriceRanges: z.array(ProductPriceRangeSchema).describe('Recommended price ranges for the top 3-5 products to maximize revenue.'),
  essentialGoods: z.array(z.string()).describe('A list of product names classified as essential goods based on their necessity to the target customer.'),
  pricingBaseline: z.array(ProductBaselineSchema).describe('A baseline of what is a fair price for the top 3-5 products during normal times.'),
});
export type AnalyzeSalesDataOutput = z.infer<typeof AnalyzeSalesDataOutputSchema>;


export async function analyzeSalesData(input: AnalyzeSalesDataInput): Promise<AnalyzeSalesDataOutput> {
  return analyzeSalesDataFlow(input);
}

const analyzeSalesDataPrompt = ai.definePrompt({
  name: 'analyzeSalesDataPrompt',
  input: {schema: AnalyzeSalesDataInputSchema},
  output: {schema: AnalyzeSalesDataOutputSchema},
  prompt: `You are an expert pricing analyst. Analyze the provided sales data to determine demand elasticity, suggest optimal price ranges, identify essential goods, and establish a pricing baseline.

Sales Data:
{{{salesData}}}

Business Details:
{{{businessDetails}}}

Instructions:
1.  Provide a high-level summary of your findings in a few sentences.
2.  Analyze the sales data to determine the price elasticity of demand for the main products (top 3-5 by volume). A value between -1 and 0 is inelastic, less than -1 is elastic. Provide a brief text analysis for each.
3.  Identify optimal price ranges (min and max) for these products to maximize revenue and profit.
4.  Categorize products as essential goods based on their type and necessity to the target customer class mentioned in the business details.
5.  Establish a baseline fair price for the main products based on typical margins during non-crisis times.

Output MUST be a valid JSON object matching the defined schema.
`,
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
