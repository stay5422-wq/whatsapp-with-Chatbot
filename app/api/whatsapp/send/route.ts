import { NextRequest, NextResponse } from 'next/server';

const WHATSAPP_API_URL = process.env.WHATSAPP_API_URL || 'https://graph.facebook.com/v18.0';
const PHONE_NUMBER_ID = process.env.WHATSAPP_PHONE_NUMBER_ID;
const ACCESS_TOKEN = process.env.WHATSAPP_ACCESS_TOKEN;

// Send WhatsApp Message
export async function POST(request: NextRequest) {
  try {
    const { to, message, type = 'text' } = await request.json();
    
    if (!PHONE_NUMBER_ID || !ACCESS_TOKEN) {
      return NextResponse.json(
        { error: 'WhatsApp API not configured' },
        { status: 500 }
      );
    }
    
    // Clean phone number (remove +, spaces, dashes)
    const cleanPhone = to.replace(/[\s\-\+\(\)]/g, '');
    
    if (!cleanPhone || cleanPhone.length < 10) {
      return NextResponse.json(
        { error: 'Invalid phone number format' },
        { status: 400 }
      );
    }
    
    let messageData: any = {
      messaging_product: 'whatsapp',
      recipient_type: 'individual',
      to: cleanPhone,
    };
    
    // Handle different message types
    switch (type) {
      case 'text':
        messageData.type = 'text';
        messageData.text = { body: message };
        break;
        
      case 'template':
        messageData.type = 'template';
        messageData.template = message; // template object
        break;
        
      case 'image':
        messageData.type = 'image';
        messageData.image = {
          link: message.url,
          caption: message.caption
        };
        break;
        
      case 'document':
        messageData.type = 'document';
        messageData.document = {
          link: message.url,
          filename: message.filename,
          caption: message.caption
        };
        break;
        
      case 'audio':
        messageData.type = 'audio';
        messageData.audio = {
          link: message.url
        };
        break;
        
      case 'video':
        messageData.type = 'video';
        messageData.video = {
          link: message.url,
          caption: message.caption
        };
        break;
        
      default:
        return NextResponse.json(
          { error: 'Unsupported message type' },
          { status: 400 }
        );
    }
    
    const response = await fetch(
      `${WHATSAPP_API_URL}/${PHONE_NUMBER_ID}/messages`,
      {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${ACCESS_TOKEN}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(messageData),
      }
    );
    
    const data = await response.json();
    
    if (!response.ok) {
      console.error('WhatsApp API error:', {
        status: response.status,
        error: data,
        to: cleanPhone,
        messageData
      });
      return NextResponse.json(
        { 
          error: data.error?.message || 'Failed to send message',
          details: data.error 
        },
        { status: response.status }
      );
    }
    
    return NextResponse.json({
      success: true,
      messageId: data.messages?.[0]?.id,
      data
    });
    
  } catch (error) {
    console.error('Send message error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// Mark Message as Read
export async function PUT(request: NextRequest) {
  try {
    const { messageId } = await request.json();
    
    if (!PHONE_NUMBER_ID || !ACCESS_TOKEN) {
      return NextResponse.json(
        { error: 'WhatsApp API not configured' },
        { status: 500 }
      );
    }
    
    const response = await fetch(
      `${WHATSAPP_API_URL}/${PHONE_NUMBER_ID}/messages`,
      {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${ACCESS_TOKEN}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          messaging_product: 'whatsapp',
          status: 'read',
          message_id: messageId,
        }),
      }
    );
    
    const data = await response.json();
    
    if (!response.ok) {
      return NextResponse.json(
        { error: data.error?.message || 'Failed to mark as read' },
        { status: response.status }
      );
    }
    
    return NextResponse.json({ success: true });
    
  } catch (error) {
    console.error('Mark as read error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
