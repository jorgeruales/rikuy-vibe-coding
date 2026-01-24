"use server";

import {
  generateFinancialInsights,
  type FinancialInsightsInput,
  type FinancialInsightsOutput,
} from "@/ai/flows/generate-financial-insights";

export async function getFinancialInsightsAction(
  input: FinancialInsightsInput
): Promise<FinancialInsightsOutput> {
  if (input.monthlyIncome <= 0 && input.expenses.length === 0) {
    return {
      insights:
        "Please set your income and add some expenses to get financial insights.",
    };
  }

  try {
    const result = await generateFinancialInsights(input);
    return result;
  } catch (error) {
    console.error("Error generating financial insights:", error);
    return {
      insights:
        "Sorry, we couldn't generate insights at this time. Please try again later.",
    };
  }
}
