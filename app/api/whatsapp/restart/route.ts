import { NextResponse } from 'next/server';

export async function POST() {
  try {
    const whatsappServerUrl = process.env.WHATSAPP_SERVER_URL || 'http://localhost:8080';
    
    const response = await fetch(`${whatsappServerUrl}/restart`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
    });
    
    if (!response.ok) {
      throw new Error('Failed to restart WhatsApp server');
    }
    
    return NextResponse.json({
      success: true,
      message: 'Restarting WhatsApp connection...',
    });
  } catch (error) {
    console.error('WhatsApp restart error:', error);
    return NextResponse.json(
      { error: 'Failed to restart WhatsApp connection', success: false },
      { status: 500 }
    );
  }
}
