'use server';
/**
 * @fileOverview An AI agent that analyzes NDT job details to suggest a bid amount.
 *
 * - analyzeJobForBid - A function that handles the job analysis.
 * - BidAnalysisInput - The input type for the analyzeJobForBid function.
 * - BidAnalysisOutput - The return type for the analyzeJobFor-Bid function.
 */

import { ai } from '@/ai/genkit';
import { z } from 'genkit';

const BidAnalysisInputSchema = z.object({
  title: z.string().describe('The title of the NDT job.'),
  description: z.string().describe('The detailed description or scope of work for the job.'),
  technique: z.string().describe('The primary NDT technique required (e.g., PAUT, MT, RT).'),
  location: z.string().describe('The location (City, State/Country) where the job will be performed.'),
});
export type BidAnalysisInput = z.infer<typeof BidAnalysisInputSchema>;

const BidAnalysisOutputSchema = z.object({
  suggestedBid: z.number().describe('The AI-suggested bid amount in USD, as a whole number.'),
  rationale: z
    .string()
    .describe(
      'A brief, one or two sentence explanation for the suggested bid, considering factors like technique complexity, location, and potential duration.'
    ),
});
export type BidAnalysisOutput = z.infer<typeof BidAnalysisOutputSchema>;

export async function analyzeJobForBid(input: BidAnalysisInput): Promise<BidAnalysisOutput> {
  return bidAnalyzerFlow(input);
}

const prompt = ai.definePrompt({
  name: 'bidAnalyzerPrompt',
  input: { schema: BidAnalysisInputSchema },
  output: { schema: BidAnalysisOutputSchema },
  prompt: `You are an expert NDT (Non-Destructive Testing) bid manager with 20 years of experience. Your task is to analyze a job posting and suggest a competitive bid amount.

Consider the following factors:
- Technique: Advanced techniques like PAUT and TOFD are more expensive than conventional ones like MT or PT.
- Location: Consider mobilization costs. Remote or high-cost-of-living areas should increase the bid.
- Scope: Analyze the title and description for complexity. Inspecting a large vessel is more work than a small weld. Multiple assets increase the cost.

Job Details:
- Title: {{{title}}}
- Technique: {{{technique}}}
- Location: {{{location}}}
- Description: {{{description}}}

Based on this, provide a suggested bid and a concise rationale. The bid should be a reasonable estimate in USD.
`,
});

const bidAnalyzerFlow = ai.defineFlow(
  {
    name: 'bidAnalyzerFlow',
    inputSchema: BidAnalysisInputSchema,
    outputSchema: BidAnalysisOutputSchema,
  },
  async (input) => {
    const { output } = await prompt(input);
    return output!;
  }
);
