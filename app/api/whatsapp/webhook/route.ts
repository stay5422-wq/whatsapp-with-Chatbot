import { NextRequest, NextResponse } from 'next/server';

// WhatsApp Webhook Verification
export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  
  const mode = searchParams.get('hub.mode');
  const token = searchParams.get('hub.verify_token');
  const challenge = searchParams.get('hub.challenge');
  
  const VERIFY_TOKEN = process.env.WHATSAPP_VERIFY_TOKEN || 'your_verify_token';
  
  if (mode === 'subscribe' && token === VERIFY_TOKEN) {
    console.log('Webhook verified successfully');
    return new NextResponse(challenge, { status: 200 });
  } else {
    return NextResponse.json(
      { error: 'Verification failed' },
      { status: 403 }
    );
  }
}

// WhatsApp Webhook - Receive Messages
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    console.log('Webhook received:', JSON.stringify(body, null, 2));
    
    // Check if this is a message event
    if (body.object === 'whatsapp_business_account') {
      const entry = body.entry?.[0];
      const changes = entry?.changes?.[0];
      const value = changes?.value;
      
      if (value?.messages) {
        const message = value.messages[0];
        const from = message.from; // Phone number
        const messageId = message.id;
        const messageType = message.type;
        
        let messageText = '';
        let mediaUrl = '';
        
        // Handle different message types
        switch (messageType) {
          case 'text':
            messageText = message.text.body;
            break;
          case 'image':
            mediaUrl = message.image.id;
            messageText = message.image.caption || '📷 صورة';
            break;
          case 'video':
            mediaUrl = message.video.id;
            messageText = message.video.caption || '🎥 فيديو';
            break;
          case 'audio':
            mediaUrl = message.audio.id;
            messageText = '🎤 رسالة صوتية';
            break;
          case 'document':
            mediaUrl = message.document.id;
            messageText = `📎 ${message.document.filename || 'ملف'}`;
            break;
          case 'location':
            messageText = `📍 موقع: ${message.location.latitude}, ${message.location.longitude}`;
            break;
          default:
            messageText = `رسالة من نوع: ${messageType}`;
        }
        
        // Get contact info
        const contactName = value.contacts?.[0]?.profile?.name || from;
        
        // Here you would save to database or process the message
        console.log('New message:', {
          from,
          contactName,
          messageText,
          messageType,
          messageId,
          mediaUrl
        });
        
        // TODO: Save to database
        // await saveMessageToDatabase({ from, contactName, messageText, messageType, mediaUrl });
        
        // TODO: Trigger bot response if needed
        // await processBotResponse(from, messageText);
      }
      
      // Handle message status updates (sent, delivered, read)
      if (value?.statuses) {
        const status = value.statuses[0];
        console.log('Message status update:', status);
        
        // TODO: Update message status in database
        // await updateMessageStatus(status.id, status.status);
      }
    }
    
    return NextResponse.json({ success: true }, { status: 200 });
  } catch (error) {
    console.error('Webhook error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
