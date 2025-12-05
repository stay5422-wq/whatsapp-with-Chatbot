const { Client, LocalAuth } = require('whatsapp-web.js');
const qrcode = require('qrcode-terminal');
const express = require('express');
const cors = require('cors');

const app = express();
app.use(cors());
app.use(express.json());

// Store for conversations and messages
const conversations = new Map();
const messages = new Map();

// Initialize WhatsApp Client
const client = new Client({
    authStrategy: new LocalAuth(),
    puppeteer: {
        headless: true,
        executablePath: '/usr/bin/chromium',
        args: [
            '--no-sandbox',
            '--disable-setuid-sandbox',
            '--disable-dev-shm-usage',
            '--disable-accelerated-2d-canvas',
            '--no-first-run',
            '--no-zygote',
            '--disable-gpu',
            '--disable-software-rasterizer',
            '--disable-extensions',
            '--disable-background-timer-throttling',
            '--disable-backgrounding-occluded-windows',
            '--disable-renderer-backgrounding',
            '--disable-features=TranslateUI',
            '--disable-ipc-flooding-protection',
            '--mute-audio',
            '--disable-default-apps',
            '--window-size=1920,1080'
        ],
        timeout: 60000
    }
});

// QR Code Generation
client.on('qr', (qr) => {
    console.log('🔥 Scan this QR code with your WhatsApp:');
    qrcode.generate(qr, { small: true });
    
    // Also send QR to frontend
    currentQR = qr;
});

let currentQR = null;
let isReady = false;

// WhatsApp Ready
client.on('ready', () => {
    console.log('✅ WhatsApp is ready!');
    isReady = true;
});

// Receive Messages
client.on('message', async (msg) => {
    try {
        const contact = await msg.getContact();
        const chat = await msg.getChat();
        
        const conversationId = msg.from;
        const phoneNumber = contact.number || msg.from.replace('@c.us', '');
        
        // Create or update conversation
        if (!conversations.has(conversationId)) {
            conversations.set(conversationId, {
                id: conversationId,
                name: contact.pushname || contact.name || phoneNumber,
                phone: phoneNumber,
                avatar: await contact.getProfilePicUrl() || null,
                lastMessage: msg.body,
                timestamp: new Date(msg.timestamp * 1000),
                unreadCount: 1,
                status: 'active'
            });
        } else {
            const conv = conversations.get(conversationId);
            conv.lastMessage = msg.body;
            conv.timestamp = new Date(msg.timestamp * 1000);
            conv.unreadCount = (conv.unreadCount || 0) + 1;
        }
        
        // Store message
        if (!messages.has(conversationId)) {
            messages.set(conversationId, []);
        }
        
        messages.get(conversationId).push({
            id: msg.id._serialized,
            text: msg.body,
            sender: 'user',
            timestamp: new Date(msg.timestamp * 1000),
            status: 'delivered',
            type: msg.type
        });
        
        console.log(`📨 Message from ${contact.pushname || phoneNumber}: ${msg.body}`);
        
    } catch (error) {
        console.error('Error processing message:', error);
    }
});

// Initialize client
client.initialize();

// API Endpoints

// Get QR Code
app.get('/api/qr', (req, res) => {
    res.json({ qr: currentQR, isReady });
});

// Get Status
app.get('/status', (req, res) => {
    res.json({ 
        connected: isReady,
        qr: currentQR,
        phoneNumber: client.info?.wid?.user || null,
        message: isReady ? 'WhatsApp connected' : 'Waiting for QR scan'
    });
});

// Restart Connection
app.post('/restart', async (req, res) => {
    try {
        console.log('🔄 Restarting WhatsApp connection...');
        currentQR = null;
        isReady = false;
        
        await client.destroy();
        await client.initialize();
        
        res.json({ 
            success: true,
            message: 'WhatsApp connection restarting...'
        });
    } catch (error) {
        console.error('Error restarting:', error);
        res.status(500).json({ 
            success: false,
            error: error.message 
        });
    }
});

// Get Conversations
app.get('/api/conversations', (req, res) => {
    const convArray = Array.from(conversations.values());
    res.json(convArray);
});

// Get Messages for a conversation
app.get('/api/messages/:conversationId', (req, res) => {
    const { conversationId } = req.params;
    const msgs = messages.get(conversationId) || [];
    res.json(msgs);
});

// Send Message
app.post('/api/send', async (req, res) => {
    try {
        const { to, message } = req.body;
        
        if (!isReady) {
            return res.status(503).json({ error: 'WhatsApp is not ready yet' });
        }
        
        // Clean phone number
        let phoneNumber = to.replace(/[^\d]/g, '');
        if (!phoneNumber.includes('@c.us')) {
            phoneNumber = phoneNumber + '@c.us';
        }
        
        // Send message
        const msg = await client.sendMessage(phoneNumber, message);
        
        // Store sent message
        const conversationId = phoneNumber;
        if (!messages.has(conversationId)) {
            messages.set(conversationId, []);
        }
        
        messages.get(conversationId).push({
            id: msg.id._serialized,
            text: message,
            sender: 'agent',
            timestamp: new Date(),
            status: 'sent',
            type: 'chat'
        });
        
        // Update conversation
        if (conversations.has(conversationId)) {
            const conv = conversations.get(conversationId);
            conv.lastMessage = message;
            conv.timestamp = new Date();
        }
        
        res.json({ 
            success: true, 
            messageId: msg.id._serialized 
        });
        
    } catch (error) {
        console.error('Error sending message:', error);
        res.status(500).json({ error: error.message });
    }
});

// Health check
app.get('/health', (req, res) => {
    res.json({ 
        status: 'ok', 
        isReady,
        uptime: process.uptime(),
        timestamp: new Date().toISOString()
    });
});

// Root endpoint
app.get('/', (req, res) => {
    res.json({
        service: 'WhatsApp Business Server',
        status: 'running',
        connected: isReady,
        endpoints: {
            status: '/status',
            restart: '/restart (POST)',
            health: '/health'
        }
    });
});

const PORT = process.env.PORT || 8080;
app.listen(PORT, '0.0.0.0', () => {
    console.log(`🚀 WhatsApp Server running on port ${PORT}`);
    console.log(`🌐 Server URL: http://0.0.0.0:${PORT}`);
    console.log(`📱 Waiting for QR Code scan...`);
    console.log(`✅ Health check: http://0.0.0.0:${PORT}/health`);
});
