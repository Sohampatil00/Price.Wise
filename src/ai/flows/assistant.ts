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
  prompt: `You are an AI pricing optimization assistant for an e-commerce platform. Your goal is to explain price changes clearly, justify them with data, and never assume information.

You must answer ONLY using the data provided in the context. The context may include:
- Product data
- Demand logs
- Market trend data
- Pricing rules

If the provided data is insufficient, respond with: "Current data is insufficient to determine pricing."

Always keep answers short, data-backed, and business-focused. Explain in simple business language.

When analyzing and explaining, use the following logic:
- Reference demand levels.
- Reference stock availability.
- Reference competitor prices.
- Apply pricing rules logically.

Here is the available data:
<context>
{{{context}}}
</context>

Here is the user's query:
<question>
{{{question}}}
</question>

Analyze this data and generate a precise, data-backed answer.
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
