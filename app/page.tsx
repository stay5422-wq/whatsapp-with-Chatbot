'use client';

import { useState, useCallback, useMemo } from 'react';
import dynamic from 'next/dynamic';
import { Toaster, toast } from 'react-hot-toast';
import { AnimatePresence } from 'framer-motion';
import ConversationsSidebar from '@/components/ConversationsSidebar';
import ChatArea from '@/components/ChatArea';
import LoginPage from '@/components/LoginPage';
import SettingsModal from '@/components/SettingsModal';
import { Conversation, Message, QuickReply, FilterType, User } from '@/types';
import { mockUsers } from '@/lib/mockData';
import { LogOut, Plus, Settings } from 'lucide-react';

// Lazy load components for better performance
const AnimatedStars = dynamic(() => import('@/components/AnimatedStars'), {
  ssr: false,
});

const ContactInfoPanel = dynamic(() => import('@/components/ContactInfoPanel'), {
  ssr: false,
});

export default function Home() {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [selectedConversation, setSelectedConversation] = useState<Conversation | null>(null);
  const [messages, setMessages] = useState<{ [conversationId: string]: Message[] }>({});
  const [quickReplies, setQuickReplies] = useState<QuickReply[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeFilter, setActiveFilter] = useState<FilterType>('all');
  const [showContactInfo, setShowContactInfo] = useState(false);
  const [showNewChatModal, setShowNewChatModal] = useState(false);
  const [newPhoneNumber, setNewPhoneNumber] = useState('');
  const [showSettings, setShowSettings] = useState(false);
  const [users, setUsers] = useState<User[]>(mockUsers);
  const [botEnabled, setBotEnabled] = useState(true);

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

  // Handle new conversation
  const handleCreateNewConversation = useCallback(() => {
    if (!newPhoneNumber.trim()) {
      toast.error('الرجاء إدخال رقم الهاتف');
      return;
    }

    // Validate phone number format
    const phoneRegex = /^[0-9+\s()-]+$/;
    if (!phoneRegex.test(newPhoneNumber)) {
      toast.error('رقم الهاتف غير صحيح');
      return;
    }

    const newConversation: Conversation = {
      id: Date.now().toString(),
      name: newPhoneNumber,
      phone: newPhoneNumber,
      avatar: `https://ui-avatars.com/api/?name=${encodeURIComponent(newPhoneNumber)}&background=3b82f6&color=fff`,
      lastMessage: 'محادثة جديدة',
      timestamp: new Date(),
      unreadCount: 0,
      status: 'active',
      department: currentUser?.department || 'inquiries',
    };

    setConversations((prev) => [newConversation, ...prev]);
    setMessages((prev) => ({ ...prev, [newConversation.id]: [] }));
    setSelectedConversation(newConversation);
    setShowNewChatModal(false);
    setNewPhoneNumber('');
    toast.success('تم إنشاء المحادثة بنجاح');
  }, [newPhoneNumber, currentUser]);

  // User Management Functions
  const handleAddUser = useCallback((user: User) => {
    setUsers((prev) => [...prev, user]);
  }, []);

  const handleEditUser = useCallback((id: string, updates: Partial<User>) => {
    setUsers((prev) =>
      prev.map((user) => (user.id === id ? { ...user, ...updates } : user))
    );
  }, []);

  const handleDeleteUser = useCallback((id: string) => {
    setUsers((prev) => prev.filter((user) => user.id !== id));
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
          const user = users.find((u) => u.id === userId);
          return { 
            ...conv, 
            assignedTo: userId,
            assignedToName: user?.name || `موظف ${userId.slice(-2)}`
          };
        }
        return conv;
      })
    );
  }, [users]);

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
  const handleSendMessage = useCallback(async (text: string, sender: 'user' | 'agent' | 'bot' = 'user') => {
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

    // Send message via WhatsApp API if it's from agent
    if (sender === 'agent' || sender === 'user') {
      try {
        const response = await fetch('/api/whatsapp/send', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            to: selectedConversation.phone,
            message: text,
          }),
        });

        if (response.ok) {
          toast.success('تم إرسال الرسالة');
          // Update message status to delivered
          setMessages((prev) => ({
            ...prev,
            [selectedConversation.id]: prev[selectedConversation.id].map((msg) =>
              msg.id === newMessage.id ? { ...msg, status: 'delivered' } : msg
            ),
          }));
        } else {
          throw new Error('Failed to send message');
        }
      } catch (error) {
        console.error('Error sending message:', error);
        toast.error('فشل إرسال الرسالة');
        // Update message status to failed
        setMessages((prev) => ({
          ...prev,
          [selectedConversation.id]: prev[selectedConversation.id].map((msg) =>
            msg.id === newMessage.id ? { ...msg, status: 'failed' } : msg
          ),
        }));
      }
    }
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
        <div className="absolute top-4 left-4 z-50 flex items-center gap-3">
          {/* New Chat Button */}
          <button
            onClick={() => setShowNewChatModal(true)}
            className="flex items-center gap-2 bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700 text-white px-4 py-2 rounded-xl transition-all shadow-lg hover:shadow-blue-500/50"
            title="محادثة جديدة"
          >
            <Plus className="w-5 h-5" />
            <span className="text-sm font-semibold">محادثة جديدة</span>
          </button>

          {/* User Info */}
          <div className="flex items-center gap-3 bg-dark-100/95 backdrop-blur-xl border border-blue-500/20 rounded-xl px-4 py-2 shadow-lg">
            <div className="text-right">
              <p className="text-sm font-semibold text-white">{currentUser.name}</p>
              <p className="text-xs text-gray-400">
                {currentUser.role === 'admin' ? 'مدير النظام' : `قسم ${getDepartmentName(currentUser.department)}`}
              </p>
            </div>
            <div className="flex gap-2">
              {currentUser.role === 'admin' && (
                <button
                  onClick={() => setShowSettings(true)}
                  className="p-2 hover:bg-blue-500/20 rounded-lg transition-colors group"
                  title="الإعدادات"
                >
                  <Settings className="w-5 h-5 text-gray-400 group-hover:text-blue-400" />
                </button>
              )}
              <button
                onClick={handleLogout}
                className="p-2 hover:bg-red-500/20 rounded-lg transition-colors group"
                title="تسجيل الخروج"
              >
                <LogOut className="w-5 h-5 text-gray-400 group-hover:text-red-400" />
              </button>
            </div>
          </div>
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
          users={users.filter(u => u.isActive)}
          currentUser={currentUser!}
          onAssignConversation={handleAssignConversation}
          onUpdateConversation={handleUpdateConversation}
          botEnabled={botEnabled}
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

        {/* New Chat Modal */}
        <AnimatePresence>
          {showNewChatModal && (
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
              <div className="bg-dark-100 border border-blue-500/20 rounded-2xl p-6 w-full max-w-md mx-4 shadow-2xl">
                <h3 className="text-xl font-bold text-white mb-4">محادثة جديدة</h3>
                <p className="text-gray-400 text-sm mb-4">أدخل رقم الهاتف لبدء محادثة واتساب جديدة</p>
                
                <input
                  type="text"
                  value={newPhoneNumber}
                  onChange={(e) => setNewPhoneNumber(e.target.value)}
                  placeholder="مثال: +201234567890"
                  className="w-full bg-dark-200 border border-gray-700 rounded-xl px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:border-blue-500 transition-colors mb-4"
                  dir="ltr"
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      handleCreateNewConversation();
                    }
                  }}
                />

                <div className="flex gap-3">
                  <button
                    onClick={handleCreateNewConversation}
                    className="flex-1 bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700 text-white py-3 rounded-xl font-semibold transition-all"
                  >
                    إنشاء المحادثة
                  </button>
                  <button
                    onClick={() => {
                      setShowNewChatModal(false);
                      setNewPhoneNumber('');
                    }}
                    className="flex-1 bg-dark-200 hover:bg-dark-300 text-gray-300 py-3 rounded-xl font-semibold transition-all"
                  >
                    إلغاء
                  </button>
                </div>
              </div>
            </div>
          )}
        </AnimatePresence>

        {/* Settings Modal */}
        <SettingsModal
          isOpen={showSettings}
          onClose={() => setShowSettings(false)}
          currentUser={currentUser}
          users={users}
          onAddUser={handleAddUser}
          onEditUser={handleEditUser}
          onDeleteUser={handleDeleteUser}
          quickReplies={quickReplies}
          onAddQuickReply={handleAddQuickReply}
          onEditQuickReply={handleEditQuickReply}
          onDeleteQuickReply={handleDeleteQuickReply}
          botEnabled={botEnabled}
          onToggleBot={setBotEnabled}
        />

        {/* Developer Credit - Footer */}
        <div className="fixed bottom-4 left-4 z-10">
          <div className="bg-dark-200/80 backdrop-blur-xl border border-blue-500/20 rounded-xl px-4 py-2 shadow-lg">
            <div className="flex items-center gap-2">
              <div className="relative">
                <div className="absolute inset-0 bg-gradient-to-r from-blue-600 to-cyan-600 rounded-full blur-sm opacity-50"></div>
                <img
                  src="/images/developer.jpg"
                  alt="Eng. Akram Elmasry"
                  className="relative w-8 h-8 rounded-full object-cover border border-blue-500/50"
                  onError={(e) => {
                    e.currentTarget.style.display = 'none';
                    if (e.currentTarget.nextElementSibling) {
                      (e.currentTarget.nextElementSibling as HTMLElement).classList.remove('hidden');
                    }
                  }}
                />
                <div className="hidden relative w-8 h-8 rounded-full bg-gradient-to-br from-blue-600 to-cyan-600 flex items-center justify-center text-white font-bold text-xs border border-blue-500/50">
                  AE
                </div>
              </div>
              <div className="text-right">
                <p className="text-xs font-semibold text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-cyan-400">
                  Eng. Akram Elmasry
                </p>
                <p className="text-[10px] text-gray-500">Developer</p>
              </div>
            </div>
          </div>
        </div>
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
