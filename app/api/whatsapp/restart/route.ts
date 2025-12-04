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
    
    const response = await fetch(`${whatsappServerUrl}/restart`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      signal: AbortSignal.timeout(10000),
    });
    
    if (!response.ok) {
      throw new Error(`Server responded with status: ${response.status}`);
    }
    
    const data = await response.json();
    return NextResponse.json({
      success: true,
      message: data.message || 'Restarting WhatsApp connection...',
    });
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
