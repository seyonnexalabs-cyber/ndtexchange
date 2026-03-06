import createNextApiHandler from '@genkit-ai/next';
import '@/ai/dev'; // Import flows for side effects.

const handler = createNextApiHandler();

export { handler as GET, handler as POST };
