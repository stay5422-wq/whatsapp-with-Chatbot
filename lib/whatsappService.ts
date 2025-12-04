// WhatsApp API Service
const WHATSAPP_API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3002';

export interface SendMessageParams {
  to: string;
  message: string | any;
  type?: 'text' | 'template' | 'image' | 'document' | 'audio' | 'video';
}

export const whatsappService = {
  // Send Text Message
  async sendTextMessage(to: string, text: string) {
    try {
      const response = await fetch(`${WHATSAPP_API_URL}/api/whatsapp/send`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          to,
          message: text,
          type: 'text',
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to send message');
      }

      return await response.json();
    } catch (error) {
      console.error('Error sending text message:', error);
      throw error;
    }
  },

  // Send Image
  async sendImage(to: string, imageUrl: string, caption?: string) {
    try {
      const response = await fetch(`${WHATSAPP_API_URL}/api/whatsapp/send`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          to,
          message: { url: imageUrl, caption },
          type: 'image',
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to send image');
      }

      return await response.json();
    } catch (error) {
      console.error('Error sending image:', error);
      throw error;
    }
  },

  // Send Document
  async sendDocument(to: string, documentUrl: string, filename: string, caption?: string) {
    try {
      const response = await fetch(`${WHATSAPP_API_URL}/api/whatsapp/send`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          to,
          message: { url: documentUrl, filename, caption },
          type: 'document',
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to send document');
      }

      return await response.json();
    } catch (error) {
      console.error('Error sending document:', error);
      throw error;
    }
  },

  // Send Audio
  async sendAudio(to: string, audioUrl: string) {
    try {
      const response = await fetch(`${WHATSAPP_API_URL}/api/whatsapp/send`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          to,
          message: { url: audioUrl },
          type: 'audio',
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to send audio');
      }

      return await response.json();
    } catch (error) {
      console.error('Error sending audio:', error);
      throw error;
    }
  },

  // Mark Message as Read
  async markAsRead(messageId: string) {
    try {
      const response = await fetch(`${WHATSAPP_API_URL}/api/whatsapp/send`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ messageId }),
      });

      if (!response.ok) {
        throw new Error('Failed to mark as read');
      }

      return await response.json();
    } catch (error) {
      console.error('Error marking as read:', error);
      throw error;
    }
  },

  // Send Template Message
  async sendTemplate(to: string, templateName: string, languageCode: string = 'ar', components?: any[]) {
    try {
      const response = await fetch(`${WHATSAPP_API_URL}/api/whatsapp/send`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          to,
          message: {
            name: templateName,
            language: { code: languageCode },
            components: components || [],
          },
          type: 'template',
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to send template');
      }

      return await response.json();
    } catch (error) {
      console.error('Error sending template:', error);
      throw error;
    }
  },
};
