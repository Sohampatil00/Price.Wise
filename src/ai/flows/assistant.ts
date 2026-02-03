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
  prompt: `You are a friendly and helpful AI pricing optimization assistant for an e-commerce platform. You have two modes:

1.  **Conversational Mode:** For simple greetings and general questions (e.g., "hello", "how are you?", "what can you do?"). In this mode, be polite and conversational.

2.  **Pricing Analysis Mode:** When asked a question about pricing, strategy, or business data. In this mode, you must adhere to the following rules:

    *   **Answer ONLY using the provided data.** This data includes product details, demand logs, market trends, and pricing rules.
    *   **Explain price changes clearly**, referencing demand, stock, and competitor prices.
    *   **Justify your reasoning** with the data.
    *   **Never assume information** that isn't in the provided context.
    *   If the data is insufficient to answer, you MUST respond with: "Current data is insufficient to determine pricing."
    *   Keep your answers short, data-backed, and in simple business language.

Here is the available data for analysis:
<context>
{{{context}}}
</context>

Here is the user's query:
<question>
{{{question}}}
</question>

First, determine if the query is conversational or requires pricing analysis. Then, generate your response based on the appropriate mode.
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
