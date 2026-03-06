import {NextResponse} from 'next/server';

// The Genkit API handler has been temporarily disabled to resolve build issues.
export async function GET() {
  return NextResponse.json({message: 'Genkit API route temporarily disabled.'});
}

export async function POST() {
  return NextResponse.json({message: 'Genkit API route temporarily disabled.'});
}
