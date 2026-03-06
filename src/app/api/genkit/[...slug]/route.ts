import {NextResponse} from 'next/server';

// The Genkit API handler has been temporarily disabled to resolve build issues.
// This endpoint will return a 503 Service Unavailable error.
// To re-enable, the original code that initializes and exports the Genkit handler should be restored.

export async function GET() {
  return NextResponse.json(
    { error: 'The AI API endpoint is temporarily disabled.' },
    { status: 503 }
  );
}

export async function POST() {
  return NextResponse.json(
    { error: 'The AI API endpoint is temporarily disabled.' },
    { status: 503 }
  );
}
