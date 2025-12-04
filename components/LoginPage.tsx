'use client';

import { useState } from 'react';
import { User } from '@/types';
import { mockUsers } from '@/lib/mockData';
import { Lock, User as UserIcon, LogIn } from 'lucide-react';
import { motion } from 'framer-motion';
import dynamic from 'next/dynamic';

const AnimatedStars = dynamic(() => import('@/components/AnimatedStars'), {
  ssr: false,
});

interface LoginPageProps {
  onLogin: (user: User) => void;
}

const LoginPage = ({ onLogin }: LoginPageProps) => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    // Simulate API call
    setTimeout(() => {
      const user = mockUsers.find(
        (u) => u.username === username && u.password === password && u.isActive
      );

      if (user) {
        onLogin(user);
      } else {
        setError('اسم المستخدم أو كلمة المرور غير صحيحة');
      }
      setLoading(false);
    }, 1000);
  };

  return (
    <div className="relative min-h-screen overflow-hidden flex items-center justify-center">
      {/* Background */}
      <div className="fixed inset-0 -z-10">
        <div className="absolute inset-0 bg-gradient-to-br from-dark-500 via-dark-600 to-dark-700" />
        <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-blue-600/20 rounded-full blur-[150px]" />
        <div className="absolute bottom-0 left-0 w-[600px] h-[600px] bg-cyan-600/20 rounded-full blur-[150px]" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[400px] h-[400px] bg-purple-600/10 rounded-full blur-[120px]" />
        <AnimatedStars />
      </div>

      {/* Login Card */}
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="w-full max-w-md p-8 bg-gradient-to-br from-dark-100/95 to-dark-200/95 backdrop-blur-xl border border-blue-500/20 rounded-2xl shadow-2xl"
      >
        {/* Logo/Title */}
        <div className="text-center mb-8">
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.2 }}
            className="w-20 h-20 mx-auto mb-4 rounded-full bg-gradient-to-br from-blue-500 to-cyan-500 flex items-center justify-center"
          >
            <UserIcon className="w-10 h-10 text-white" />
          </motion.div>
          <h1 className="text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-cyan-400 mb-2">
            صندوق الوارد الموحد
          </h1>
          <p className="text-gray-400">شركة المسار الساخن للسفر والسياحة</p>
        </div>

        {/* Login Form */}
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Username */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              اسم المستخدم
            </label>
            <div className="relative">
              <UserIcon className="absolute right-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="أدخل اسم المستخدم"
                required
                className="w-full pr-10 pl-4 py-3 bg-dark-300/50 border border-blue-500/20 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:border-blue-500/50 focus:ring-2 focus:ring-blue-500/20 transition-all"
              />
            </div>
          </div>

          {/* Password */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              كلمة المرور
            </label>
            <div className="relative">
              <Lock className="absolute right-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="أدخل كلمة المرور"
                required
                className="w-full pr-10 pl-4 py-3 bg-dark-300/50 border border-blue-500/20 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:border-blue-500/50 focus:ring-2 focus:ring-blue-500/20 transition-all"
              />
            </div>
          </div>

          {/* Error Message */}
          {error && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="p-3 bg-red-500/20 border border-red-500/50 rounded-lg text-red-400 text-sm text-center"
            >
              {error}
            </motion.div>
          )}

          {/* Submit Button */}
          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700 disabled:from-gray-600 disabled:to-gray-700 text-white font-semibold rounded-xl transition-all shadow-lg hover:shadow-blue-500/30 flex items-center justify-center gap-2"
          >
            {loading ? (
              <div className="w-6 h-6 border-3 border-white/30 border-t-white rounded-full animate-spin" />
            ) : (
              <>
                <LogIn className="w-5 h-5" />
                <span>تسجيل الدخول</span>
              </>
            )}
          </button>
        </form>

        {/* Demo Accounts */}
        <div className="mt-8 p-4 bg-blue-500/10 border border-blue-500/20 rounded-xl">
          <p className="text-xs text-gray-400 mb-2 text-center">حسابات تجريبية:</p>
          <div className="text-xs text-gray-500 space-y-1">
            <div>🔹 <strong>admin</strong> / admin123 (مدير)</div>
            <div>🔹 <strong>units_agent</strong> / 123456 (وحدات)</div>
            <div>🔹 <strong>cars_agent</strong> / 123456 (سيارات)</div>
            <div>🔹 <strong>tourism_agent</strong> / 123456 (باقات)</div>
            <div>🔹 <strong>complaints_agent</strong> / 123456 (شكاوى)</div>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default LoginPage;
