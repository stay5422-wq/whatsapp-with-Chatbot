'use client';

import { useState } from 'react';
import { User } from '@/types';
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
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    // Simulate API call
    setTimeout(() => {
      // Get users from localStorage or use default admin
      let users: User[] = [];
      if (typeof window !== 'undefined') {
        const savedUsers = localStorage.getItem('whatsapp_users');
        if (savedUsers) {
          try {
            users = JSON.parse(savedUsers);
          } catch (e) {
            console.error('Error loading users:', e);
          }
        }
      }
      
      // Add default admin if no users
      if (users.length === 0) {
        users = [{
          id: 'admin',
          email: 'akram@gmail.com',
          password: 'Aazxc',
          name: 'المسؤول',
          avatar: '👤',
          role: 'admin'
        }];
      }

      // Support both email and username (for backwards compatibility)
      const user = users.find(
        (u) => (u.email === email || u.email === `${email}@whatsapp.com`) && u.password === password
      );

      if (user) {
        onLogin(user);
      } else {
        setError('البريد الإلكتروني أو كلمة المرور غير صحيحة');
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
        initial={{ opacity: 0, y: 50, scale: 0.9 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ 
          duration: 0.6, 
          ease: [0.25, 0.46, 0.45, 0.94],
          staggerChildren: 0.1 
        }}
        className="w-full max-w-md p-8 bg-gradient-to-br from-dark-100/95 to-dark-200/95 backdrop-blur-xl border border-blue-500/20 rounded-2xl shadow-2xl"
      >
        {/* Logo/Title */}
        <div className="text-center mb-8">
          {/* Animated Logo with Image */}
          <motion.div
            initial={{ scale: 0, rotate: -180, opacity: 0 }}
            animate={{ scale: 1, rotate: 0, opacity: 1 }}
            transition={{ 
              duration: 0.8, 
              delay: 0.2,
              type: "spring",
              stiffness: 200,
              damping: 15
            }}
            className="relative mx-auto mb-6 w-32 h-32"
          >
            {/* Outer Glow Ring */}
            <motion.div
              animate={{ 
                rotate: 360,
                scale: [1, 1.1, 1]
              }}
              transition={{
                rotate: { duration: 20, repeat: Infinity, ease: "linear" },
                scale: { duration: 2, repeat: Infinity, ease: "easeInOut" }
              }}
              className="absolute inset-0 rounded-full bg-gradient-to-r from-green-500 via-emerald-500 to-cyan-500 blur-xl opacity-60"
            />
            
            {/* Middle Ring */}
            <motion.div
              animate={{ 
                rotate: -360,
                scale: [1, 1.05, 1]
              }}
              transition={{
                rotate: { duration: 15, repeat: Infinity, ease: "linear" },
                scale: { duration: 2.5, repeat: Infinity, ease: "easeInOut", delay: 0.5 }
              }}
              className="absolute inset-2 rounded-full bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 blur-lg opacity-40"
            />
            
            {/* Image Container */}
            <motion.div
              whileHover={{ scale: 1.05, rotate: 5 }}
              whileTap={{ scale: 0.95 }}
              className="relative w-full h-full rounded-full bg-gradient-to-br from-green-500 to-emerald-600 p-1 shadow-2xl shadow-green-500/50"
            >
              <div className="w-full h-full rounded-full overflow-hidden bg-dark-100 ring-4 ring-green-400/30">
                <img 
                  src="/images/logo.jpg" 
                  alt="Logo" 
                  className="w-full h-full object-cover"
                  onError={(e) => {
                    e.currentTarget.style.display = 'none';
                    const fallback = e.currentTarget.nextElementSibling as HTMLElement;
                    if (fallback) fallback.classList.remove('hidden');
                  }}
                />
                <div className="hidden w-full h-full flex items-center justify-center bg-gradient-to-br from-green-600 to-emerald-600">
                  <span className="text-white font-bold text-4xl">AE</span>
                </div>
              </div>
            </motion.div>
            
            {/* Floating Particles */}
            <motion.div
              animate={{ 
                y: [-10, 10, -10],
                opacity: [0.5, 1, 0.5]
              }}
              transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
              className="absolute -top-2 -right-2 w-3 h-3 bg-green-400 rounded-full blur-sm"
            />
            <motion.div
              animate={{ 
                y: [10, -10, 10],
                opacity: [0.5, 1, 0.5]
              }}
              transition={{ duration: 2.5, repeat: Infinity, ease: "easeInOut", delay: 0.5 }}
              className="absolute -bottom-2 -left-2 w-3 h-3 bg-emerald-400 rounded-full blur-sm"
            />
            <motion.div
              animate={{ 
                x: [-10, 10, -10],
                opacity: [0.5, 1, 0.5]
              }}
              transition={{ duration: 3.5, repeat: Infinity, ease: "easeInOut", delay: 1 }}
              className="absolute top-1/2 -right-4 w-2 h-2 bg-cyan-400 rounded-full blur-sm"
            />
          </motion.div>
          
          {/* Title with Animation */}
          <motion.h1 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5, duration: 0.6 }}
            className="text-4xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-green-400 to-emerald-400 mb-3"
          >
            <motion.span
              animate={{ 
                backgroundPosition: ['0% 50%', '100% 50%', '0% 50%']
              }}
              transition={{ duration: 5, repeat: Infinity, ease: "linear" }}
              className="inline-block bg-gradient-to-r from-green-400 via-emerald-400 to-cyan-400 bg-clip-text text-transparent"
              style={{ backgroundSize: '200% auto' }}
            >
              واتساب بيزنس 💼
            </motion.span>
          </motion.h1>
          
          <motion.p 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.7, duration: 0.6 }}
            className="text-gray-400 mb-4"
          >
            شركة المسار الساخن للسفر والسياحة
          </motion.p>
        </div>

        {/* Login Form */}
        <motion.form 
          onSubmit={handleSubmit} 
          className="space-y-6"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.8, duration: 0.6 }}
        >
          {/* Username */}
          <motion.div
            initial={{ x: -50, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            transition={{ delay: 0.9, duration: 0.5 }}
          >
            <label className="block text-sm font-medium text-gray-300 mb-2">
              البريد الإلكتروني
            </label>
            <motion.div 
              className="relative"
              whileFocus={{ scale: 1.02 }}
            >
              <UserIcon className="absolute right-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
              <motion.input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="admin@whatsapp.com"
                required
                whileFocus={{ 
                  borderColor: "rgb(34, 197, 94)",
                  boxShadow: "0 0 0 3px rgba(34, 197, 94, 0.1)"
                }}
                transition={{ duration: 0.2 }}
                className="w-full pr-10 pl-4 py-3 bg-dark-300/50 border border-blue-500/20 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:border-blue-500/50 focus:ring-2 focus:ring-blue-500/20 transition-all"
              />
            </motion.div>
          </motion.div>

          {/* Password */}
          <motion.div
            initial={{ x: -50, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            transition={{ delay: 1.0, duration: 0.5 }}
          >
            <label className="block text-sm font-medium text-gray-300 mb-2">
              كلمة المرور
            </label>
            <motion.div 
              className="relative"
              whileFocus={{ scale: 1.02 }}
            >
              <Lock className="absolute right-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
              <motion.input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="أدخل كلمة المرور"
                required
                whileFocus={{ 
                  borderColor: "rgb(34, 197, 94)",
                  boxShadow: "0 0 0 3px rgba(34, 197, 94, 0.1)"
                }}
                transition={{ duration: 0.2 }}
                className="w-full pr-10 pl-4 py-3 bg-dark-300/50 border border-blue-500/20 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:border-blue-500/50 focus:ring-2 focus:ring-blue-500/20 transition-all"
              />
            </motion.div>
          </motion.div>

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
          <motion.button
            type="submit"
            disabled={loading}
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 1.1, duration: 0.5 }}
            whileHover={{ scale: 1.02, boxShadow: "0 20px 40px rgba(59, 130, 246, 0.4)" }}
            whileTap={{ scale: 0.98 }}
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
          </motion.button>
        </motion.form>

        {/* Info */}
        <motion.div 
          className="mt-6 text-center"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.3, duration: 0.6 }}
        >
          <p className="text-xs text-gray-500">
            جميع البيانات محمية ومشفرة 🔒
          </p>
        </motion.div>

        {/* Developer Info */}
        <motion.div 
          className="mt-6 pt-6 border-t border-gray-700/50"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1.4, duration: 0.6 }}
        >
          <div className="flex items-center justify-center gap-3">
            <div className="relative">
              <div className="absolute inset-0 bg-gradient-to-r from-blue-600 to-cyan-600 rounded-full blur-md opacity-50"></div>
              <img
                src="/images/logo.jpg"
                alt="Eng. Akram Elmasry"
                className="relative w-12 h-12 rounded-full object-cover border-2 border-blue-500/50"
                onError={(e) => {
                  // Fallback to initials if image not found
                  e.currentTarget.style.display = 'none';
                  e.currentTarget.nextElementSibling?.classList.remove('hidden');
                }}
              />
              <div className="hidden relative w-12 h-12 rounded-full bg-gradient-to-br from-blue-600 to-cyan-600 flex items-center justify-center text-white font-bold text-lg border-2 border-blue-500/50">
                AE
              </div>
            </div>
            <div className="text-right">
              <p className="text-sm font-semibold text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-cyan-400">
                Eng. Akram Elmasry
              </p>
              <p className="text-xs text-gray-500">Software Developer</p>
            </div>
          </div>
        </motion.div>
      </motion.div>
    </div>
  );
};

export default LoginPage;
