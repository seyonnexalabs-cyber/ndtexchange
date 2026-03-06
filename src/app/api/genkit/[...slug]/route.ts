import {createNextApiHandler} from '@genkit-ai/next';
import {ai} from '@/ai/genkit';
import '@/ai/dev'; // Import flows for side effects.

const handler = createNextApiHandler({ai});

export { handler as GET, handler as POST };
