// src/ai/flows/auto-activate-emergency-pricing.ts
'use server';
/**
 * @fileOverview This file defines a Genkit flow for automatically activating emergency pricing based on crisis alerts.
 *
 * - autoActivateEmergencyPricing - A function that triggers the emergency pricing flow.
 * - AutoActivateEmergencyPricingInput - The input type for the autoActivateEmergencyPricing function.
 * - AutoActivateEmergencyPricingOutput - The return type for the autoActivateEmergencyPricing function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const CrisisAlertSchema = z.object({
  source: z.string().describe('The authoritative source of the crisis alert (e.g., WHO, FEMA).'),
  type: z.string().describe('The type of crisis (e.g., natural disaster, health outbreak).'),
  location: z.string().describe('The affected region or location.'),
  severity: z.string().describe('The severity level of the crisis (e.g., high, medium, low).'),
  essentialGoodsImpacted: z.array(z.string()).describe('List of essential goods potentially impacted by the crisis.'),
  details: z.string().describe('Additional details about the crisis alert.'),
});

const AutoActivateEmergencyPricingInputSchema = z.object({
  crisisAlert: CrisisAlertSchema.describe('Details of the crisis alert triggering the emergency pricing.'),
});
export type AutoActivateEmergencyPricingInput = z.infer<typeof AutoActivateEmergencyPricingInputSchema>;

const PricingDecisionSchema = z.object({
  shouldFreezePricing: z.boolean().describe('Whether to freeze pricing on essential goods.'),
  reason: z.string().describe('The detailed reasoning behind the pricing freeze decision, considering the crisis alert details.'),
});

const AutoActivateEmergencyPricingOutputSchema = z.object({
  pricingDecision: PricingDecisionSchema.describe('The decision made regarding pricing in response to the crisis alert.'),
  notifications: z.array(z.string()).describe('A list of notifications sent to relevant stakeholders (sellers, regulators).'),
  auditLog: z.string().describe('A log entry detailing the changes made and the reasoning behind them.'),
});
export type AutoActivateEmergencyPricingOutput = z.infer<typeof AutoActivateEmergencyPricingOutputSchema>;


const getReasoning = ai.defineTool(
  {
    name: 'getReasoning',
    description: 'Provides the reasoning for freezing or not freezing the price, which will be included in the audit log.',
    inputSchema: z.object({
      crisisAlertDetails: z.string().describe('The type, location, and severity of the crisis.'),
      essentialGoodsImpacted: z.string().describe('The essential goods impacted by the crisis.'),
    }),
    outputSchema: z.string(),
  },
  async (input) => {
    return `Based on the ${input.crisisAlertDetails}, prices should be frozen for ${input.essentialGoodsImpacted}.`;
  }
);

const analyzeCrisisPrompt = ai.definePrompt({
  name: 'analyzeCrisisPrompt',
  input: {schema: AutoActivateEmergencyPricingInputSchema},
  output: {schema: PricingDecisionSchema},
  tools: [getReasoning],
  prompt: `You are an AI assistant designed to analyze crisis alerts and determine whether to freeze pricing on essential goods.
  You will get the reasoning for freezing or not freezing the price and log it in the audit.

  Analyze the following crisis alert and make a decision:

  Source: {{{crisisAlert.source}}}
  Type: {{{crisisAlert.type}}}
  Location: {{{crisisAlert.location}}}
  Severity: {{{crisisAlert.severity}}}
  Essential Goods Impacted: {{#each crisisAlert.essentialGoodsImpacted}}{{{this}}}{{#unless @last}}, {{/unless}}{{/each}}
  Details: {{{crisisAlert.details}}}

  Based on this information, determine whether pricing on essential goods should be frozen. Use the getReasoning tool to explain the decision, which will be used for the audit log.

  Return a JSON object with 'shouldFreezePricing' (true or false) and 'reason' based on the output of the getReasoning tool.`,
});

const autoActivateEmergencyPricingFlow = ai.defineFlow(
  {
    name: 'autoActivateEmergencyPricingFlow',
    inputSchema: AutoActivateEmergencyPricingInputSchema,
    outputSchema: AutoActivateEmergencyPricingOutputSchema,
  },
  async input => {
    const {output} = await analyzeCrisisPrompt(input);

    const notifications: string[] = [];
    if (output?.shouldFreezePricing) {
      notifications.push(
        `Emergency pricing activated in ${input.crisisAlert.crisisAlert.location} due to ${input.crisisAlert.crisisAlert.type}. Prices for essential goods have been frozen.`
      );
    } else {
      notifications.push(
        `Emergency pricing was NOT activated in ${input.crisisAlert.crisisAlert.location} due to ${input.crisisAlert.crisisAlert.type}.`
      );
    }

    const auditLog = `Pricing decision: ${output?.shouldFreezePricing ? 'Frozen' : 'Not Frozen'}. Reason: ${output?.reason}`;

    return {
      pricingDecision: {
        shouldFreezePricing: output?.shouldFreezePricing ?? false,
        reason: output?.reason ?? 'No specific reason provided.',
      },
      notifications,
      auditLog,
    };
  }
);

export async function autoActivateEmergencyPricing(input: AutoActivateEmergencyPricingInput): Promise<AutoActivateEmergencyPricingOutput> {
  return autoActivateEmergencyPricingFlow(input);
}

export type {PricingDecisionSchema};
