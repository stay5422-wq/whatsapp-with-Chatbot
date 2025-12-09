const wppconnect = require('@wppconnect-team/wppconnect');
const express = require('express');
const cors = require('cors');
const path = require('path');
const admin = require('firebase-admin');
const http = require('http');
const { Server } = require('socket.io');

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
    cors: {
        origin: '*',
        methods: ['GET', 'POST']
    }
});

app.use(cors());
app.use(express.json());

// WebSocket connection handler
io.on('connection', (socket) => {
    console.log('🔌 Client connected:', socket.id);
    
    socket.on('disconnect', () => {
        console.log('🔌 Client disconnected:', socket.id);
    });
});

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

// Initialize WPPConnect Client
let client = null;
let currentQR = null;
let isReady = false;
let isConnecting = false;

async function initializeClient() {
    console.log('🚀 Initializing WPPConnect...');
    
    client = await wppconnect.create({
        session: 'whatsapp-session',
        headless: 'new',
        devtools: false,
        useChrome: true,
        debug: false,
        logQR: true,
        autoClose: 300000, // 5 minutes instead of 60 seconds
        browserArgs: [
            '--no-sandbox',
            '--disable-setuid-sandbox',
            '--disable-dev-shm-usage',
            '--disable-accelerated-2d-canvas',
            '--no-first-run',
            '--no-zygote',
            '--disable-gpu'
        ],
        catchQR: (base64Qr, asciiQR) => {
            console.log('📱 QR Code received!');
            currentQR = base64Qr;
            isConnecting = false;
        },
        statusFind: (statusSession, session) => {
            console.log(`📊 Status: ${statusSession}`);
            if (statusSession === 'qrReadSuccess') {
                console.log('🔐 QR Code scanned successfully!');
                isConnecting = true;
            }
            if (statusSession === 'isLogged') {
                console.log('✅ WhatsApp is ready!');
                isReady = true;
                isConnecting = false;
                currentQR = null;
            }
        }
    });

    // Ready event handler
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
            
            // Also try to load from Firebase
            if (db && conversations.size === 0) {
                console.log('📥 Trying to load from Firebase...');
                await loadConversationsFromFirebase();
            }
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
        // Ignore messages from me
        if (msg.fromMe) return;
        
        console.log(`📨 New message received from: ${msg.from}`);
        const contact = await msg.getContact();
        const chat = await msg.getChat();
        
        const conversationId = msg.from;
        const phoneNumber = contact.number || msg.from.replace('@c.us', '');
        
        console.log(`👤 Contact: ${contact.pushname || phoneNumber}`);
        console.log(`💬 Message: ${msg.body}`);
        
        // Create or update conversation
        if (!conversations.has(conversationId)) {
            conversations.set(conversationId, {
                id: conversationId,
                name: contact.pushname || contact.name || phoneNumber,
                phone: phoneNumber,
                avatar: await contact.getProfilePicUrl().catch(() => null),
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
        
        console.log(`✅ Message stored from ${contact.pushname || phoneNumber}`);
        
        // 🤖 AUTO-REPLY: Handle bot responses
        const messageHistory = messages.get(conversationId);
        const userMessages = messageHistory.filter(m => m.sender === 'user');
        
        let replyMessage = null;
        
        // First message - send welcome
        if (userMessages.length === 1) {
            console.log(`🤖 Sending welcome message to ${phoneNumber}`);
            replyMessage = `مرحبًا بك في *المسار الساخن للسفر والسياحة* 🔥🌍

يشرفنا نخدمك! اختر الخدمة المطلوبة:

1️⃣ حجز وحدات الضيافة 🏘️
2️⃣ حجز سيارات 🚗
3️⃣ البرامج والخدمات السياحية 🗺️
4️⃣ المرشدين السياحيين 👨‍🏫
5️⃣ خدمة العملاء 💬

*أرسل رقم الخيار المطلوب*`;
        } 
        // Handle menu selections
        else {
            const userInput = msg.body.trim();
            console.log(`🤖 Processing user input: ${userInput}`);
            
            // Main menu responses
            if (userInput === '1') {
                replyMessage = `ممتاز! اختر نوع وحدة الضيافة:

1️⃣ شاليهات 🏡
2️⃣ منتجعات 🏘️
3️⃣ شقق فندقية 🏢
0️⃣ رجوع ⬅️

*أرسل رقم الخيار*`;
            } 
            else if (userInput === '2') {
                replyMessage = `اختر نوع حجز السيارة:

1️⃣ حجز سيارة بسائق 🚖
2️⃣ حجز سيارة بدون سائق 🚗
0️⃣ رجوع ⬅️

*أرسل رقم الخيار*`;
            }
            else if (userInput === '3') {
                replyMessage = `اختر نوع الخدمة السياحية:

1️⃣ رحلات سياحية يومية 🌅
2️⃣ برامج سياحية كاملة 📋
3️⃣ تنظيم مناسبات 🎉
0️⃣ رجوع ⬅️

*أرسل رقم الخيار*`;
            }
            else if (userInput === '4') {
                replyMessage = `اختر نوع المرشد السياحي:

1️⃣ مرشد لغة عربية 🇸🇦
2️⃣ مرشد لغة إنجليزية 🇬🇧
3️⃣ مرشد متعدد اللغات 🌍
0️⃣ رجوع ⬅️

*أرسل رقم الخيار*`;
            }
            else if (userInput === '5') {
                replyMessage = `مرحبًا بك في خدمة العملاء 🤝🔥

1️⃣ استفسار عن حجز موجود 📋
2️⃣ تعديل حجز 🔄
3️⃣ إلغاء حجز ❌
4️⃣ شكوى أو اقتراح 💬
0️⃣ رجوع ⬅️

*أرسل رقم الخيار*`;
            }
            else if (userInput === '0') {
                replyMessage = `مرحبًا بك في *المسار الساخن للسفر والسياحة* 🔥🌍

يشرفنا نخدمك! اختر الخدمة المطلوبة:

1️⃣ حجز وحدات الضيافة 🏘️
2️⃣ حجز سيارات 🚗
3️⃣ البرامج والخدمات السياحية 🗺️
4️⃣ المرشدين السياحيين 👨‍🏫
5️⃣ خدمة العملاء 💬

*أرسل رقم الخيار المطلوب*`;
            }
            else {
                // Unknown input - send to human agent
                replyMessage = `✅ تم استلام رسالتك!

📋 سيتواصل معك موظفنا المختص قريباً.
⏱️ وقت الاستجابة: 5-10 دقائق

شكراً لتواصلك مع *المسار الساخن للسفر والسياحة* 🔥`;
            }
        }
        
        // Send auto-reply if available
        if (replyMessage) {
            try {
                await client.sendMessage(msg.from, replyMessage);
                
                // Store bot reply
                const botReply = {
                    id: `bot_${Date.now()}`,
                    text: replyMessage,
                    sender: 'bot',
                    timestamp: new Date(),
                    status: 'sent',
                    type: 'chat'
                };
                messages.get(conversationId).push(botReply);
                
                if (db) {
                    await saveMessagesToFirebase(conversationId, [botReply]);
                }
                
                console.log(`✅ Auto-reply sent to ${phoneNumber}`);
                
                // Notify all connected clients about new message
                io.emit('new_message', {
                    conversationId,
                    message: botReply
                });
                
            } catch (replyError) {
                console.error('❌ Error sending auto-reply:', replyError.message);
            }
        }
        
        // Notify all connected clients about new message
        io.emit('new_message', {
            conversationId,
            message: newMessage
        });
        
    } catch (error) {
        console.error('Error processing message:', error);
    }
    });
    
    return client;
}

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
server.listen(PORT, '0.0.0.0', async () => {
    console.log(`🚀 WhatsApp Server running on port ${PORT}`);
    console.log(`🌐 Server URL: http://0.0.0.0:${PORT}`);
    console.log(`🔌 WebSocket enabled for real-time updates`);
    console.log(`📱 Waiting for QR Code scan...`);
    console.log(`✅ Health check: http://0.0.0.0:${PORT}/health`);
    
    // Initialize WhatsApp client
    await initializeClient();
});
