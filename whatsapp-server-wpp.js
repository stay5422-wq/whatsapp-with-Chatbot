const wppconnect = require('@wppconnect-team/wppconnect');
const express = require('express');
const cors = require('cors');
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

// WPPConnect Client
let client = null;
let currentQR = null;
let isReady = false;
let isConnecting = false;

// Initialize WPPConnect
async function initializeClient() {
    console.log('🚀 Initializing WPPConnect...');
    
    client = await wppconnect.create({
        session: 'whatsapp-main',
        headless: true,
        devtools: false,
        useChrome: false,
        debug: false,
        logQR: false,
        disableWelcome: true,
        updatesLog: false,
        autoClose: 300000, // 5 minutes
        browserArgs: [
            '--no-sandbox',
            '--disable-setuid-sandbox',
            '--disable-dev-shm-usage',
            '--disable-gpu',
            '--disable-extensions',
            '--disable-software-rasterizer'
        ],
        puppeteerOptions: {
            executablePath: process.env.CHROMIUM_PATH || undefined,
            args: ['--no-sandbox', '--disable-setuid-sandbox']
        },
        catchQR: (base64Qr, asciiQR, attempts, urlCode) => {
            console.log('📱 QR Code received! Attempt:', attempts);
            // Extract actual QR code from data URL
            if (base64Qr && base64Qr.startsWith('data:image')) {
                currentQR = base64Qr;
            } else {
                currentQR = 'data:image/png;base64,' + base64Qr;
            }
            isConnecting = false;
            console.log('QR Code URL:', urlCode);
        },
        statusFind: (statusSession, session) => {
            console.log(`📊 Status: ${statusSession}`);
            if (statusSession === 'qrReadSuccess' || statusSession === 'qrReadSucces') {
                console.log('🔐 QR Code scanned!');
                isConnecting = true;
            }
            if (statusSession === 'isLogged' || statusSession === 'authenticated' || statusSession === 'browserConnected') {
                console.log('✅ WhatsApp is ready!');
                isReady = true;
                isConnecting = false;
                currentQR = null;
                loadExistingChats();
            }
        },
        onLoadingScreen: (percent, message) => {
            console.log(`⏳ Loading: ${percent}% - ${message}`);
        }
    }).then(async (clientInstance) => {
        console.log('✅ Client initialized successfully!');
        client = clientInstance; // Set client first!
        isReady = true;
        isConnecting = false;
        currentQR = null;
        
        // Load existing chats after connection
        try {
            await loadExistingChats();
        } catch (err) {
            console.error('Error loading initial chats:', err.message);
        }
        
        return clientInstance;
    });

    // Listen for messages
    client.onMessage(async (message) => {
        await handleIncomingMessage(message);
    });
    
    return client;
}

// Load existing chats
async function loadExistingChats() {
    try {
        console.log('📥 Loading existing chats...');
        
        // Wait a bit for WhatsApp to sync
        await new Promise(resolve => setTimeout(resolve, 3000));
        
        const chats = await client.getAllChats();
        console.log(`📊 Found ${chats.length} chats`);
        
        for (const chat of chats.slice(0, 50)) { // Load first 50 chats
            try {
                const messages = await client.getAllMessagesInChat(chat.id._serialized, true, false);
                
                // Get last 30 messages only
                const recentMessages = messages.slice(-30);
                
                if (recentMessages.length > 0) {
                    const conversationId = chat.id._serialized;
                    const lastMsg = recentMessages[recentMessages.length - 1];
                    
                    conversations.set(conversationId, {
                        id: conversationId,
                        name: chat.name || chat.contact?.pushname || chat.id.user,
                        phone: chat.id.user,
                        avatar: null,
                        lastMessage: lastMsg.body || 'رسالة وسائط',
                        timestamp: new Date(lastMsg.timestamp * 1000),
                        unreadCount: chat.unreadCount || 0,
                        status: 'active'
                    });
                    
                    // Store messages
                    const msgList = recentMessages.map(msg => ({
                        id: msg.id._serialized || msg.id,
                        text: msg.body || '',
                        sender: msg.fromMe ? 'agent' : 'user',
                        timestamp: new Date(msg.timestamp * 1000),
                        status: 'delivered',
                        type: msg.type
                    }));
                    
                    messages.set(conversationId, msgList);
                    
                    // Save to Firebase
                    if (db) {
                        await saveConversationToFirebase(conversationId, conversations.get(conversationId));
                        await saveMessagesToFirebase(conversationId, msgList);
                    }
                }
            } catch (err) {
                console.error('Error loading chat:', err.message);
            }
        }
        
        console.log(`✅ Loaded ${conversations.size} conversations`);
    } catch (error) {
        console.error('Error loading chats:', error);
    }
}

// Bot session storage
const botSessions = new Map();

// Simple bot reply handler
async function handleBotReply(conversationId, userMessage) {
    try {
        // Get or create session
        if (!botSessions.has(conversationId)) {
            botSessions.set(conversationId, { currentQuestion: 'welcome' });
        }
        
        const session = botSessions.get(conversationId);
        const msg = userMessage.trim();
        
        // Welcome message
        if (session.currentQuestion === 'welcome') {
            const welcomeText = `مرحبًا بك في *المسار الساخن للسفر والسياحة* 🔥🌍\n\nيشرفنا نخدمك! اختر الخدمة المطلوبة:\n\n1️⃣ حجز وحدات الضيافة 🏘️\n2️⃣ حجز سيارات 🚗\n3️⃣ البرامج والخدمات السياحية 🗺️\n4️⃣ المرشدين السياحيين 👨‍🏫\n5️⃣ خدمة العملاء 💬`;
            
            await client.sendText(conversationId, welcomeText);
            session.currentQuestion = 'awaiting_choice';
            return;
        }
        
        // Handle user choice
        if (session.currentQuestion === 'awaiting_choice') {
            if (msg === '1') {
                await client.sendText(conversationId, '🏘️ ممتاز! تم اختيار *حجز وحدات الضيافة*\n\nسيتم التواصل معك من قبل أحد ممثلي خدمة العملاء قريبًا.');
                session.currentQuestion = 'completed';
            } else if (msg === '2') {
                await client.sendText(conversationId, '🚗 رائع! تم اختيار *حجز سيارات*\n\nسيتم التواصل معك من قبل أحد ممثلي خدمة العملاء قريبًا.');
                session.currentQuestion = 'completed';
            } else if (msg === '3') {
                await client.sendText(conversationId, '🗺️ عظيم! تم اختيار *البرامج والخدمات السياحية*\n\nسيتم التواصل معك من قبل أحد ممثلي خدمة العملاء قريبًا.');
                session.currentQuestion = 'completed';
            } else if (msg === '4') {
                await client.sendText(conversationId, '👨‍🏫 ممتاز! تم اختيار *المرشدين السياحيين*\n\nسيتم التواصل معك من قبل أحد ممثلي خدمة العملاء قريبًا.');
                session.currentQuestion = 'completed';
            } else if (msg === '5') {
                await client.sendText(conversationId, '💬 مرحبًا بك في *خدمة العملاء*\n\nسيتم توصيلك بأحد ممثلي خدمة العملاء الآن...');
                session.currentQuestion = 'completed';
            } else {
                await client.sendText(conversationId, '⚠️ اختيار غير صحيح. الرجاء اختيار رقم من 1 إلى 5');
            }
        }
    } catch (error) {
        console.error('Error in bot reply:', error);
    }
}

// Handle incoming messages
async function handleIncomingMessage(message) {
    try {
        console.log(`📨 New message from: ${message.from}`);
        
        // Ignore status broadcasts
        if (message.from === 'status@broadcast' || !message.from) {
            return;
        }
        
        const conversationId = message.from;
        const contact = await client.getContact(message.from);
        
        // Skip if contact is null
        if (!contact || !contact.id) {
            console.log('⚠️ Skipping message: invalid contact');
            return;
        }
        const phoneNumber = contact.id.user;
        
        // Create or update conversation
        if (!conversations.has(conversationId)) {
            conversations.set(conversationId, {
                id: conversationId,
                name: contact.pushname || contact.name || phoneNumber,
                phone: phoneNumber,
                avatar: null,
                lastMessage: message.body || 'رسالة وسائط',
                timestamp: new Date(message.timestamp * 1000),
                unreadCount: 1,
                status: 'active'
            });
        } else {
            const conv = conversations.get(conversationId);
            conv.lastMessage = message.body || 'رسالة وسائط';
            conv.timestamp = new Date(message.timestamp * 1000);
            conv.unreadCount = (conv.unreadCount || 0) + 1;
        }
        
        // Store message
        if (!messages.has(conversationId)) {
            messages.set(conversationId, []);
        }
        
        const newMessage = {
            id: message.id,
            text: message.body || '',
            sender: 'user',
            timestamp: new Date(message.timestamp * 1000),
            status: 'delivered',
            type: message.type
        };
        
        messages.get(conversationId).push(newMessage);
        
        // Save to Firebase
        if (db) {
            await saveConversationToFirebase(conversationId, conversations.get(conversationId));
            await saveMessagesToFirebase(conversationId, [newMessage]);
        }
        
        // Auto-reply with bot if message is from user
        if (!message.fromMe && message.body) {
            await handleBotReply(conversationId, message.body);
        }
        
        console.log(`✅ Message processed`);
    } catch (error) {
        console.error('Error processing message:', error);
    }
}

// API Endpoints

// Get Status
app.get('/status', (req, res) => {
    res.json({ 
        connected: isReady,
        qr: currentQR,
        connecting: isConnecting,
        phoneNumber: null,
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
        
        if (client) {
            await client.close();
        }
        
        setTimeout(() => {
            initializeClient();
        }, 2000);
        
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
        const convArray = Array.from(conversations.values());
        res.json(convArray);
    } catch (error) {
        console.error('Error getting conversations:', error);
        res.json([]);
    }
});

// Get Messages
app.get('/api/messages/:conversationId', async (req, res) => {
    try {
        const { conversationId } = req.params;
        const msgs = messages.get(conversationId) || [];
        res.json(msgs);
    } catch (error) {
        console.error('Error getting messages:', error);
        res.json([]);
    }
});

// Send Message
app.post('/api/send', async (req, res) => {
    try {
        const { to, message } = req.body;
        
        if (!isReady || !client) {
            return res.status(503).json({ error: 'WhatsApp is not ready yet' });
        }
        
        // Clean phone number
        let phoneNumber = to.replace(/[^\d]/g, '');
        if (!phoneNumber.includes('@c.us')) {
            phoneNumber = phoneNumber + '@c.us';
        }
        
        // Send message
        const result = await client.sendText(phoneNumber, message);
        
        // Store sent message
        const conversationId = phoneNumber;
        if (!messages.has(conversationId)) {
            messages.set(conversationId, []);
        }
        
        const sentMsg = {
            id: result.id,
            text: message,
            sender: 'agent',
            timestamp: new Date(),
            status: 'sent',
            type: 'chat'
        };
        
        messages.get(conversationId).push(sentMsg);
        
        // Update conversation
        if (conversations.has(conversationId)) {
            const conv = conversations.get(conversationId);
            conv.lastMessage = message;
            conv.timestamp = new Date();
        }
        
        res.json({ 
            success: true, 
            messageId: result.id
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
        uptime: process.uptime()
    });
});

// Root endpoint
app.get('/', (req, res) => {
    res.json({
        service: 'WhatsApp Business Server (WPPConnect)',
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
    initializeClient().catch(console.error);
});
