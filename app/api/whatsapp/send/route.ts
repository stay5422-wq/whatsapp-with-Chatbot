import { NextRequest, NextResponse } from 'next/server';

const WHATSAPP_SERVER_URL = process.env.WHATSAPP_SERVER_URL;

// Send WhatsApp Message
export async function POST(request: NextRequest) {
  try {
    const { to, message, type = 'text' } = await request.json();
    
    if (!WHATSAPP_SERVER_URL) {
      return NextResponse.json(
        { error: 'WhatsApp server not configured' },
        { status: 500 }
      );
    }
    
    // Send message through WhatsApp Web server
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 30000); // 30 second timeout for sending
    
    try {
      const response = await fetch(`${WHATSAPP_SERVER_URL}/api/send`, {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ to, message }),
        signal: controller.signal,
      });
      
      clearTimeout(timeoutId);
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ error: 'Unknown error' }));
        return NextResponse.json(
          { error: errorData.error || 'Failed to send message' },
          { status: response.status }
        );
      }
      
      const data = await response.json();
      return NextResponse.json({
        success: true,
        messageId: data.messageId,
        data
      });
    } catch (fetchError: any) {
      clearTimeout(timeoutId);
      if (fetchError.name === 'AbortError') {
        return NextResponse.json(
          { error: 'Request timeout - message may still be sent' },
          { status: 504 }
        );
      }
      throw fetchError;
    }
    
  } catch (error: any) {
    console.error('❌ Send message error:', error);
    return NextResponse.json(
      { error: error.message || 'فشل إرسال الرسالة' },
      { status: 500 }
    );
  }
}
