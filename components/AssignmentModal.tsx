'use client';

import { User } from '@/types';
import { Users, X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useState } from 'react';

interface AssignmentModalProps {
  isOpen: boolean;
  onClose: () => void;
  users: User[];
  currentAssignedTo?: string;
  onAssign: (userId: string) => void;
}

const AssignmentModal = ({ isOpen, onClose, users, currentAssignedTo, onAssign }: AssignmentModalProps) => {
  const [selectedUserId, setSelectedUserId] = useState(currentAssignedTo || '');

  const handleAssign = () => {
    if (selectedUserId) {
      onAssign(selectedUserId);
      onClose();
    }
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center">
        {/* Backdrop */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="absolute inset-0 bg-black/60 backdrop-blur-sm"
        />

        {/* Modal */}
        <motion.div
          initial={{ opacity: 0, scale: 0.9, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.9, y: 20 }}
          className="relative w-full max-w-md bg-gradient-to-br from-dark-100/95 to-dark-200/95 backdrop-blur-xl border border-blue-500/20 rounded-2xl shadow-2xl p-6"
        >
          {/* Header */}
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-blue-500/20 rounded-lg">
                <Users className="w-6 h-6 text-blue-400" />
              </div>
              <h2 className="text-xl font-bold text-white">إسناد المحادثة</h2>
            </div>
            <button
              onClick={onClose}
              className="p-2 hover:bg-red-500/20 rounded-lg transition-colors"
            >
              <X className="w-5 h-5 text-gray-400" />
            </button>
          </div>

          {/* Users List */}
          <div className="space-y-2 mb-6 max-h-96 overflow-y-auto">
            {users.map((user) => (
              <button
                key={user.id}
                onClick={() => setSelectedUserId(user.id)}
                className={`w-full p-4 rounded-xl text-right transition-all ${
                  selectedUserId === user.id
                    ? 'bg-gradient-to-r from-blue-600 to-cyan-600 text-white'
                    : 'bg-dark-300/30 text-gray-300 hover:bg-dark-300/50'
                }`}
              >
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-semibold">{user.name}</p>
                    <p className="text-sm opacity-75">
                      {user.role === 'admin' ? 'مدير' : 'موظف'} - {getDepartmentName(user.department)}
                    </p>
                  </div>
                  {selectedUserId === user.id && (
                    <div className="w-5 h-5 bg-white rounded-full flex items-center justify-center">
                      <div className="w-2 h-2 bg-blue-600 rounded-full"></div>
                    </div>
                  )}
                </div>
              </button>
            ))}
          </div>

          {/* Actions */}
          <div className="flex gap-3">
            <button
              onClick={onClose}
              className="flex-1 py-3 bg-dark-300/50 hover:bg-dark-300 text-white rounded-xl transition-all"
            >
              إلغاء
            </button>
            <button
              onClick={handleAssign}
              disabled={!selectedUserId}
              className="flex-1 py-3 bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700 disabled:from-gray-600 disabled:to-gray-700 text-white rounded-xl transition-all"
            >
              إسناد
            </button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};

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

export default AssignmentModal;
