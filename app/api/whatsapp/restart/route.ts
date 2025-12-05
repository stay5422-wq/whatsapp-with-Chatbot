import { NextResponse } from 'next/server';

export async function POST() {
  try {
    const whatsappServerUrl = process.env.WHATSAPP_SERVER_URL;
    
    if (!whatsappServerUrl) {
      return NextResponse.json(
        { error: 'WhatsApp server URL not configured', success: false },
        { status: 400 }
      );
    }
    
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 30000); // Increased to 30s
    
    try {
      const response = await fetch(`${whatsappServerUrl}/restart`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        signal: controller.signal,
      });
      clearTimeout(timeoutId);
    
      if (!response.ok) {
        const errorText = await response.text().catch(() => 'Unknown error');
        console.error('Restart error response:', response.status, errorText);
        throw new Error(`Server error: ${response.status}`);
      }
      
      const data = await response.json().catch(() => ({ message: 'Restarting...' }));
      return NextResponse.json({
        success: true,
        message: data.message || 'Restarting WhatsApp connection...',
      });
    } catch (fetchError: any) {
      clearTimeout(timeoutId);
      if (fetchError.name === 'AbortError') {
        // Timeout is OK for restart - it means the server is restarting
        return NextResponse.json({
          success: true,
          message: 'WhatsApp connection is restarting...',
        });
      }
      throw fetchError;
    }
  } catch (error: any) {
    console.error('WhatsApp restart error:', error);
    return NextResponse.json(
      { 
        error: error.message || 'Failed to restart WhatsApp connection', 
        success: false 
      },
      { status: 500 }
    );
  }
}
