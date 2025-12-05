const { Client, LocalAuth } = require('whatsapp-web.js');
const qrcode = require('qrcode-terminal');
const express = require('express');
const cors = require('cors');
const path = require('path');
const admin = require('firebase-admin');

const app = express();
app.use(cors());
app.use(express.json());

// Initialize Firebase Admin
let db = null;
if (process.env.FIREBASE_SERVICE_ACCOUNT) {
    try {
        const serviceAccount = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT);
        admin.initializeApp({
            credential: admin.credential.cert(serviceAccount)
        });
        db = admin.firestore();
        console.log('🔥 Firebase initialized successfully');
    } catch (error) {
        console.error('❌ Firebase initialization failed:', error.message);
    }
}

// Store for conversations and messages
const conversations = new Map();
const messages = new Map();

// Firebase helper functions
async function saveConversationToFirebase(conversationId, conversation) {
    if (!db) return;
    try {
        await db.collection('conversations').doc(conversationId).set({
            ...conversation,
            timestamp: admin.firestore.Timestamp.fromDate(conversation.timestamp)
        });
    } catch (error) {
        console.error('Error saving conversation to Firebase:', error.message);
    }
}

async function saveMessagesToFirebase(conversationId, messagesList) {
    if (!db) return;
    try {
        const batch = db.batch();
        messagesList.forEach(msg => {
            const msgRef = db.collection('messages').doc(conversationId).collection('items').doc(msg.id);
            batch.set(msgRef, {
                ...msg,
                timestamp: admin.firestore.Timestamp.fromDate(msg.timestamp)
            });
        });
        await batch.commit();
    } catch (error) {
        console.error('Error saving messages to Firebase:', error.message);
    }
}

async function loadConversationsFromFirebase() {
    if (!db) return;
    try {
        const snapshot = await db.collection('conversations').get();
        snapshot.forEach(doc => {
            const data = doc.data();
            conversations.set(doc.id, {
                ...data,
                timestamp: data.timestamp.toDate()
            });
        });
        console.log(`📥 Loaded ${conversations.size} conversations from Firebase`);
    } catch (error) {
        console.error('Error loading conversations from Firebase:', error.message);
    }
}

async function loadMessagesFromFirebase(conversationId) {
    if (!db) return [];
    try {
        const snapshot = await db.collection('messages').doc(conversationId).collection('items').orderBy('timestamp').get();
        const msgList = [];
        snapshot.forEach(doc => {
            const data = doc.data();
            msgList.push({
                ...data,
                timestamp: data.timestamp.toDate()
            });
        });
        return msgList;
    } catch (error) {
        console.error('Error loading messages from Firebase:', error.message);
        return [];
    }
}

// Use persistent storage path for Railway Volume
const SESSION_PATH = process.env.RAILWAY_VOLUME_MOUNT_PATH 
    ? path.join(process.env.RAILWAY_VOLUME_MOUNT_PATH, '.wwebjs_auth')
    : './.wwebjs_auth';

console.log(`📁 Using session path: ${SESSION_PATH}`);

// Initialize WhatsApp Client
const client = new Client({
    authStrategy: new LocalAuth({
        dataPath: SESSION_PATH
    }),
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
        timeout: 120000
    },
    qrMaxRetries: 5,
    restartOnAuthFail: true,
    takeoverOnConflict: true,
    takeoverTimeoutMs: 0
});

// QR Code Generation
let qrRetryCount = 0;
client.on('qr', (qr) => {
    qrRetryCount++;
    console.log(`🔥 QR Code generated (attempt ${qrRetryCount})`);
    console.log('📱 Please scan within 30 seconds!');
    qrcode.generate(qr, { small: true });
    
    // Store QR and reset connecting state
    currentQR = qr;
    isConnecting = false;
    
    // QR expires after 30 seconds
    console.log('⏰ QR Code will expire in 30 seconds');
});

let currentQR = null;
let isReady = false;
let isConnecting = false;

// WhatsApp Ready
client.on('ready', async () => {
    console.log('✅ WhatsApp is ready!');
    isReady = true;
    isConnecting = false;
    currentQR = null;
    
    // Load existing chats
    try {
        console.log('📥 Loading existing chats...');
        const chats = await client.getChats();
        console.log(`📊 Found ${chats.length} chats`);
        
        for (const chat of chats) {
            try {
                // Get last 20 messages from each chat
                const chatMessages = await chat.fetchMessages({ limit: 20 });
                
                if (chatMessages.length > 0) {
                    const contact = await chat.getContact();
                    const conversationId = chat.id._serialized;
                    const phoneNumber = contact.number || chat.id.user;
                    
                    // Create conversation
                    const lastMsg = chatMessages[chatMessages.length - 1];
                    conversations.set(conversationId, {
                        id: conversationId,
                        name: chat.name || contact.pushname || contact.name || phoneNumber,
                        phone: phoneNumber,
                        avatar: await contact.getProfilePicUrl().catch(() => null),
                        lastMessage: lastMsg.body || 'رسالة وسائط',
                        timestamp: new Date(lastMsg.timestamp * 1000),
                        unreadCount: chat.unreadCount || 0,
                        status: 'active'
                    });
                    
                    // Store messages
                    const msgList = [];
                    for (const msg of chatMessages) {
                        msgList.push({
                            id: msg.id._serialized,
                            text: msg.body || '',
                            sender: msg.fromMe ? 'agent' : 'user',
                            timestamp: new Date(msg.timestamp * 1000),
                            status: msg.ack >= 3 ? 'read' : msg.ack >= 2 ? 'delivered' : 'sent',
                            type: msg.type
                        });
                    }
                    messages.set(conversationId, msgList);
                    
                    // Save to Firebase
                    if (db) {
                        await saveConversationToFirebase(conversationId, conversations.get(conversationId));
                        await saveMessagesToFirebase(conversationId, msgList);
                    }
                }
            } catch (chatError) {
                console.error('Error loading chat:', chatError.message);
            }
        }
        
        console.log(`✅ Loaded ${conversations.size} conversations with messages`);
    } catch (error) {
        console.error('Error loading chats:', error);
    }
});

// Authentication
client.on('authenticated', () => {
    console.log('🔐 WhatsApp authenticated!');
    isConnecting = true;
});

// Authentication failure
client.on('auth_failure', (msg) => {
    console.error('❌ Authentication failed:', msg);
    isReady = false;
    isConnecting = false;
});

// Disconnected
client.on('disconnected', (reason) => {
    console.log('📴 WhatsApp disconnected:', reason);
    isReady = false;
    isConnecting = false;
    currentQR = null;
});

// Loading screen
client.on('loading_screen', (percent, message) => {
    console.log(`⏳ Loading: ${percent}% - ${message}`);
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
        
        const newMessage = {
            id: msg.id._serialized,
            text: msg.body,
            sender: 'user',
            timestamp: new Date(msg.timestamp * 1000),
            status: 'delivered',
            type: msg.type
        };
        
        messages.get(conversationId).push(newMessage);
        
        // Save to Firebase
        if (db) {
            await saveConversationToFirebase(conversationId, conversations.get(conversationId));
            await saveMessagesToFirebase(conversationId, [newMessage]);
        }
        
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
        connecting: isConnecting,
        phoneNumber: client.info?.wid?.user || null,
        message: isReady ? 'WhatsApp connected' : 
                 isConnecting ? 'Connecting...' : 
                 currentQR ? 'Waiting for QR scan' : 'Initializing...'
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
app.get('/api/conversations', async (req, res) => {
    try {
        // Load from Firebase if not in memory
        if (conversations.size === 0 && db) {
            await loadConversationsFromFirebase();
        }
        const convArray = Array.from(conversations.values());
        res.json(convArray);
    } catch (error) {
        console.error('Error getting conversations:', error);
        res.json([]);
    }
});

// Get Messages for a conversation
app.get('/api/messages/:conversationId', async (req, res) => {
    try {
        const { conversationId } = req.params;
        let msgs = messages.get(conversationId);
        
        // Load from Firebase if not in memory
        if (!msgs && db) {
            msgs = await loadMessagesFromFirebase(conversationId);
            if (msgs.length > 0) {
                messages.set(conversationId, msgs);
            }
        }
        
        res.json(msgs || []);
    } catch (error) {
        console.error('Error getting messages:', error);
        res.json([]);
    }
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
