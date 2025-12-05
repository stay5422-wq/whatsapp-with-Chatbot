import { NextResponse } from 'next/server';

export async function GET() {
  try {
    const whatsappServerUrl = process.env.WHATSAPP_SERVER_URL;
    
    if (!whatsappServerUrl) {
      return NextResponse.json([], { status: 200 });
    }

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 10000);
    
    try {
      const response = await fetch(`${whatsappServerUrl}/api/conversations`, {
        method: 'GET',
        headers: { 'Content-Type': 'application/json' },
        cache: 'no-store',
        signal: controller.signal,
      });
      
      clearTimeout(timeoutId);
      
      if (!response.ok) {
        console.error('Failed to fetch conversations:', response.status);
        return NextResponse.json([], { status: 200 });
      }
      
      const data = await response.json();
      return NextResponse.json(data);
    } catch (fetchError: any) {
      clearTimeout(timeoutId);
      if (fetchError.name === 'AbortError') {
        console.error('Request timeout fetching conversations');
        return NextResponse.json([], { status: 200 });
      }
      throw fetchError;
    }
  } catch (error: any) {
    console.error('Error fetching conversations:', error);
    return NextResponse.json([], { status: 200 });
  }
}
