import {genkit} from 'genkit';
import {googleAI} from '@genkit-ai/google-genai';
import nextPlugin from '@genkit-ai/next';

export const ai = genkit({
  plugins: [
    googleAI(),
    nextPlugin({
      // nextjs specific options can be added here
    }),
  ],
});
