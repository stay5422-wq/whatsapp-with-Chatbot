import { NextResponse } from 'next/server';

export async function GET() {
  try {
    // Connect to WhatsApp server on Railway/Render or localhost
    const whatsappServerUrl = process.env.WHATSAPP_SERVER_URL || 'http://localhost:8080';
    
    console.log('🔍 Checking WhatsApp status at:', whatsappServerUrl);
    
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 10000);
    
    try {
      const response = await fetch(`${whatsappServerUrl}/status`, {
        method: 'GET',
        headers: { 'Content-Type': 'application/json' },
        cache: 'no-store',
        signal: controller.signal,
      });
      
      clearTimeout(timeoutId);
      
      if (!response.ok) {
        return NextResponse.json({
          connected: false,
          qr: null,
          message: `WhatsApp server responded with status: ${response.status}`,
        });
      }
      
      const data = await response.json();
      return NextResponse.json(data);
    } catch (fetchError: any) {
      clearTimeout(timeoutId);
      if (fetchError.name === 'AbortError') {
        return NextResponse.json({
          connected: false,
          qr: null,
          message: 'Request timeout - server may be starting up',
        });
      }
      throw fetchError;
    }
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
