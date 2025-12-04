'use client';

import { Conversation } from '@/types';
import { X, Phone, Mail, MapPin, Clock } from 'lucide-react';
import { motion } from 'framer-motion';

interface ContactInfoPanelProps {
  conversation: Conversation;
  onClose: () => void;
}

const ContactInfoPanel = ({ conversation, onClose }: ContactInfoPanelProps) => {
  return (
    <motion.div
      initial={{ x: -300, opacity: 0 }}
      animate={{ x: 0, opacity: 1 }}
      exit={{ x: -300, opacity: 0 }}
      className="w-[350px] h-screen bg-gradient-to-br from-dark-100/95 to-dark-200/95 backdrop-blur-xl border-l border-blue-500/20 flex flex-col"
    >
      {/* Header */}
      <div className="p-6 border-b border-blue-500/20">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-cyan-400">
            معلومات جهة الاتصال
          </h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-blue-500/10 rounded-lg transition-colors"
          >
            <X className="w-5 h-5 text-gray-400" />
          </button>
        </div>
      </div>

      {/* Profile */}
      <div className="p-6 border-b border-blue-500/20">
        <div className="flex flex-col items-center">
          <div className="relative mb-4">
            <div className="w-24 h-24 rounded-full bg-gradient-to-br from-blue-500 to-cyan-500 flex items-center justify-center text-white font-bold text-3xl">
              {conversation.contactName.charAt(0)}
            </div>
            {conversation.isOnline && (
              <div className="absolute bottom-2 left-2 w-4 h-4 bg-green-500 rounded-full border-2 border-dark-100"></div>
            )}
          </div>
          <h3 className="text-xl font-bold text-white mb-1">
            {conversation.contactName}
          </h3>
          <p className="text-sm text-gray-400">
            {conversation.isOnline ? 'متصل الآن' : 'غير متصل'}
          </p>
        </div>
      </div>

      {/* Details */}
      <div className="flex-1 overflow-y-auto p-6 space-y-4">
        <div className="bg-dark-300/30 rounded-xl p-4">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-2 bg-blue-500/20 rounded-lg">
              <Phone className="w-5 h-5 text-blue-400" />
            </div>
            <div>
              <p className="text-xs text-gray-500 mb-1">رقم الهاتف</p>
              <p className="text-white font-medium">{conversation.phoneNumber}</p>
            </div>
          </div>

          <div className="flex items-center gap-3 mb-4">
            <div className="p-2 bg-cyan-500/20 rounded-lg">
              <Mail className="w-5 h-5 text-cyan-400" />
            </div>
            <div>
              <p className="text-xs text-gray-500 mb-1">البريد الإلكتروني</p>
              <p className="text-white font-medium">غير محدد</p>
            </div>
          </div>

          <div className="flex items-center gap-3 mb-4">
            <div className="p-2 bg-purple-500/20 rounded-lg">
              <MapPin className="w-5 h-5 text-purple-400" />
            </div>
            <div>
              <p className="text-xs text-gray-500 mb-1">الموقع</p>
              <p className="text-white font-medium">غير محدد</p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="p-2 bg-orange-500/20 rounded-lg">
              <Clock className="w-5 h-5 text-orange-400" />
            </div>
            <div>
              <p className="text-xs text-gray-500 mb-1">آخر ظهور</p>
              <p className="text-white font-medium">
                {new Date(conversation.timestamp).toLocaleString('ar-EG')}
              </p>
            </div>
          </div>
        </div>

        {/* Status */}
        <div className="bg-dark-300/30 rounded-xl p-4">
          <h4 className="text-sm font-semibold text-gray-400 mb-3">الحالة</h4>
          <p className="text-white">
            {conversation.assignedTo ? `مُسند إلى: ${conversation.assignedTo}` : 'غير مُسند'}
          </p>
        </div>

        {/* Tags */}
        <div className="bg-dark-300/30 rounded-xl p-4">
          <h4 className="text-sm font-semibold text-gray-400 mb-3">الوسوم</h4>
          <div className="flex flex-wrap gap-2">
            <span className="px-3 py-1 bg-blue-500/20 text-blue-400 rounded-full text-xs">
              عميل جديد
            </span>
            <span className="px-3 py-1 bg-green-500/20 text-green-400 rounded-full text-xs">
              نشط
            </span>
          </div>
        </div>
      </div>
    </motion.div>
  );
};

export default ContactInfoPanel;
