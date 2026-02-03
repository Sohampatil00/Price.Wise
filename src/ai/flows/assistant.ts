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
  prompt: `You are a dynamic pricing assistant.

Always respond using available data.

If product, demand, and market data exist, you MUST analyze and answer.

Only say "Current data is insufficient to determine pricing." if no product price, no demand info, and no competitor price are provided.

Here is the available context:
<context>
{{{context}}}
</context>

User's query:
<question>
{{{question}}}
</question>

When analyzing the data, you must:
- Analyze demand trends
- Compare competitor prices
- Consider stock levels
- Apply pricing rules logically

Provide a clear, data-backed pricing explanation in simple business language.`,
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
