'use client';

import { Conversation, Message, QuickReply, User } from '@/types';
import { Phone, Video, Info, Send, Zap, Check, CheckCheck, Bot, Smile, Mic, Paperclip, Monitor, UserPlus, Image, File, Pause, Play } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useEffect, useRef, useState } from 'react';
import QuickRepliesPanel from './QuickRepliesPanel';
import useChatBot from './ChatBot';
import EmojiPicker from './EmojiPicker';
import AssignmentModal from './AssignmentModal';
import ScreenSharePanel from './ScreenSharePanel';
import toast from 'react-hot-toast';

interface ChatAreaProps {
  conversation: Conversation | null;
  messages: Message[];
  onSendMessage: (text: string, sender?: 'user' | 'agent' | 'bot') => void;
  onOpenContactInfo: () => void;
  quickReplies: QuickReply[];
  onAddQuickReply: (text: string) => void;
  onEditQuickReply: (id: string, text: string) => void;
  onDeleteQuickReply: (id: string) => void;
  users: User[];
  currentUser: User;
  onAssignConversation: (conversationId: string, userId: string) => void;
  onUpdateConversation: (conversationId: string, updates: Partial<Conversation>) => void;
  botEnabled: boolean;
}

const ChatArea = ({
  conversation,
  messages,
  onSendMessage,
  onOpenContactInfo,
  quickReplies,
  onAddQuickReply,
  onEditQuickReply,
  onDeleteQuickReply,
  users,
  currentUser,
  onAssignConversation,
  onUpdateConversation,
  botEnabled,
}: ChatAreaProps) => {
  const [messageText, setMessageText] = useState('');
  const [showQuickReplies, setShowQuickReplies] = useState(false);
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [showAssignModal, setShowAssignModal] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [recordingTime, setRecordingTime] = useState(0);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Initialize ChatBot
  const bot = conversation && botEnabled ? useChatBot({
    conversation,
    onSendBotMessage: (message) => {
      onSendMessage(message.text, 'bot');
    },
    onUpdateConversation: (updates) => {
      if (conversation) {
        onUpdateConversation(conversation.id, updates);
      }
    },
  }) : null;

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Initialize bot on conversation start
  useEffect(() => {
    if (bot && conversation && botEnabled) {
      bot.initializeBot();
    }
  }, [conversation?.id, botEnabled]);

  const handleSend = () => {
    if (messageText.trim()) {
      onSendMessage(messageText);
      
      // If bot is enabled and waiting for input, handle it
      if (bot && botEnabled && bot.isWaitingForInput()) {
        bot.handleUserInput(messageText);
      }
      
      setMessageText('');
    }
  };

  const handleQuickReplySelect = (text: string) => {
    setMessageText(text);
    setShowQuickReplies(false);
  };

  const handleEmojiSelect = (emoji: string) => {
    setMessageText(prev => prev + emoji);
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      const file = files[0];
      const fileType = file.type.startsWith('image/') ? 'صورة' : 
                       file.type.startsWith('video/') ? 'فيديو' : 'ملف';
      toast.success(`تم اختيار ${fileType}: ${file.name}`);
      onSendMessage(`📎 تم إرسال ${fileType}: ${file.name}`);
    }
  };

  const handleVoiceRecord = () => {
    if (!isRecording) {
      setIsRecording(true);
      setRecordingTime(0);
      toast.success('بدء التسجيل الصوتي');
      
      // Simulate recording timer
      const interval = setInterval(() => {
        setRecordingTime(prev => prev + 1);
      }, 1000);
      
      // Auto stop after 60 seconds
      setTimeout(() => {
        clearInterval(interval);
        if (isRecording) {
          handleStopRecording();
        }
      }, 60000);
    } else {
      handleStopRecording();
    }
  };

  const handleStopRecording = () => {
    setIsRecording(false);
    const duration = recordingTime;
    setRecordingTime(0);
    toast.success(`تم إرسال رسالة صوتية (${duration} ثانية)`);
    onSendMessage(`🎤 رسالة صوتية (${duration} ثانية)`);
  };

  const handleAssign = (userId: string) => {
    const user = users.find(u => u.id === userId);
    if (conversation && user) {
      onAssignConversation(conversation.id, userId);
      toast.success(`تم إسناد المحادثة إلى ${user.name}`);
    }
  };

  const handleStartScreenShare = () => {
    if (conversation) {
      onUpdateConversation(conversation.id, {
        isScreenSharing: true,
        screenShareBy: currentUser.name,
      });
      toast.success('تم بدء مشاركة الشاشة');
    }
  };

  const handleStopScreenShare = () => {
    if (conversation) {
      onUpdateConversation(conversation.id, {
        isScreenSharing: false,
        screenShareBy: undefined,
        screenShareWithColleagues: [],
      });
      toast.success('تم إيقاف مشاركة الشاشة');
    }
  };

  const handleShareWithColleague = (colleagueId: string) => {
    if (conversation) {
      const currentColleagues = conversation.screenShareWithColleagues || [];
      const colleague = users.find(u => u.id === colleagueId);
      
      onUpdateConversation(conversation.id, {
        screenShareWithColleagues: [...currentColleagues, colleagueId],
      });
      
      toast.success(`تم مشاركة الشاشة مع ${colleague?.name || 'زميل'}`);
    }
  };

  const handleStopColleagueShare = (colleagueId: string) => {
    if (conversation) {
      const currentColleagues = conversation.screenShareWithColleagues || [];
      const colleague = users.find(u => u.id === colleagueId);
      
      onUpdateConversation(conversation.id, {
        screenShareWithColleagues: currentColleagues.filter(id => id !== colleagueId),
      });
      
      toast.success(`تم إيقاف المشاركة مع ${colleague?.name || 'زميل'}`);
    }
  };

  if (!conversation) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="text-center"
        >
          <div className="w-32 h-32 mx-auto mb-6 rounded-full bg-gradient-to-br from-blue-500 to-cyan-500 p-1 shadow-2xl shadow-blue-500/50">
            <img 
              src="/images/logo.jpg" 
              alt="Logo" 
              className="w-full h-full rounded-full object-cover"
              onError={(e) => {
                e.currentTarget.style.display = 'none';
                e.currentTarget.nextElementSibling?.classList.remove('hidden');
              }}
            />
            <div className="hidden w-full h-full rounded-full bg-gradient-to-br from-blue-600 to-cyan-600 flex items-center justify-center text-white font-bold text-5xl">
              AE
            </div>
          </div>
          <h2 className="text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-cyan-400 mb-2">
            مرحباً بك في صندوق الوارد
          </h2>
          <p className="text-gray-400">اختر محادثة لبدء المراسلة</p>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="flex-1 flex flex-col h-screen">
      {/* Chat Header */}
      <div className="p-4 border-b border-blue-500/20 bg-dark-100/50 backdrop-blur-xl">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="relative">
              <div className="w-12 h-12 rounded-full bg-gradient-to-br from-blue-500 to-cyan-500 flex items-center justify-center text-white font-bold text-lg">
                {(conversation.name || conversation.contactName || conversation.phone).charAt(0)}
              </div>
              {conversation.isOnline && (
                <div className="absolute bottom-0 left-0 w-3 h-3 bg-green-500 rounded-full border-2 border-dark-100"></div>
              )}
            </div>
            <div>
              <h2 className="font-bold text-white">{conversation.contactName}</h2>
              <p className="text-sm text-gray-400">{conversation.phoneNumber}</p>
            </div>
          </div>

          <div className="flex gap-2">
            <button
              onClick={() => setShowAssignModal(true)}
              className="p-3 hover:bg-green-500/10 rounded-lg transition-all group relative"
              title="إسناد لموظف"
            >
              <UserPlus className="w-5 h-5 text-green-400" />
              {conversation.assignedToName && (
                <span className="absolute -top-1 -right-1 w-3 h-3 bg-green-500 rounded-full"></span>
              )}
            </button>
            <button
              onClick={conversation.isScreenSharing ? handleStopScreenShare : handleStartScreenShare}
              className={`p-3 rounded-lg transition-all ${
                conversation.isScreenSharing
                  ? 'bg-purple-500/20 text-purple-400'
                  : 'hover:bg-purple-500/10 text-gray-400'
              }`}
              title={conversation.isScreenSharing ? 'إيقاف مشاركة الشاشة' : 'مشاركة الشاشة'}
            >
              <Monitor className="w-5 h-5" />
            </button>
            <button
              onClick={() => toast('يتم التحكم في البوت من الإعدادات ⚙️', { icon: 'ℹ️' })}
              className={`p-3 rounded-lg transition-all ${
                botEnabled
                  ? 'bg-blue-500/20 text-blue-400'
                  : 'hover:bg-blue-500/10 text-gray-400'
              }`}
              title={botEnabled ? 'تعطيل البوت' : 'تفعيل البوت'}
            >
              <Bot className="w-5 h-5" />
            </button>
            <button className="p-3 hover:bg-blue-500/10 rounded-lg transition-all">
              <Phone className="w-5 h-5 text-blue-400" />
            </button>
            <button className="p-3 hover:bg-blue-500/10 rounded-lg transition-all">
              <Video className="w-5 h-5 text-blue-400" />
            </button>
            <button
              onClick={onOpenContactInfo}
              className="p-3 hover:bg-blue-500/10 rounded-lg transition-all"
            >
              <Info className="w-5 h-5 text-blue-400" />
            </button>
          </div>
        </div>
      </div>

      {/* Screen Share Panel */}
      <div className="px-4">
        <ScreenSharePanel
          conversation={conversation}
          currentUserName={currentUser.name}
          onStartShare={handleStartScreenShare}
          onStopShare={handleStopScreenShare}
          users={users}
          onShareWithColleague={handleShareWithColleague}
          onStopColleagueShare={handleStopColleagueShare}
        />
      </div>

      {/* Assignment Info */}
      {conversation.assignedToName && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="px-4 py-2 bg-green-500/10 border-b border-green-500/20"
        >
          <p className="text-sm text-green-400 text-center">
            ✓ مُسندة إلى: <span className="font-semibold">{conversation.assignedToName}</span>
          </p>
        </motion.div>
      )}

      {/* Messages Area */}
      <div className="flex-1 overflow-y-auto p-6 space-y-4">
        {messages.map((message) => (
          <motion.div
            key={message.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className={`flex ${message.sender === 'agent' ? 'justify-start' : 'justify-end'}`}
          >
            <div
              className={`max-w-[70%] rounded-2xl p-4 ${
                message.sender === 'bot'
                  ? 'bg-gradient-to-br from-purple-600/80 to-pink-600/80 text-white rounded-tr-sm'
                  : message.sender === 'agent'
                  ? 'bg-gradient-to-br from-blue-600/80 to-cyan-600/80 text-white rounded-tr-sm'
                  : 'bg-dark-300/80 text-white rounded-tl-sm'
              }`}
            >
              <p className="text-sm mb-2">{message.text}</p>
              <div className="flex items-center gap-2 justify-end text-xs opacity-70">
                <span>{new Date(message.timestamp).toLocaleTimeString('ar-EG', { hour: '2-digit', minute: '2-digit' })}</span>
                {message.sender === 'user' && (
                  <>
                    {message.status === 'sent' && <Check className="w-4 h-4" />}
                    {message.status === 'delivered' && <CheckCheck className="w-4 h-4" />}
                    {message.status === 'read' && <CheckCheck className="w-4 h-4 text-blue-400" />}
                  </>
                )}
              </div>
            </div>
          </motion.div>
        ))}
        
        {/* Bot Options */}
        {bot && botEnabled && !bot.isWaitingForInput() && bot.renderOptions()}
        
        <div ref={messagesEndRef} />
      </div>

      {/* Quick Replies Panel */}
      <AnimatePresence>
        {showQuickReplies && (
          <QuickRepliesPanel
            quickReplies={quickReplies}
            onSelect={handleQuickReplySelect}
            onAdd={onAddQuickReply}
            onEdit={onEditQuickReply}
            onDelete={onDeleteQuickReply}
            onClose={() => setShowQuickReplies(false)}
          />
        )}
      </AnimatePresence>

      {/* Emoji Picker */}
      <AnimatePresence>
        {showEmojiPicker && (
          <EmojiPicker
            onSelect={handleEmojiSelect}
            onClose={() => setShowEmojiPicker(false)}
          />
        )}
      </AnimatePresence>

      {/* Assignment Modal */}
      <AssignmentModal
        isOpen={showAssignModal}
        onClose={() => setShowAssignModal(false)}
        users={users}
        currentAssignedTo={conversation.assignedTo}
        onAssign={handleAssign}
      />

      {/* Message Input */}
      <div className="p-4 border-t border-blue-500/20 bg-dark-100/50 backdrop-blur-xl relative">
        {/* Recording Indicator */}
        {isRecording && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="absolute top-0 left-0 right-0 bg-red-500/20 border-b border-red-500/30 py-2 px-4 flex items-center justify-center gap-3"
          >
            <div className="w-3 h-3 bg-red-500 rounded-full animate-pulse"></div>
            <span className="text-red-400 font-semibold">جاري التسجيل... {recordingTime}s</span>
            <button
              onClick={handleStopRecording}
              className="px-3 py-1 bg-red-600 hover:bg-red-700 text-white text-sm rounded-lg"
            >
              إيقاف
            </button>
          </motion.div>
        )}

        <div className="flex gap-3">
          <button
            onClick={() => setShowQuickReplies(!showQuickReplies)}
            className={`p-3 rounded-lg transition-all ${
              showQuickReplies
                ? 'bg-gradient-to-r from-blue-600 to-cyan-600 text-white'
                : 'bg-dark-300/50 text-gray-400 hover:bg-dark-300'
            }`}
            title="الردود السريعة"
          >
            <Zap className="w-5 h-5" />
          </button>

          <button
            onClick={() => fileInputRef.current?.click()}
            className="p-3 bg-dark-300/50 text-gray-400 hover:bg-dark-300 rounded-lg transition-all"
            title="إرفاق ملف"
          >
            <Paperclip className="w-5 h-5" />
          </button>
          <input
            ref={fileInputRef}
            type="file"
            className="hidden"
            onChange={handleFileSelect}
            accept="image/*,video/*,.pdf,.doc,.docx,.xls,.xlsx"
          />

          <button
            onClick={() => setShowEmojiPicker(!showEmojiPicker)}
            className="p-3 bg-dark-300/50 text-gray-400 hover:bg-dark-300 rounded-lg transition-all"
            title="إضافة إيموجي"
          >
            <Smile className="w-5 h-5" />
          </button>

          <input
            type="text"
            placeholder="اكتب رسالتك هنا..."
            value={messageText}
            onChange={(e) => setMessageText(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && handleSend()}
            className="flex-1 px-4 py-3 bg-dark-300/50 border border-blue-500/20 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:border-blue-500/50 focus:ring-2 focus:ring-blue-500/20 transition-all"
          />

          <button
            onClick={handleVoiceRecord}
            className={`p-3 rounded-lg transition-all ${
              isRecording
                ? 'bg-red-500 text-white animate-pulse'
                : 'bg-dark-300/50 text-gray-400 hover:bg-dark-300'
            }`}
            title={isRecording ? 'إيقاف التسجيل' : 'تسجيل رسالة صوتية'}
          >
            <Mic className="w-5 h-5" />
          </button>

          <button
            onClick={handleSend}
            disabled={!messageText.trim()}
            className={`p-3 rounded-lg transition-all ${
              messageText.trim()
                ? 'bg-gradient-to-r from-blue-600 to-cyan-600 text-white hover:shadow-lg hover:shadow-blue-500/30'
                : 'bg-dark-300/30 text-gray-600 cursor-not-allowed'
            }`}
          >
            <Send className="w-5 h-5" />
          </button>
        </div>
      </div>
    </div>
  );
};

export default ChatArea;
