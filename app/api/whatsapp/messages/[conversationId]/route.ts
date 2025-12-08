import { NextResponse } from 'next/server';

export async function GET(
  request: Request,
  { params }: { params: { conversationId: string } }
) {
  try {
    const whatsappServerUrl = process.env.NEXT_PUBLIC_WHATSAPP_SERVER_URL || process.env.WHATSAPP_SERVER_URL;
    
    if (!whatsappServerUrl) {
      console.error('WHATSAPP_SERVER_URL not configured');
      return NextResponse.json([], { status: 200 });
    }

    const { conversationId } = params;
    console.log('Fetching messages for conversation:', conversationId);
    
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 10000);
    
    try {
      const response = await fetch(
        `${whatsappServerUrl}/api/messages/${encodeURIComponent(conversationId)}`,
        {
          method: 'GET',
          headers: { 'Content-Type': 'application/json' },
          cache: 'no-store',
          signal: controller.signal,
        }
      );
      
      clearTimeout(timeoutId);
      
      if (!response.ok) {
        console.error('Failed to fetch messages:', response.status);
        return NextResponse.json([], { status: 200 });
      }
      
      const data = await response.json();
      return NextResponse.json(data);
    } catch (fetchError: any) {
      clearTimeout(timeoutId);
      if (fetchError.name === 'AbortError') {
        console.error('Request timeout fetching messages');
        return NextResponse.json([], { status: 200 });
      }
      throw fetchError;
    }
  } catch (error: any) {
    console.error('Error fetching messages:', error);
    return NextResponse.json([], { status: 200 });
  }
}
