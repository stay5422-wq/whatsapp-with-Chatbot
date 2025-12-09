const express = require('express');
const cors = require('cors');
const axios = require('axios');
const bodyParser = require('body-parser');

const app = express();
const PORT = process.env.PORT || 8080;

// Configuration - من Meta Developer Console
const WHATSAPP_API_URL = 'https://graph.facebook.com/v18.0';
const PHONE_NUMBER_ID = process.env.WHATSAPP_PHONE_NUMBER_ID || ''; // من Meta Console
const ACCESS_TOKEN = process.env.WHATSAPP_ACCESS_TOKEN || ''; // من Meta Console
const WEBHOOK_VERIFY_TOKEN = process.env.WEBHOOK_VERIFY_TOKEN || 'akram_whatsapp_2025'; // اختار أي كلمة سر

// Middleware
app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// In-memory storage (بعدين نحولها لـ database)
const conversations = new Map();
const messages = new Map();
const userSessions = new Map();

// Question Tree for Chatbot
const questionTree = {
  welcome: {
    text: `🌟 مرحباً بك في شركة المسار الساخن! 

كيف يمكنني مساعدتك اليوم؟

1️⃣ حجز وحدة سكنية
2️⃣ استئجار سيارة
3️⃣ باقات سياحية
4️⃣ حجز حفل
5️⃣ الاستفسارات والدعم`,
    options: {
      '1': 'units',
      '2': 'cars',
      '3': 'tourism',
      '4': 'events',
      '5': 'inquiries',
    },
  },
  units: {
    text: `🏠 حجز الوحدات السكنية

اختر نوع الوحدة:
1️⃣ شقة
2️⃣ فيلا
3️⃣ استوديو
4️⃣ دوبليكس
0️⃣ العودة للقائمة الرئيسية`,
    options: {
      '1': 'unit_apartment',
      '2': 'unit_villa',
      '3': 'unit_studio',
      '4': 'unit_duplex',
      '0': 'welcome',
    },
  },
  unit_apartment: {
    text: `تم اختيار: شقة 🏢

الرجاء إدخال البيانات التالية:
- الاسم الكامل
- رقم الهاتف
- المدينة المفضلة
- عدد الغرف
- الميزانية التقريبية`,
    requiresInput: true,
  },
  confirmation: {
    text: `✅ شكراً لك! تم استلام بياناتك:

{details}

سيتم التواصل معك قريباً من قبل أحد ممثلينا.

هل تحتاج لمساعدة أخرى؟
1️⃣ نعم - العودة للقائمة
2️⃣ لا - إنهاء المحادثة`,
    options: {
      '1': 'welcome',
      '2': 'end',
    },
  },
  end: {
    text: '🙏 شكراً لك! نتمنى لك يوماً سعيداً.',
    end: true,
  },
};

// ===== WhatsApp API Functions =====

// إرسال رسالة
async function sendWhatsAppMessage(to, message) {
  try {
    const response = await axios({
      method: 'POST',
      url: `${WHATSAPP_API_URL}/${PHONE_NUMBER_ID}/messages`,
      headers: {
        'Authorization': `Bearer ${ACCESS_TOKEN}`,
        'Content-Type': 'application/json',
      },
      data: {
        messaging_product: 'whatsapp',
        recipient_type: 'individual',
        to: to,
        type: 'text',
        text: {
          preview_url: false,
          body: message,
        },
      },
    });
    
    console.log(`✅ Message sent to ${to}`);
    return response.data;
  } catch (error) {
    console.error('❌ Error sending message:', error.response?.data || error.message);
    throw error;
  }
}

// معالجة الرسائل الواردة
async function handleIncomingMessage(message) {
  const from = message.from;
  const messageText = message.text?.body || '';
  const contactName = message.contacts?.[0]?.profile?.name || from;
  
  console.log(`📨 New message from ${contactName} (${from}): ${messageText}`);
  
  // تحديث أو إنشاء محادثة
  if (!conversations.has(from)) {
    conversations.set(from, {
      id: from,
      name: contactName,
      phone: from,
      avatar: null,
      lastMessage: messageText,
      timestamp: new Date(),
      unreadCount: 1,
      status: 'active',
    });
  } else {
    const conv = conversations.get(from);
    conv.lastMessage = messageText;
    conv.timestamp = new Date();
    conv.unreadCount = (conv.unreadCount || 0) + 1;
  }
  
  // حفظ الرسالة
  if (!messages.has(from)) {
    messages.set(from, []);
  }
  
  messages.get(from).push({
    id: message.id,
    text: messageText,
    sender: 'user',
    timestamp: new Date(message.timestamp * 1000),
    status: 'delivered',
    type: 'chat',
  });
  
  // ChatBot Logic
  let currentQuestion = userSessions.get(from) || 'welcome';
  const questionData = questionTree[currentQuestion];
  let botReply = '';
  
  if (questionData && questionData.requiresInput) {
    botReply = questionTree.confirmation.text.replace('{details}', messageText);
    userSessions.set(from, 'confirmation');
  } else if (questionData && questionData.options) {
    const selectedOption = questionData.options[messageText.trim()];
    
    if (selectedOption) {
      const nextQuestion = questionTree[selectedOption];
      if (nextQuestion) {
        botReply = nextQuestion.text;
        userSessions.set(from, selectedOption);
        
        if (nextQuestion.end) {
          userSessions.delete(from);
        }
      }
    } else {
      botReply = '❌ اختيار غير صحيح. الرجاء الاختيار من القائمة:\n\n' + questionData.text;
    }
  } else {
    botReply = questionTree.welcome.text;
    userSessions.set(from, 'welcome');
  }
  
  // إرسال رد البوت
  if (botReply) {
    await sendWhatsAppMessage(from, botReply);
    
    // حفظ رسالة البوت
    messages.get(from).push({
      id: `bot_${Date.now()}`,
      text: botReply,
      sender: 'bot',
      timestamp: new Date(),
      status: 'delivered',
      type: 'chat',
    });
    
    // تحديث آخر رسالة
    const conv = conversations.get(from);
    if (conv) {
      conv.lastMessage = botReply;
      conv.timestamp = new Date();
    }
  }
}

// ===== API Endpoints =====

// Health Check
app.get('/', (req, res) => {
  res.json({
    status: 'running',
    service: 'WhatsApp Business Cloud API',
    timestamp: new Date().toISOString(),
  });
});

// Status endpoint
app.get('/status', (req, res) => {
  res.json({
    connected: !!ACCESS_TOKEN && !!PHONE_NUMBER_ID,
    phoneNumberId: PHONE_NUMBER_ID ? 'configured' : 'missing',
    accessToken: ACCESS_TOKEN ? 'configured' : 'missing',
    conversations: conversations.size,
    message: ACCESS_TOKEN && PHONE_NUMBER_ID ? 'WhatsApp Cloud API configured' : 'Missing configuration',
  });
});

// Webhook verification (for Meta)
app.get('/webhook', (req, res) => {
  const mode = req.query['hub.mode'];
  const token = req.query['hub.verify_token'];
  const challenge = req.query['hub.challenge'];
  
  if (mode === 'subscribe' && token === WEBHOOK_VERIFY_TOKEN) {
    console.log('✅ Webhook verified');
    res.status(200).send(challenge);
  } else {
    console.log('❌ Webhook verification failed');
    res.sendStatus(403);
  }
});

// Webhook for incoming messages
app.post('/webhook', async (req, res) => {
  try {
    const body = req.body;
    
    if (body.object === 'whatsapp_business_account') {
      body.entry?.forEach(entry => {
        entry.changes?.forEach(change => {
          if (change.value.messages) {
            change.value.messages.forEach(async (message) => {
              await handleIncomingMessage(message);
            });
          }
          
          // Mark as read
          if (change.value.statuses) {
            console.log('📊 Message status update:', change.value.statuses);
          }
        });
      });
      
      res.sendStatus(200);
    } else {
      res.sendStatus(404);
    }
  } catch (error) {
    console.error('❌ Webhook error:', error);
    res.sendStatus(500);
  }
});

// Get conversations
app.get('/api/conversations', (req, res) => {
  try {
    const convArray = Array.from(conversations.values());
    res.json(convArray);
  } catch (error) {
    console.error('Error getting conversations:', error);
    res.json([]);
  }
});

// Get messages for a conversation
app.get('/api/messages/:conversationId', (req, res) => {
  try {
    const { conversationId } = req.params;
    const msgs = messages.get(conversationId) || [];
    res.json(msgs);
  } catch (error) {
    console.error('Error getting messages:', error);
    res.json([]);
  }
});

// Send message
app.post('/api/send', async (req, res) => {
  try {
    const { to, message } = req.body;
    
    console.log(`📤 Sending message to: ${to}`);
    
    if (!ACCESS_TOKEN || !PHONE_NUMBER_ID) {
      return res.status(500).json({ error: 'WhatsApp API not configured' });
    }
    
    const result = await sendWhatsAppMessage(to, message);
    
    // حفظ الرسالة المرسلة
    if (!messages.has(to)) {
      messages.set(to, []);
    }
    
    messages.get(to).push({
      id: result.messages?.[0]?.id || `msg_${Date.now()}`,
      text: message,
      sender: 'agent',
      timestamp: new Date(),
      status: 'sent',
      type: 'chat',
    });
    
    res.json({ success: true, result });
  } catch (error) {
    console.error('Error sending message:', error);
    res.status(500).json({ error: error.message });
  }
});

// Start server
app.listen(PORT, () => {
  console.log(`🚀 WhatsApp Business Cloud API Server running on port ${PORT}`);
  console.log(`📱 Phone Number ID: ${PHONE_NUMBER_ID || '❌ NOT SET'}`);
  console.log(`🔑 Access Token: ${ACCESS_TOKEN ? '✅ Configured' : '❌ NOT SET'}`);
  console.log(`🔗 Webhook URL: https://your-domain.com/webhook`);
  console.log(`🔐 Webhook Verify Token: ${WEBHOOK_VERIFY_TOKEN}`);
});
