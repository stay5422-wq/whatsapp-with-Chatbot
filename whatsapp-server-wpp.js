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
const userSessions = new Map(); // Track user's current question in the tree

// Question Tree
const questionTree = {
    "welcome": {
        "text": "مرحبًا بك في *المسار الساخن للسفر والسياحة* 🔥🌍\n\nيشرفنا نخدمك! اختر الخدمة المطلوبة:\n\n1️⃣ حجز وحدات الضيافة 🏘️\n2️⃣ حجز سيارات 🚗\n3️⃣ البرامج والخدمات السياحية 🗺️\n4️⃣ المرشدين السياحيين 👨‍🏫\n5️⃣ خدمة العملاء 💬",
        "options": {
            "1": "hospitality_units",
            "2": "car_rental",
            "3": "tours_activities",
            "4": "tour_guides",
            "5": "customer_support"
        }
    },
    "hospitality_units": {
        "text": "اختر نوع وحدة الضيافة:\n\n1️⃣ شاليهات 🏡\n2️⃣ منتجعات 🏘️\n3️⃣ شقق فندقية 🏢\n\n0️⃣ رجوع ⬅️",
        "options": {
            "1": "unit_details",
            "2": "unit_details",
            "3": "unit_details",
            "0": "welcome"
        }
    },
    "car_rental": {
        "text": "اختر نوع حجز السيارة:\n\n1️⃣ سيارة بدون سائق 🚙\n2️⃣ سيارة مع سائق 🚖\n\n0️⃣ رجوع ⬅️",
        "options": {
            "1": "car_details",
            "2": "car_details",
            "0": "welcome"
        }
    },
    "tours_activities": {
        "text": "اختر نوع الخدمة السياحية:\n\n1️⃣ جولات سياحية 🗺️\n2️⃣ تذاكر 🎫\n3️⃣ أنشطة ترفيهية 🎪\n\n0️⃣ رجوع ⬅️",
        "options": {
            "1": "tour_details",
            "2": "tour_details",
            "3": "tour_details",
            "0": "welcome"
        }
    },
    "tour_guides": {
        "text": "اختر نوع المرشد السياحي:\n\n1️⃣ مرشد باللغة العربية 🇸🇦\n2️⃣ مرشد باللغة الإنجليزية 🇬🇧\n3️⃣ مرشد بلغات أخرى 🌐\n\n0️⃣ رجوع ⬅️",
        "options": {
            "1": "guide_details",
            "2": "guide_details",
            "3": "guide_details",
            "0": "welcome"
        }
    },
    "customer_support": {
        "text": "مرحبًا بك في الدعم الفني 🤝🔥\n\nكيف يمكننا مساعدتك؟\n\n1️⃣ استفسار عن حجز موجود 📋\n2️⃣ تعديل حجز 📝\n3️⃣ إلغاء حجز ❌\n4️⃣ شكوى أو اقتراح 💡\n\n0️⃣ رجوع ⬅️",
        "options": {
            "1": "support_details",
            "2": "support_details",
            "3": "support_details",
            "4": "support_details",
            "0": "welcome"
        }
    },
    "unit_details": {
        "text": "من فضلك أرسل البيانات التالية:\n\n📍 المدينة / المنطقة\n📅 تاريخ الوصول والمغادرة\n👥 عدد الأشخاص\n🛏️ عدد الغرف (اختياري)\n\n_مثال:_ الرياض، من 10/12 إلى 15/12، 4 أشخاص، غرفتين",
        "requiresInput": true
    },
    "car_details": {
        "text": "من فضلك أرسل البيانات التالية:\n\n📍 المدينة\n📅 تاريخ الاستلام والتسليم\n🚗 نوع السيارة المفضل (اختياري)\n\n_مثال:_ جدة، من 5/12 إلى 8/12، سيارة عائلية",
        "requiresInput": true
    },
    "tour_details": {
        "text": "من فضلك أرسل البيانات التالية:\n\n📍 المدينة أو المعلم السياحي\n📅 التاريخ المفضل\n👥 عدد الأشخاص\n\n_مثال:_ الطائف، يوم الجمعة 15/12، 3 أشخاص",
        "requiresInput": true
    },
    "guide_details": {
        "text": "من فضلك أرسل البيانات التالية:\n\n📍 المدينة\n📅 التاريخ والمدة\n👥 عدد الأشخاص\n🗣️ اللغة المطلوبة\n\n_مثال:_ الدمام، يومين من 20/12، 5 أشخاص، عربي",
        "requiresInput": true
    },
    "support_details": {
        "text": "من فضلك اكتب استفسارك أو رقم الحجز، وسيتواصل معك الدعم الفني قريبًا 📞",
        "requiresInput": true
    },
    "confirmation": {
        "text": "✅ تم استلام طلبك بنجاح!\n\n📋 التفاصيل:\n{details}\n\n🔄 سيتواصل معك موظفنا المختص خلال دقائق.\n\nشكرًا لتواصلك مع *المسار الساخن للسفر والسياحة* 🔥\n\nهل تريد إجراء حجز آخر؟\n1️⃣ نعم\n2️⃣ لا، شكراً",
        "options": {
            "1": "welcome",
            "2": "goodbye"
        }
    },
    "goodbye": {
        "text": "شكراً لتواصلك معنا! 🙏\nنسعد بخدمتك في أي وقت 🔥🌍",
        "end": true
    }
};

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
        
        // Auto-reply with Question Tree chatbot
        if (message.body && !message.fromMe) {
            const userMessage = message.body.trim();
            let botReply = '';
            
            // Get user's current session
            let currentQuestion = userSessions.get(conversationId) || 'welcome';
            const questionData = questionTree[currentQuestion];
            
            // Check if waiting for user input
            if (questionData && questionData.requiresInput) {
                // User sent their details
                botReply = questionTree.confirmation.text.replace('{details}', userMessage);
                userSessions.set(conversationId, 'confirmation');
            } else if (questionData && questionData.options) {
                // User selected an option
                const selectedOption = questionData.options[userMessage];
                
                if (selectedOption) {
                    const nextQuestion = questionTree[selectedOption];
                    if (nextQuestion) {
                        botReply = nextQuestion.text;
                        userSessions.set(conversationId, selectedOption);
                        
                        // If it's the end, reset session
                        if (nextQuestion.end) {
                            userSessions.delete(conversationId);
                        }
                    }
                } else {
                    // Invalid option, repeat current question
                    botReply = '❌ اختيار غير صحيح. من فضلك اختر من الخيارات التالية:\n\n' + questionData.text;
                }
            } else {
                // Start from welcome
                botReply = questionTree.welcome.text;
                userSessions.set(conversationId, 'welcome');
            }
            
            // Send bot reply
            try {
                await client.sendText(conversationId, botReply);
                console.log(`🤖 Bot replied to ${phoneNumber}`);
                
                // Add bot message to conversation
                const botMessage = {
                    id: `bot_${Date.now()}`,
                    text: botReply,
                    sender: 'agent',
                    timestamp: new Date(),
                    status: 'delivered',
                    type: 'chat'
                };
                messages.get(conversationId).push(botMessage);
            } catch (err) {
                console.error('Error sending bot reply:', err.message);
            }
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
