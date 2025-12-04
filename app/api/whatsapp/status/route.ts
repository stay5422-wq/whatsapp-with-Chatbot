import { NextResponse } from 'next/server';

export async function GET() {
  try {
    // Connect to WhatsApp server on Railway/Render
    const whatsappServerUrl = process.env.WHATSAPP_SERVER_URL;
    
    // If no server URL configured, return mock response
    if (!whatsappServerUrl) {
      return NextResponse.json({
        connected: false,
        qr: null,
        message: 'WhatsApp server URL not configured. Please set WHATSAPP_SERVER_URL environment variable.',
      });
    }
    
    const response = await fetch(`${whatsappServerUrl}/status`, {
      method: 'GET',
      headers: { 'Content-Type': 'application/json' },
      cache: 'no-store',
      signal: AbortSignal.timeout(10000), // 10 second timeout
    });
    
    if (!response.ok) {
      return NextResponse.json({
        connected: false,
        qr: null,
        message: `WhatsApp server responded with status: ${response.status}`,
      });
    }
    
    const data = await response.json();
    return NextResponse.json(data);
  } catch (error: any) {
    console.error('WhatsApp status error:', error);
    return NextResponse.json({
      connected: false,
      qr: null,
      message: error.name === 'TimeoutError' 
        ? 'WhatsApp server timeout - server may be starting up'
        : 'WhatsApp server not available',
    });
  }
}
