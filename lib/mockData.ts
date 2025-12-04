import { Conversation, Message, QuickReply, User } from '@/types';

// Mock Users Data
export const mockUsers: User[] = [
  {
    id: '1',
    username: 'akram',
    password: 'akram2026',
    name: 'Eng. Akram Elmasry',
    role: 'admin',
    department: 'all',
    isActive: true,
  },
  {
    id: '2',
    username: 'units_agent',
    password: '123456',
    name: 'موظف الوحدات',
    role: 'agent',
    department: 'units',
    isActive: true,
  },
  {
    id: '3',
    username: 'cars_agent',
    password: '123456',
    name: 'موظف السيارات',
    role: 'agent',
    department: 'cars',
    isActive: true,
  },
  {
    id: '4',
    username: 'tourism_agent',
    password: '123456',
    name: 'موظف الباقات السياحية',
    role: 'agent',
    department: 'tourism',
    isActive: true,
  },
  {
    id: '5',
    username: 'complaints_agent',
    password: '123456',
    name: 'موظف الشكاوى',
    role: 'agent',
    department: 'complaints',
    isActive: true,
  },
];

// Mock Conversations Data
export const mockConversations: Conversation[] = [
  {
    id: '1',
    contactName: 'م. أكرم المصري',
    phone: '+966559902557',
    phoneNumber: '+966559902557',
    avatar: 'A',
    lastMessage: 'مرحباً، أنا بحاجة لمساعدة',
    timestamp: new Date(Date.now() - 1000 * 60 * 5), // 5 minutes ago
    unreadCount: 3,
    isOnline: true,
    assignedTo: 'Admin',
    currentQuestionId: 'welcome',
  },
  {
    id: '2',
    contactName: 'سارة أحمد',
    phone: '+966542473378',
    phoneNumber: '+966542473378',
    avatar: 'S',
    lastMessage: 'شكراً على المساعدة',
    timestamp: new Date(Date.now() - 1000 * 60 * 15), // 15 minutes ago
    unreadCount: 0,
    isOnline: true,
    department: 'units',
    currentQuestionId: 'welcome',
  },
  {
    id: '3',
    contactName: 'واتساب الأعمال',
    phone: '+966501234567',
    phoneNumber: '+966501234567',
    avatar: 'W',
    lastMessage: 'هل يمكنك مساعدتي؟',
    timestamp: new Date(Date.now() - 1000 * 60 * 30), // 30 minutes ago
    unreadCount: 1,
    isOnline: false,
    department: 'cars',
    currentQuestionId: 'welcome',
  },
  {
    id: '4',
    contactName: 'المسار السابق للسفر والسياحة',
    phone: '+966501234568',
    phoneNumber: '+966501234568',
    avatar: 'M',
    lastMessage: 'أرغب في حجز رحلة',
    timestamp: new Date(Date.now() - 1000 * 60 * 60), // 1 hour ago
    unreadCount: 0,
    isOnline: false,
    assignedTo: 'Support Team',
  },
  {
    id: '5',
    contactName: 'الرزم الموحد',
    phone: '+966501234569',
    phoneNumber: '+966501234569',
    avatar: 'R',
    lastMessage: 'ما هي الأسعار المتاحة؟',
    timestamp: new Date(Date.now() - 1000 * 60 * 120), // 2 hours ago
    unreadCount: 2,
    isOnline: true,
    department: 'tourism',
    currentQuestionId: 'welcome',
  },
  {
    id: '6',
    contactName: 'مناقشة آخر الأحداث',
    phone: '+966501234570',
    phoneNumber: '+966501234570',
    avatar: 'M',
    lastMessage: 'نعم، أوافق على ذلك',
    timestamp: new Date(Date.now() - 1000 * 60 * 240), // 4 hours ago
    unreadCount: 0,
    isOnline: false,
    department: 'complaints',
    currentQuestionId: 'welcome',
  },
  {
    id: '7',
    contactName: 'تسنيم',
    phone: '+966501234571',
    phoneNumber: '+966501234571',
    avatar: 'T',
    lastMessage: 'تم الإرسال بنجاح',
    timestamp: new Date(Date.now() - 1000 * 60 * 360), // 6 hours ago
    unreadCount: 0,
    isOnline: true,
  },
];

// Mock Messages Data
export const mockMessages: { [conversationId: string]: Message[] } = {
  '1': [
    {
      id: '1',
      text: 'مرحباً، كيف يمكنني مساعدتك اليوم؟',
      sender: 'agent',
      timestamp: new Date(Date.now() - 1000 * 60 * 10),
      status: 'read',
    },
    {
      id: '2',
      text: 'أنا بحاجة لمعلومات عن المنتجات المتاحة',
      sender: 'user',
      timestamp: new Date(Date.now() - 1000 * 60 * 8),
      status: 'delivered',
    },
    {
      id: '3',
      text: 'بالتأكيد! لدينا مجموعة واسعة من المنتجات. ما الذي تبحث عنه تحديداً؟',
      sender: 'agent',
      timestamp: new Date(Date.now() - 1000 * 60 * 7),
      status: 'read',
    },
    {
      id: '4',
      text: 'أبحث عن حلول تقنية متطورة',
      sender: 'user',
      timestamp: new Date(Date.now() - 1000 * 60 * 5),
      status: 'sent',
    },
  ],
  '2': [
    {
      id: '1',
      text: 'شكراً لتواصلك معنا',
      sender: 'agent',
      timestamp: new Date(Date.now() - 1000 * 60 * 20),
      status: 'read',
    },
    {
      id: '2',
      text: 'شكراً على المساعدة',
      sender: 'user',
      timestamp: new Date(Date.now() - 1000 * 60 * 15),
      status: 'delivered',
    },
  ],
  '3': [
    {
      id: '1',
      text: 'هل يمكنك مساعدتي؟',
      sender: 'user',
      timestamp: new Date(Date.now() - 1000 * 60 * 30),
      status: 'sent',
    },
  ],
};

// Mock Quick Replies
export const mockQuickReplies: QuickReply[] = [
  { id: '1', text: 'مرحباً! كيف يمكنني مساعدتك اليوم؟' },
  { id: '2', text: 'شكراً لتواصلك معنا. سنرد عليك في أقرب وقت.' },
  { id: '3', text: 'هل لديك أي أسئلة أخرى؟' },
  { id: '4', text: 'سعداء بخدمتك! 😊' },
  { id: '5', text: 'تم استلام طلبك وسنعمل عليه فوراً.' },
];
