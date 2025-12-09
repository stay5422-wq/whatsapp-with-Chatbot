'use client';

import { Conversation, FilterType } from '@/types';
import { X, Search } from 'lucide-react';
import { motion } from 'framer-motion';

interface ConversationsSidebarProps {
  conversations: Conversation[];
  selectedConversation: Conversation | null;
  onSelectConversation: (conversation: Conversation) => void;
  searchQuery: string;
  onSearchChange: (query: string) => void;
  activeFilter: FilterType;
  onFilterChange: (filter: FilterType) => void;
  currentUser?: { name: string; role: string; };
  onLogout?: () => void;
  onOpenSettings?: () => void;
}

const ConversationsSidebar = ({
  conversations,
  selectedConversation,
  onSelectConversation,
  searchQuery,
  onSearchChange,
  activeFilter,
  onFilterChange,
  currentUser,
  onLogout,
  onOpenSettings,
}: ConversationsSidebarProps) => {
  const getTimeAgo = (date: Date) => {
    const now = new Date();
    const timestamp = date instanceof Date ? date : new Date(date);
    const diff = now.getTime() - timestamp.getTime();
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);
    const days = Math.floor(diff / 86400000);

    if (minutes < 1) return 'الآن';
    if (minutes < 60) return `منذ ${minutes} دقيقة`;
    if (hours < 24) return `منذ ${hours} ساعة`;
    return `منذ ${days} يوم`;
  };

  const filteredConversations = conversations.filter((conv) => {
    const displayName = conv.name || conv.contactName || conv.phone;
    const phoneNumber = conv.phone || conv.phoneNumber || '';
    
    const matchesSearch =
      displayName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      phoneNumber.includes(searchQuery);

    const matchesFilter =
      activeFilter === 'all' ||
      (activeFilter === 'mine' && conv.assignedTo) ||
      (activeFilter === 'unassigned' && !conv.assignedTo);

    return matchesSearch && matchesFilter;
  });

  return (
    <div className="w-[420px] h-screen bg-gradient-to-br from-dark-100/95 to-dark-200/95 backdrop-blur-xl border-l border-blue-500/20 flex flex-col sticky top-0">
      {/* Header */}
      <div className="p-6 border-b border-blue-500/20">
        {/* User Info with Actions */}
        {currentUser && (
          <div className="mb-4 p-3 bg-dark-300/30 rounded-xl">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-600 to-cyan-600 flex items-center justify-center text-white font-bold text-sm">
                  {currentUser.name.charAt(0)}
                </div>
                <div>
                  <p className="text-sm font-bold text-white">{currentUser.name}</p>
                  <p className="text-xs text-gray-400">{currentUser.role === 'admin' ? 'مدير النظام' : 'موظف'}</p>
                </div>
              </div>
              <div className="flex gap-1">
                {currentUser.role === 'admin' && onOpenSettings && (
                  <button
                    onClick={onOpenSettings}
                    className="p-2 hover:bg-blue-500/20 rounded-lg transition-colors"
                    title="الإعدادات"
                  >
                    <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                  </button>
                )}
                {onLogout && (
                  <button
                    onClick={onLogout}
                    className="p-2 hover:bg-red-500/20 rounded-lg transition-colors"
                    title="تسجيل الخروج"
                  >
                    <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                    </svg>
                  </button>
                )}
              </div>
            </div>
          </div>
        )}

        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-cyan-500 p-[2px] shadow-lg shadow-blue-500/30">
              <img 
                src="/images/logo.jpg" 
                alt="Logo" 
                className="w-full h-full rounded-full object-cover"
                onError={(e) => {
                  e.currentTarget.style.display = 'none';
                  e.currentTarget.nextElementSibling?.classList.remove('hidden');
                }}
              />
              <div className="hidden w-full h-full rounded-full bg-gradient-to-br from-blue-600 to-cyan-600 flex items-center justify-center text-white font-bold text-sm">
                AE
              </div>
            </div>
            <h1 className="text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-green-400 to-emerald-400 glow-text">
              واتساب بيزنس 💼
            </h1>
          </div>
          <button className="p-2 hover:bg-blue-500/10 rounded-lg transition-colors">
            <X className="w-5 h-5 text-gray-400" />
          </button>
        </div>

        {/* Search Bar */}
        <div className="relative">
          <Search className="absolute right-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
          <input
            type="text"
            placeholder="ابحث عن محادثة..."
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            className="w-full pr-10 pl-4 py-3 bg-dark-300/50 border border-blue-500/20 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:border-blue-500/50 focus:ring-2 focus:ring-blue-500/20 transition-all"
          />
        </div>

        {/* Filter Tabs */}
        <div className="flex gap-2 mt-4">
          {(['all', 'mine', 'unassigned'] as FilterType[]).map((filter) => (
            <button
              key={filter}
              onClick={() => onFilterChange(filter)}
              className={`flex-1 py-2 px-4 rounded-lg text-sm font-medium transition-all ${
                activeFilter === filter
                  ? 'bg-gradient-to-r from-blue-600 to-cyan-600 text-white shadow-lg shadow-blue-500/30'
                  : 'bg-dark-300/30 text-gray-400 hover:bg-dark-300/50'
              }`}
            >
              {filter === 'all' && 'الكل'}
              {filter === 'mine' && 'محادثاتي'}
              {filter === 'unassigned' && 'غير مُسندة'}
            </button>
          ))}
        </div>
      </div>

      {/* Conversations List */}
      <div className="flex-1 overflow-y-auto">
        {filteredConversations.length === 0 ? (
          <div className="flex items-center justify-center h-64 text-gray-500">
            <p>لا توجد محادثات</p>
          </div>
        ) : (
          filteredConversations.map((conversation) => (
            <motion.div
              key={conversation.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              onClick={() => onSelectConversation(conversation)}
              className={`relative p-4 border-b border-blue-500/10 cursor-pointer transition-all hover:bg-blue-500/5 ${
                selectedConversation?.id === conversation.id
                  ? 'bg-blue-500/10 border-r-4 border-r-blue-500'
                  : ''
              }`}
            >
              <div className="flex gap-3">
                {/* Avatar */}
                <div className="relative">
                  <div className="w-12 h-12 rounded-full bg-gradient-to-br from-blue-500 to-cyan-500 flex items-center justify-center text-white font-bold text-lg">
                    {(conversation.name || conversation.contactName || conversation.phone).charAt(0)}
                  </div>
                  {conversation.isOnline && (
                    <div className="absolute bottom-0 left-0 w-3 h-3 bg-green-500 rounded-full border-2 border-dark-100"></div>
                  )}
                </div>

                {/* Content */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between mb-1">
                    <h3 className="font-semibold text-white truncate">
                      {conversation.name || conversation.contactName || conversation.phone}
                    </h3>
                    <span className="text-xs text-gray-400">
                      {getTimeAgo(conversation.timestamp)}
                    </span>
                  </div>
                  <p className="text-sm text-gray-400 truncate">
                    {conversation.lastMessage}
                  </p>
                </div>

                {/* Unread Badge */}
                {conversation.unreadCount > 0 && (
                  <div className="absolute bottom-4 left-4">
                    <span className="inline-flex items-center justify-center w-6 h-6 text-xs font-bold text-white bg-gradient-to-r from-blue-600 to-cyan-600 rounded-full">
                      {conversation.unreadCount}
                    </span>
                  </div>
                )}
              </div>
            </motion.div>
          ))
        )}
      </div>
    </div>
  );
};

export default ConversationsSidebar;
