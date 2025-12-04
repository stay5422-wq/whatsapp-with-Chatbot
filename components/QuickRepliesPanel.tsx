'use client';

import { QuickReply } from '@/types';
import { Search, Plus, Edit2, Trash2, X, Check } from 'lucide-react';
import { motion } from 'framer-motion';
import { useState } from 'react';

interface QuickRepliesPanelProps {
  quickReplies: QuickReply[];
  onSelect: (text: string) => void;
  onAdd: (text: string) => void;
  onEdit: (id: string, text: string) => void;
  onDelete: (id: string) => void;
  onClose: () => void;
}

const QuickRepliesPanel = ({
  quickReplies,
  onSelect,
  onAdd,
  onEdit,
  onDelete,
  onClose,
}: QuickRepliesPanelProps) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [newReplyText, setNewReplyText] = useState('');
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editText, setEditText] = useState('');

  const filteredReplies = quickReplies.filter((reply) =>
    reply.text.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleAdd = () => {
    if (newReplyText.trim()) {
      onAdd(newReplyText);
      setNewReplyText('');
    }
  };

  const handleEdit = (id: string) => {
    if (editText.trim()) {
      onEdit(id, editText);
      setEditingId(null);
      setEditText('');
    }
  };

  const startEdit = (reply: QuickReply) => {
    setEditingId(reply.id);
    setEditText(reply.text);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 50 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 50 }}
      className="absolute bottom-20 left-4 right-4 bg-dark-100/95 backdrop-blur-xl border border-blue-500/20 rounded-2xl shadow-2xl shadow-blue-500/10 overflow-hidden z-50"
    >
      {/* Header */}
      <div className="p-4 border-b border-blue-500/20 flex items-center justify-between">
        <h3 className="text-lg font-bold text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-cyan-400">
          الردود السريعة
        </h3>
        <button
          onClick={onClose}
          className="p-2 hover:bg-blue-500/10 rounded-lg transition-colors"
        >
          <X className="w-5 h-5 text-gray-400" />
        </button>
      </div>

      {/* Search */}
      <div className="p-4 border-b border-blue-500/20">
        <div className="relative">
          <Search className="absolute right-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
          <input
            type="text"
            placeholder="ابحث عن رد سريع..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pr-10 pl-4 py-2 bg-dark-300/50 border border-blue-500/20 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-blue-500/50 transition-all"
          />
        </div>
      </div>

      {/* Quick Replies List */}
      <div className="max-h-64 overflow-y-auto p-2">
        {filteredReplies.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            لا توجد ردود سريعة
          </div>
        ) : (
          filteredReplies.map((reply) => (
            <div
              key={reply.id}
              className="p-3 mb-2 bg-dark-300/30 hover:bg-dark-300/50 rounded-lg transition-all group"
            >
              {editingId === reply.id ? (
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={editText}
                    onChange={(e) => setEditText(e.target.value)}
                    className="flex-1 px-3 py-2 bg-dark-300/50 border border-blue-500/20 rounded-lg text-white focus:outline-none focus:border-blue-500/50"
                    autoFocus
                  />
                  <button
                    onClick={() => handleEdit(reply.id)}
                    className="p-2 bg-green-600 hover:bg-green-700 rounded-lg transition-colors"
                  >
                    <Check className="w-5 h-5 text-white" />
                  </button>
                  <button
                    onClick={() => {
                      setEditingId(null);
                      setEditText('');
                    }}
                    className="p-2 bg-red-600 hover:bg-red-700 rounded-lg transition-colors"
                  >
                    <X className="w-5 h-5 text-white" />
                  </button>
                </div>
              ) : (
                <div className="flex items-center justify-between">
                  <button
                    onClick={() => onSelect(reply.text)}
                    className="flex-1 text-right text-white hover:text-blue-400 transition-colors"
                  >
                    {reply.text}
                  </button>
                  <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button
                      onClick={() => startEdit(reply)}
                      className="p-2 hover:bg-blue-500/20 rounded-lg transition-colors"
                    >
                      <Edit2 className="w-4 h-4 text-blue-400" />
                    </button>
                    <button
                      onClick={() => onDelete(reply.id)}
                      className="p-2 hover:bg-red-500/20 rounded-lg transition-colors"
                    >
                      <Trash2 className="w-4 h-4 text-red-400" />
                    </button>
                  </div>
                </div>
              )}
            </div>
          ))
        )}
      </div>

      {/* Add New Reply */}
      <div className="p-4 border-t border-blue-500/20">
        <div className="flex gap-2">
          <input
            type="text"
            placeholder="إضافة رد سريع جديد..."
            value={newReplyText}
            onChange={(e) => setNewReplyText(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && handleAdd()}
            className="flex-1 px-4 py-2 bg-dark-300/50 border border-blue-500/20 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-blue-500/50 transition-all"
          />
          <button
            onClick={handleAdd}
            disabled={!newReplyText.trim()}
            className={`p-2 rounded-lg transition-all ${
              newReplyText.trim()
                ? 'bg-gradient-to-r from-blue-600 to-cyan-600 text-white hover:shadow-lg hover:shadow-blue-500/30'
                : 'bg-dark-300/30 text-gray-600 cursor-not-allowed'
            }`}
          >
            <Plus className="w-5 h-5" />
          </button>
        </div>
      </div>
    </motion.div>
  );
};

export default QuickRepliesPanel;
