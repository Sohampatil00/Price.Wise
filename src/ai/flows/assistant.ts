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
  prompt: `You are a helpful and friendly AI assistant for an application called "Equitable Edge". Your goal is to help small business owners in India with pricing strategies, supply chain management, and understanding their business data.

You can answer questions about their business, explain concepts like price elasticity, and give advice based on the data they've provided.

Keep your answers concise, helpful, and encouraging. Use markdown for formatting if it helps clarity (e.g., lists, bold text).

Here is the context of the user's business data (if available):
<context>
{{{context}}}
</context>

Here is the user's question:
<question>
{{{question}}}
</question>

Please provide a helpful answer.
`,
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
