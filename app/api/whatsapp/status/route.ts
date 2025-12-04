import { NextRequest, NextResponse } from 'next/server';

// This would connect to your WhatsApp server
// For now, returning mock data
export async function GET(request: NextRequest) {
  try {
    // In production, connect to your WhatsApp server at port 8080
    // const response = await fetch('http://localhost:8080/status');
    // const data = await response.json();
    
    // Mock response for development
    return NextResponse.json({
      connected: false,
      qr: null, // Will be populated by WhatsApp server
      message: 'WhatsApp server not connected. Please run the WhatsApp server.',
    });
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to check WhatsApp status' },
      { status: 500 }
    );
  }
}
