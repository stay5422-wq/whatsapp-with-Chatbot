import { NextResponse } from 'next/server';

export async function GET() {
  try {
    // Connect to WhatsApp server on Railway/Render
    const whatsappServerUrl = process.env.WHATSAPP_SERVER_URL || 'http://localhost:8080';
    
    const response = await fetch(`${whatsappServerUrl}/status`, {
      method: 'GET',
      headers: { 'Content-Type': 'application/json' },
      cache: 'no-store',
    });
    
    if (!response.ok) {
      return NextResponse.json({
        connected: false,
        qr: null,
        message: 'WhatsApp server not responding',
      });
    }
    
    const data = await response.json();
    return NextResponse.json(data);
  } catch (error) {
    console.error('WhatsApp status error:', error);
    return NextResponse.json({
      connected: false,
      qr: null,
      message: 'WhatsApp server not available',
    });
  }
}
