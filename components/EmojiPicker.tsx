'use client';

import { Smile } from 'lucide-react';
import { motion } from 'framer-motion';
import { useState } from 'react';

interface EmojiPickerProps {
  onSelect: (emoji: string) => void;
  onClose: () => void;
}

const emojis = [
  '😀', '😃', '😄', '😁', '😆', '😅', '😂', '🤣', '😊', '😇',
  '🙂', '🙃', '😉', '😌', '😍', '🥰', '😘', '😗', '😙', '😚',
  '😋', '😛', '😝', '😜', '🤪', '🤨', '🧐', '🤓', '😎', '🤩',
  '🥳', '😏', '😒', '😞', '😔', '😟', '😕', '🙁', '☹️', '😣',
  '😖', '😫', '😩', '🥺', '😢', '😭', '😤', '😠', '😡', '🤬',
  '👍', '👎', '👌', '✌️', '🤞', '🤟', '🤘', '🤙', '👈', '👉',
  '👆', '👇', '☝️', '✋', '🤚', '🖐', '🖖', '👋', '🤝', '🙏',
  '❤️', '🧡', '💛', '💚', '💙', '💜', '🖤', '🤍', '🤎', '💔',
  '❤️‍🔥', '❤️‍🩹', '💕', '💞', '💓', '💗', '💖', '💘', '💝', '💟',
  '⭐', '🌟', '✨', '💫', '🔥', '💥', '💯', '✅', '🎉', '🎊',
];

const EmojiPicker = ({ onSelect, onClose }: EmojiPickerProps) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 10 }}
      className="absolute bottom-16 left-4 bg-dark-100/95 backdrop-blur-xl border border-blue-500/20 rounded-2xl shadow-2xl p-4 w-80 z-50"
    >
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <Smile className="w-5 h-5 text-blue-400" />
          <h3 className="text-sm font-semibold text-white">الإيموجي</h3>
        </div>
        <button
          onClick={onClose}
          className="text-gray-400 hover:text-white transition-colors"
        >
          ✕
        </button>
      </div>
      <div className="grid grid-cols-10 gap-1 max-h-64 overflow-y-auto">
        {emojis.map((emoji, index) => (
          <button
            key={index}
            onClick={() => {
              onSelect(emoji);
              onClose();
            }}
            className="text-2xl hover:bg-blue-500/20 rounded-lg p-2 transition-colors"
          >
            {emoji}
          </button>
        ))}
      </div>
    </motion.div>
  );
};

export default EmojiPicker;
