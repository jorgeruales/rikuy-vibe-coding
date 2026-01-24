'use server';

/**
 * @fileOverview Generates personalized financial insights and recommendations based on user income and expenses.
 *
 * - generateFinancialInsights - A function that triggers the financial insights generation process.
 * - FinancialInsightsInput - The input type for the generateFinancialInsights function.
 * - FinancialInsightsOutput - The return type for the generateFinancialInsights function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const FinancialInsightsInputSchema = z.object({
  monthlyIncome: z.number().describe('The user\'s total monthly income.'),
  expenses: z
    .array(
      z.object({
        description: z.string().describe('Description of the expense.'),
        amount: z.number().describe('The amount of the expense.'),
      })
    )
    .describe('A list of expenses with their descriptions and amounts.'),
});
export type FinancialInsightsInput = z.infer<typeof FinancialInsightsInputSchema>;

const FinancialInsightsOutputSchema = z.object({
  insights: z.string().describe('Personalized financial insights and recommendations.'),
});
export type FinancialInsightsOutput = z.infer<typeof FinancialInsightsOutputSchema>;

export async function generateFinancialInsights(
  input: FinancialInsightsInput
): Promise<FinancialInsightsOutput> {
  return generateFinancialInsightsFlow(input);
}

const prompt = ai.definePrompt({
  name: 'financialInsightsPrompt',
  input: {schema: FinancialInsightsInputSchema},
  output: {schema: FinancialInsightsOutputSchema},
  prompt: `You are a financial advisor providing personalized insights based on the user's income and expenses.

  Monthly Income: {{monthlyIncome}}
  Expenses:
  {{#each expenses}}
  - {{description}}: {{amount}}
  {{/each}}

  Provide recommendations for savings and investment strategies based on this information, considering ways to reduce expenses and allocate funds effectively. Focus on actionable advice that the user can implement.
  Keep the response concise and easy to understand.
  `,
});

const generateFinancialInsightsFlow = ai.defineFlow(
  {
    name: 'generateFinancialInsightsFlow',
    inputSchema: FinancialInsightsInputSchema,
    outputSchema: FinancialInsightsOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
