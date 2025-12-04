'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Users, Bot, MessageSquare, Plus, Edit2, Trash2, Save } from 'lucide-react';
import { User, QuickReply, Department } from '@/types';
import { toast } from 'react-hot-toast';
import QuestionTreeEditor from './QuestionTreeEditor';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentUser: User;
  users: User[];
  onAddUser: (user: User) => void;
  onEditUser: (id: string, user: Partial<User>) => void;
  onDeleteUser: (id: string) => void;
  quickReplies: QuickReply[];
  onAddQuickReply: (text: string) => void;
  onEditQuickReply: (id: string, text: string) => void;
  onDeleteQuickReply: (id: string) => void;
  botEnabled: boolean;
  onToggleBot: (enabled: boolean) => void;
}

const SettingsModal = ({
  isOpen,
  onClose,
  currentUser,
  users,
  onAddUser,
  onEditUser,
  onDeleteUser,
  quickReplies,
  onAddQuickReply,
  onEditQuickReply,
  onDeleteQuickReply,
  botEnabled,
  onToggleBot,
}: SettingsModalProps) => {
  const [activeTab, setActiveTab] = useState<'users' | 'bot' | 'replies' | 'questions'>('users');
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [newUser, setNewUser] = useState({
    name: '',
    email: '',
    password: '',
    role: 'agent' as 'admin' | 'agent',
    department: 'inquiries',
  });
  const [editingReply, setEditingReply] = useState<QuickReply | null>(null);
  const [newReplyText, setNewReplyText] = useState('');
  const [questionTreeData, setQuestionTreeData] = useState<any>(null);

  // Check if user is admin
  if (currentUser.role !== 'admin') {
    return null;
  }

  const handleAddUser = () => {
    if (!newUser.name || !newUser.email || !newUser.password) {
      toast.error('الرجاء ملء جميع الحقول');
      return;
    }

    const user: User = {
      id: Date.now().toString(),
      username: newUser.email,
      name: newUser.name,
      password: newUser.password,
      role: newUser.role,
      department: newUser.department as Department,
      isActive: true,
    };

    onAddUser(user);
    setNewUser({ name: '', email: '', password: '', role: 'agent', department: 'inquiries' });
    toast.success('تم إضافة الموظف بنجاح');
  };

  const handleUpdateUser = () => {
    if (!editingUser) return;

    onEditUser(editingUser.id, {
      name: editingUser.name,
      username: editingUser.username,
      role: editingUser.role,
      department: editingUser.department,
      isActive: editingUser.isActive,
    });

    setEditingUser(null);
    toast.success('تم تحديث بيانات الموظف');
  };

  const handleDeleteUser = (userId: string) => {
    if (userId === currentUser.id) {
      toast.error('لا يمكن حذف حسابك الخاص');
      return;
    }

    if (confirm('هل أنت متأكد من حذف هذا الموظف؟')) {
      onDeleteUser(userId);
      toast.success('تم حذف الموظف');
    }
  };

  const departments = [
    { value: 'all', label: 'جميع الأقسام' },
    { value: 'bookings', label: 'الحجوزات' },
    { value: 'units', label: 'الوحدات السكنية' },
    { value: 'cars', label: 'السيارات' },
    { value: 'tourism', label: 'الباقات السياحية' },
    { value: 'events', label: 'الحفلات' },
    { value: 'inquiries', label: 'الاستفسارات' },
    { value: 'support', label: 'الدعم الفني' },
  ];

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.95 }}
          className="bg-dark-100 border border-blue-500/20 rounded-2xl w-full max-w-4xl max-h-[90vh] overflow-hidden shadow-2xl mx-4"
        >
          {/* Header */}
          <div className="flex items-center justify-between p-6 border-b border-blue-500/20">
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
              <h2 className="text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-cyan-400">
                ⚙️ إعدادات النظام
              </h2>
            </div>
            <button
              onClick={onClose}
              className="p-2 hover:bg-red-500/20 rounded-lg transition-colors"
            >
              <X className="w-6 h-6 text-gray-400" />
            </button>
          </div>

          {/* Tabs */}
          <div className="flex gap-2 p-4 border-b border-blue-500/20">
            <button
              onClick={() => setActiveTab('users')}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-all ${
                activeTab === 'users'
                  ? 'bg-gradient-to-r from-blue-600 to-cyan-600 text-white'
                  : 'bg-dark-200 text-gray-400 hover:bg-dark-300'
              }`}
            >
              <Users className="w-5 h-5" />
              <span>الموظفين</span>
            </button>
            <button
              onClick={() => setActiveTab('bot')}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-all ${
                activeTab === 'bot'
                  ? 'bg-gradient-to-r from-blue-600 to-cyan-600 text-white'
                  : 'bg-dark-200 text-gray-400 hover:bg-dark-300'
              }`}
            >
              <Bot className="w-5 h-5" />
              <span>البوت الذكي</span>
            </button>
            <button
              onClick={() => setActiveTab('questions')}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-all ${
                activeTab === 'questions'
                  ? 'bg-gradient-to-r from-blue-600 to-cyan-600 text-white'
                  : 'bg-dark-200 text-gray-400 hover:bg-dark-300'
              }`}
            >
              <MessageSquare className="w-5 h-5" />
              <span>شجرة الأسئلة</span>
            </button>
            <button
              onClick={() => setActiveTab('replies')}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-all ${
                activeTab === 'replies'
                  ? 'bg-gradient-to-r from-blue-600 to-cyan-600 text-white'
                  : 'bg-dark-200 text-gray-400 hover:bg-dark-300'
              }`}
            >
              <Edit2 className="w-5 h-5" />
              <span>الردود السريعة</span>
            </button>
          </div>

          {/* Content */}
          <div className="p-6 overflow-y-auto max-h-[calc(90vh-180px)]">
            {/* Users Tab */}
            {activeTab === 'users' && (
              <div className="space-y-6">
                {/* Add New User */}
                <div className="bg-dark-200/50 border border-blue-500/20 rounded-xl p-4">
                  <h3 className="text-lg font-semibold text-white mb-4">➕ إضافة موظف جديد</h3>
                  <div className="grid grid-cols-2 gap-4">
                    <input
                      type="text"
                      value={newUser.name}
                      onChange={(e) => setNewUser({ ...newUser, name: e.target.value })}
                      placeholder="الاسم"
                      className="bg-dark-300 border border-gray-700 rounded-lg px-4 py-2 text-white"
                    />
                    <input
                      type="email"
                      value={newUser.email}
                      onChange={(e) => setNewUser({ ...newUser, email: e.target.value })}
                      placeholder="البريد الإلكتروني"
                      className="bg-dark-300 border border-gray-700 rounded-lg px-4 py-2 text-white"
                    />
                    <input
                      type="password"
                      value={newUser.password}
                      onChange={(e) => setNewUser({ ...newUser, password: e.target.value })}
                      placeholder="كلمة المرور"
                      className="bg-dark-300 border border-gray-700 rounded-lg px-4 py-2 text-white"
                    />
                    <select
                      value={newUser.role}
                      onChange={(e) => setNewUser({ ...newUser, role: e.target.value as 'admin' | 'agent' })}
                      className="bg-dark-300 border border-gray-700 rounded-lg px-4 py-2 text-white"
                    >
                      <option value="agent">موظف</option>
                      <option value="admin">مدير</option>
                    </select>
                    <select
                      value={newUser.department}
                      onChange={(e) => setNewUser({ ...newUser, department: e.target.value })}
                      className="bg-dark-300 border border-gray-700 rounded-lg px-4 py-2 text-white col-span-2"
                    >
                      {departments.map((dept) => (
                        <option key={dept.value} value={dept.value}>
                          {dept.label}
                        </option>
                      ))}
                    </select>
                  </div>
                  <button
                    onClick={handleAddUser}
                    className="mt-4 w-full bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700 text-white py-2 rounded-lg transition-all"
                  >
                    إضافة الموظف
                  </button>
                </div>

                {/* Users List */}
                <div className="space-y-3">
                  <h3 className="text-lg font-semibold text-white">👥 قائمة الموظفين</h3>
                  {users.map((user) => (
                    <div
                      key={user.id}
                      className="bg-dark-200/50 border border-blue-500/20 rounded-xl p-4 flex items-center justify-between"
                    >
                      {editingUser?.id === user.id ? (
                        <div className="flex-1 space-y-3">
                          <div className="grid grid-cols-2 gap-3">
                            <div>
                              <label className="block text-xs text-gray-400 mb-1">الاسم</label>
                              <input
                                type="text"
                                value={editingUser.name}
                                onChange={(e) => setEditingUser({ ...editingUser, name: e.target.value })}
                                className="w-full bg-dark-300 border border-gray-700 rounded-lg px-3 py-2 text-white text-sm"
                              />
                            </div>
                            <div>
                              <label className="block text-xs text-gray-400 mb-1">اسم المستخدم</label>
                              <input
                                type="text"
                                value={editingUser.username}
                                onChange={(e) => setEditingUser({ ...editingUser, username: e.target.value })}
                                className="w-full bg-dark-300 border border-gray-700 rounded-lg px-3 py-2 text-white text-sm"
                              />
                            </div>
                          </div>
                          <div className="grid grid-cols-2 gap-3">
                            <div>
                              <label className="block text-xs text-gray-400 mb-1">كلمة المرور الجديدة</label>
                              <input
                                type="password"
                                placeholder="اتركه فارغاً للاحتفاظ بالقديم"
                                onChange={(e) => setEditingUser({ ...editingUser, password: e.target.value })}
                                className="w-full bg-dark-300 border border-gray-700 rounded-lg px-3 py-2 text-white text-sm"
                              />
                            </div>
                            <div>
                              <label className="block text-xs text-gray-400 mb-1">القسم</label>
                              <select
                                value={editingUser.department}
                                onChange={(e) => setEditingUser({ ...editingUser, department: e.target.value as Department })}
                                className="w-full bg-dark-300 border border-gray-700 rounded-lg px-3 py-2 text-white text-sm"
                              >
                                {departments.map((dept) => (
                                  <option key={dept.value} value={dept.value}>
                                    {dept.label}
                                  </option>
                                ))}
                              </select>
                            </div>
                          </div>
                          <div className="flex gap-2">
                            <button
                              onClick={handleUpdateUser}
                              className="flex-1 bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg text-sm flex items-center justify-center gap-2"
                            >
                              <Save className="w-4 h-4" />
                              حفظ التعديلات
                            </button>
                            <button
                              onClick={() => setEditingUser(null)}
                              className="bg-gray-600 hover:bg-gray-700 text-white px-4 py-2 rounded-lg text-sm"
                            >
                              إلغاء
                            </button>
                          </div>
                        </div>
                      ) : (
                        <>
                          <div>
                            <p className="text-white font-semibold">{user.name}</p>
                            <p className="text-gray-400 text-sm">
                              {user.role === 'admin' ? '🔑 مدير' : '👤 موظف'} •{' '}
                              {departments.find((d) => d.value === user.department)?.label}
                            </p>
                          </div>
                          <div className="flex gap-2">
                            <button
                              onClick={() => setEditingUser(user)}
                              className="p-2 bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors"
                            >
                              <Edit2 className="w-4 h-4 text-white" />
                            </button>
                            <button
                              onClick={() => handleDeleteUser(user.id)}
                              className="p-2 bg-red-600 hover:bg-red-700 rounded-lg transition-colors"
                              disabled={user.id === currentUser.id}
                            >
                              <Trash2 className="w-4 h-4 text-white" />
                            </button>
                          </div>
                        </>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Bot Tab */}
            {activeTab === 'bot' && (
              <div className="space-y-6">
                <div className="bg-dark-200/50 border border-blue-500/20 rounded-xl p-6">
                  <div className="flex items-center justify-between mb-4">
                    <div>
                      <h3 className="text-lg font-semibold text-white">🤖 تفعيل البوت الذكي</h3>
                      <p className="text-gray-400 text-sm mt-1">
                        البوت سيرد تلقائياً على الرسائل الواردة حسب شجرة الأسئلة
                      </p>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        checked={botEnabled}
                        onChange={(e) => onToggleBot(e.target.checked)}
                        className="sr-only peer"
                      />
                      <div className="w-14 h-7 bg-gray-700 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-800 rounded-full peer peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-0.5 after:start-[4px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-6 after:w-6 after:transition-all peer-checked:bg-gradient-to-r peer-checked:from-blue-600 peer-checked:to-cyan-600"></div>
                    </label>
                  </div>

                  {botEnabled && (
                    <div className="mt-4 p-4 bg-green-500/10 border border-green-500/20 rounded-lg">
                      <p className="text-green-400 text-sm">
                        ✅ البوت الذكي مُفعَّل - سيرد تلقائياً على الرسائل الجديدة
                      </p>
                    </div>
                  )}
                </div>

                <div className="bg-dark-200/50 border border-blue-500/20 rounded-xl p-6">
                  <h3 className="text-lg font-semibold text-white mb-3">ℹ️ معلومات البوت</h3>
                  <div className="space-y-2 text-sm text-gray-300">
                    <p>✨ المميزات المتاحة:</p>
                    <ul className="list-disc list-inside space-y-1 mr-4">
                      <li>5 فئات رئيسية (وحدات، سيارات، جولات، مرشدين، دعم)</li>
                      <li>أسئلة متعددة المستويات</li>
                      <li>جمع بيانات العملاء تلقائياً</li>
                      <li>رسائل تأكيد احترافية</li>
                    </ul>
                    <div className="mt-4 p-3 bg-blue-500/10 border border-blue-500/20 rounded-lg">
                      <p className="text-blue-400 text-sm">
                        💡 لتعديل الأسئلة والأجوبة، اذهب إلى تبويب "شجرة الأسئلة"
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Questions Tree Tab */}
            {activeTab === 'questions' && (
              <QuestionTreeEditor
                onSave={(tree) => {
                  // Save to API or localStorage
                  console.log('Saving tree:', tree);
                }}
              />
            )}

            {/* Quick Replies Tab */}
            {activeTab === 'replies' && (
              <div className="space-y-6">
                {/* Add New Reply */}
                <div className="bg-dark-200/50 border border-blue-500/20 rounded-xl p-4">
                  <h3 className="text-lg font-semibold text-white mb-4">➕ إضافة رد سريع</h3>
                  <div className="flex gap-3">
                    <input
                      type="text"
                      value={newReplyText}
                      onChange={(e) => setNewReplyText(e.target.value)}
                      placeholder="اكتب الرد السريع..."
                      className="flex-1 bg-dark-300 border border-gray-700 rounded-lg px-4 py-2 text-white"
                      onKeyDown={(e) => {
                        if (e.key === 'Enter' && newReplyText.trim()) {
                          onAddQuickReply(newReplyText);
                          setNewReplyText('');
                        }
                      }}
                    />
                    <button
                      onClick={() => {
                        if (newReplyText.trim()) {
                          onAddQuickReply(newReplyText);
                          setNewReplyText('');
                        }
                      }}
                      className="bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700 text-white px-6 py-2 rounded-lg transition-all"
                    >
                      <Plus className="w-5 h-5" />
                    </button>
                  </div>
                </div>

                {/* Replies List */}
                <div className="space-y-3">
                  <h3 className="text-lg font-semibold text-white">💬 الردود السريعة</h3>
                  {quickReplies.length === 0 ? (
                    <p className="text-gray-400 text-center py-8">لا توجد ردود سريعة</p>
                  ) : (
                    quickReplies.map((reply) => (
                      <div
                        key={reply.id}
                        className="bg-dark-200/50 border border-blue-500/20 rounded-xl p-4 flex items-center justify-between"
                      >
                        {editingReply?.id === reply.id ? (
                          <div className="flex-1 flex gap-3">
                            <input
                              type="text"
                              value={editingReply.text}
                              onChange={(e) => setEditingReply({ ...editingReply, text: e.target.value })}
                              className="flex-1 bg-dark-300 border border-gray-700 rounded-lg px-3 py-2 text-white"
                            />
                            <button
                              onClick={() => {
                                onEditQuickReply(editingReply.id, editingReply.text);
                                setEditingReply(null);
                              }}
                              className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg"
                            >
                              <Save className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => setEditingReply(null)}
                              className="bg-gray-600 hover:bg-gray-700 text-white px-4 py-2 rounded-lg"
                            >
                              <X className="w-4 h-4" />
                            </button>
                          </div>
                        ) : (
                          <>
                            <p className="text-white flex-1">{reply.text}</p>
                            <div className="flex gap-2">
                              <button
                                onClick={() => setEditingReply(reply)}
                                className="p-2 bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors"
                              >
                                <Edit2 className="w-4 h-4 text-white" />
                              </button>
                              <button
                                onClick={() => onDeleteQuickReply(reply.id)}
                                className="p-2 bg-red-600 hover:bg-red-700 rounded-lg transition-colors"
                              >
                                <Trash2 className="w-4 h-4 text-white" />
                              </button>
                            </div>
                          </>
                        )}
                      </div>
                    ))
                  )}
                </div>
              </div>
            )}
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};

export default SettingsModal;
