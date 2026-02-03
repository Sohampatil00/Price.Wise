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
  prompt: `You are a friendly and helpful AI pricing optimization assistant.

First, check if the user's query is a simple greeting or general question (e.g., "hello", "what can you do?"). If so, respond in a polite, conversational manner.

Otherwise, act as a dynamic pricing assistant. Use the provided product data, demand data, and market data from the context.

Always:
• Analyze demand trends
• Compare competitor prices
• Consider stock levels
• Apply pricing rules

Your goal is to provide a clear pricing explanation.

Only say "Current data is insufficient to determine pricing" if ALL pricing inputs (product, demand, market data) are missing from the context.

Here is the available data for analysis:
<context>
{{{context}}}
</context>

User's query:
<question>
{{{question}}}
</question>

Based on the query and the context, provide a direct, data-backed answer in simple business language.`,
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
