import createNextApiHandler from '@genkit-ai/next';
import { ai } from '@/ai/genkit';

const handler = createNextApiHandler(ai);

export { handler as GET, handler as POST };
