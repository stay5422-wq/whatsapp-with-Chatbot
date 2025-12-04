'use client';

import { useState, useCallback, useMemo } from 'react';
import dynamic from 'next/dynamic';
import { Toaster, toast } from 'react-hot-toast';
import { AnimatePresence } from 'framer-motion';
import ConversationsSidebar from '@/components/ConversationsSidebar';
import ChatArea from '@/components/ChatArea';
import LoginPage from '@/components/LoginPage';
import { Conversation, Message, QuickReply, FilterType, User } from '@/types';
import { mockConversations, mockMessages, mockQuickReplies, mockUsers } from '@/lib/mockData';
import { LogOut } from 'lucide-react';

// Lazy load components for better performance
const AnimatedStars = dynamic(() => import('@/components/AnimatedStars'), {
  ssr: false,
});

const ContactInfoPanel = dynamic(() => import('@/components/ContactInfoPanel'), {
  ssr: false,
});

export default function Home() {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [conversations, setConversations] = useState<Conversation[]>(mockConversations);
  const [selectedConversation, setSelectedConversation] = useState<Conversation | null>(null);
  const [messages, setMessages] = useState<{ [conversationId: string]: Message[] }>(mockMessages);
  const [quickReplies, setQuickReplies] = useState<QuickReply[]>(mockQuickReplies);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeFilter, setActiveFilter] = useState<FilterType>('all');
  const [showContactInfo, setShowContactInfo] = useState(false);

  // Filter conversations based on user department
  const filteredConversations = useMemo(() => {
    if (!currentUser) return [];
    
    return conversations.filter((conv) => {
      // Admin sees all conversations
      if (currentUser.role === 'admin' || currentUser.department === 'all') {
        return true;
      }
      
      // Agents see only conversations in their department
      return conv.department === currentUser.department || !conv.department;
    });
  }, [conversations, currentUser]);

  // Memoize current messages
  const currentMessages = useMemo(() => {
    return selectedConversation ? messages[selectedConversation.id] || [] : [];
  }, [selectedConversation, messages]);

  // Handle login
  const handleLogin = useCallback((user: User) => {
    setCurrentUser(user);
    toast.success(`مرحباً ${user.name}!`);
  }, []);

  // Handle logout
  const handleLogout = useCallback(() => {
    setCurrentUser(null);
    setSelectedConversation(null);
    toast.success('تم تسجيل الخروج بنجاح');
  }, []);

  // Assign conversation to user
  const handleAssignConversation = useCallback((conversationId: string, userId: string) => {
    setConversations((prev) =>
      prev.map((conv) => {
        if (conv.id === conversationId) {
          // Find user to get their name
          const user = mockConversations.find(() => true); // Placeholder, should get from users list
          return { 
            ...conv, 
            assignedTo: userId,
            assignedToName: `موظف ${userId.slice(-2)}`
          };
        }
        return conv;
      })
    );
  }, []);

  // Update conversation (for screen sharing, etc.)
  const handleUpdateConversation = useCallback((conversationId: string, updates: Partial<Conversation>) => {
    setConversations((prev) =>
      prev.map((conv) =>
        conv.id === conversationId
          ? { ...conv, ...updates }
          : conv
      )
    );
    
    if (selectedConversation?.id === conversationId) {
      setSelectedConversation((prev) => prev ? { ...prev, ...updates } : null);
    }
  }, [selectedConversation]);

  // Handle conversation selection with useCallback for performance
  const handleSelectConversation = useCallback((conversation: Conversation) => {
    setSelectedConversation(conversation);
    setShowContactInfo(false);
    
    // Mark as read
    setConversations((prev) =>
      prev.map((conv) =>
        conv.id === conversation.id ? { ...conv, unreadCount: 0 } : conv
      )
    );
  }, []);

  // Handle sending message
  const handleSendMessage = useCallback((text: string, sender: 'user' | 'agent' | 'bot' = 'user') => {
    if (!selectedConversation) return;

    const newMessage: Message = {
      id: Date.now().toString(),
      text,
      sender,
      timestamp: new Date(),
      status: 'sent',
    };

    setMessages((prev) => ({
      ...prev,
      [selectedConversation.id]: [...(prev[selectedConversation.id] || []), newMessage],
    }));

    // Update last message in conversation
    setConversations((prev) =>
      prev.map((conv) =>
        conv.id === selectedConversation.id
          ? { ...conv, lastMessage: text, timestamp: new Date() }
          : conv
      )
    );

    if (sender === 'user') {
      toast.success('تم إرسال الرسالة');
    }

    // Simulate response after 2 seconds
    setTimeout(() => {
      const responseMessage: Message = {
        id: (Date.now() + 1).toString(),
        text: 'شكراً لرسالتك، سنرد عليك في أقرب وقت ممكن.',
        sender: 'agent',
        timestamp: new Date(),
        status: 'delivered',
      };

      setMessages((prev) => ({
        ...prev,
        [selectedConversation.id]: [...(prev[selectedConversation.id] || []), responseMessage],
      }));
    }, 2000);
  }, [selectedConversation]);

  // Quick Replies CRUD
  const handleAddQuickReply = useCallback((text: string) => {
    const newReply: QuickReply = {
      id: Date.now().toString(),
      text,
    };
    setQuickReplies((prev) => [...prev, newReply]);
    toast.success('تمت إضافة الرد السريع');
  }, []);

  const handleEditQuickReply = useCallback((id: string, text: string) => {
    setQuickReplies((prev) =>
      prev.map((reply) => (reply.id === id ? { ...reply, text } : reply))
    );
    toast.success('تم تحديث الرد السريع');
  }, []);

  const handleDeleteQuickReply = useCallback((id: string) => {
    setQuickReplies((prev) => prev.filter((reply) => reply.id !== id));
    toast.success('تم حذف الرد السريع');
  }, []);

  // Show login page if not authenticated
  if (!currentUser) {
    return <LoginPage onLogin={handleLogin} />;
  }

  return (
    <main className="relative min-h-screen overflow-hidden">
      {/* Toaster for notifications */}
      <Toaster
        position="top-center"
        toastOptions={{
          duration: 3000,
          style: {
            background: '#1a2332',
            color: '#fff',
            border: '1px solid rgba(59, 130, 246, 0.2)',
          },
        }}
      />

      {/* Background */}
      <div className="fixed inset-0 -z-10">
        {/* Gradient Background */}
        <div className="absolute inset-0 bg-gradient-to-br from-dark-500 via-dark-600 to-dark-700" />
        
        {/* Blurred Orbs */}
        <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-blue-600/20 rounded-full blur-[150px]" />
        <div className="absolute bottom-0 left-0 w-[600px] h-[600px] bg-cyan-600/20 rounded-full blur-[150px]" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[400px] h-[400px] bg-purple-600/10 rounded-full blur-[120px]" />
        
        {/* Animated Stars */}
        <AnimatedStars />
      </div>

      {/* Main Content */}
      <div className="relative flex h-screen" dir="rtl">
        {/* User Info Bar */}
        <div className="absolute top-4 left-4 z-50 flex items-center gap-3 bg-dark-100/95 backdrop-blur-xl border border-blue-500/20 rounded-xl px-4 py-2 shadow-lg">
          <div className="text-right">
            <p className="text-sm font-semibold text-white">{currentUser.name}</p>
            <p className="text-xs text-gray-400">
              {currentUser.role === 'admin' ? 'مدير النظام' : `قسم ${getDepartmentName(currentUser.department)}`}
            </p>
          </div>
          <button
            onClick={handleLogout}
            className="p-2 hover:bg-red-500/20 rounded-lg transition-colors group"
            title="تسجيل الخروج"
          >
            <LogOut className="w-5 h-5 text-gray-400 group-hover:text-red-400" />
          </button>
        </div>

        {/* Conversations Sidebar */}
        <ConversationsSidebar
          conversations={filteredConversations}
          selectedConversation={selectedConversation}
          onSelectConversation={handleSelectConversation}
          searchQuery={searchQuery}
          onSearchChange={setSearchQuery}
          activeFilter={activeFilter}
          onFilterChange={setActiveFilter}
        />

        {/* Chat Area */}
        <ChatArea
          conversation={selectedConversation}
          messages={currentMessages}
          onSendMessage={handleSendMessage}
          onOpenContactInfo={() => setShowContactInfo(true)}
          quickReplies={quickReplies}
          onAddQuickReply={handleAddQuickReply}
          onEditQuickReply={handleEditQuickReply}
          onDeleteQuickReply={handleDeleteQuickReply}
          users={mockUsers.filter(u => u.isActive)}
          currentUser={currentUser!}
          onAssignConversation={handleAssignConversation}
          onUpdateConversation={handleUpdateConversation}
        />

        {/* Contact Info Panel */}
        <AnimatePresence>
          {showContactInfo && selectedConversation && (
            <ContactInfoPanel
              conversation={selectedConversation}
              onClose={() => setShowContactInfo(false)}
            />
          )}
        </AnimatePresence>
      </div>
    </main>
  );
}

// Helper function to get department name in Arabic
function getDepartmentName(department: string): string {
  const names: { [key: string]: string } = {
    all: 'جميع الأقسام',
    bookings: 'الحجوزات',
    units: 'الوحدات السكنية',
    cars: 'السيارات',
    tourism: 'الباقات السياحية',
    events: 'الحفلات',
    inquiries: 'الاستفسارات',
    pricing: 'الأسعار',
    scheduling: 'المواعيد',
    services: 'الخدمات',
    complaints: 'الشكاوى',
    support: 'الدعم الفني',
  };
  return names[department] || department;
}
