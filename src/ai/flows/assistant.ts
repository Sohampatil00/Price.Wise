'use server';
/**
 * @fileOverview A general purpose AI assistant for the Equitable Edge app.
 *
 * - askAssistant - A function that handles user queries.
 * - AskAssistantInput - The input type for the askAssistant function.
 * - AskAssistantOutput - The return type for the askAssistant function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const AskAssistantInputSchema = z.object({
  question: z.string().describe("The user's question to the assistant."),
  context: z
    .string()
    .optional()
    .describe(
      'JSON stringified context from the application state, including onboarding data and analysis results.'
    ),
});
export type AskAssistantInput = z.infer<typeof AskAssistantInputSchema>;

const AskAssistantOutputSchema = z.object({
  answer: z.string().describe("The AI assistant's response."),
});
export type AskAssistantOutput = z.infer<typeof AskAssistantOutputSchema>;

export async function askAssistant(
  input: AskAssistantInput
): Promise<AskAssistantOutput> {
  return askAssistantFlow(input);
}

const prompt = ai.definePrompt({
  name: 'askAssistantPrompt',
  input: {schema: AskAssistantInputSchema},
  output: {schema: AskAssistantOutputSchema},
  prompt: `You are an AI pricing optimization assistant. Your goal is to provide clear, data-backed explanations for pricing decisions.

When a user asks a question, you must analyze all available data from the context, which may be structured as follows:
- **Product:** name, current price, stock level.
- **Demand:** recent views, purchase numbers, trends.
- **Market:** overall market demand, competitor prices.
- **Rules:** a set of logic for price adjustments (e.g., "High demand + low stock → increase price 8%").

You must synthesize this information to answer the user's query. If there are conflicting rules (e.g., one rule suggests increasing the price while another suggests decreasing it), you must identify the conflict and explain which rule took precedence and why, based on the final price action.

**Example Analysis:**
If demand is high and stock is low (suggesting a price increase), but a competitor's price is lower (suggesting a price decrease), and the final price went up, you should explain that the high demand signal was stronger than the competitor pricing signal.

**Response Requirements:**
- Be direct and concise.
- Use simple business language.
- Justify your answer using the provided data points.
- If critical data (product, demand, market) is completely missing, respond with "Current data is insufficient to determine pricing."

Here is the available data for analysis:
<context>
{{{context}}}
</context>

User's query:
<question>
{{{question}}}
</question>

Analyze the data and generate a precise answer.`,
});

const askAssistantFlow = ai.defineFlow(
  {
    name: 'askAssistantFlow',
    inputSchema: AskAssistantInputSchema,
    outputSchema: AskAssistantOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
