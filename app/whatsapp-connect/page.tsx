'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { RefreshCw, CheckCircle, XCircle, Smartphone } from 'lucide-react';
import { toast } from 'react-hot-toast';

export default function WhatsAppConnection() {
  const [qrCode, setQrCode] = useState<string | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const [isConnecting, setIsConnecting] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    checkConnection();
    const interval = setInterval(checkConnection, 3000); // Check every 3 seconds
    return () => clearInterval(interval);
  }, []);

  const checkConnection = async () => {
    try {
      const response = await fetch('/api/whatsapp/status');
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const data = await response.json();
      
      if (data.connected) {
        setIsConnected(true);
        setIsConnecting(false);
        setQrCode(null);
        setIsLoading(false);
        setError(null);
        toast.success('تم الاتصال بواتساب بنجاح!');
      } else if (data.connecting) {
        setIsConnecting(true);
        setQrCode(null);
        setIsLoading(false);
        setError(null);
      } else if (data.qr) {
        setQrCode(data.qr);
        setIsConnected(false);
        setIsConnecting(false);
        setIsLoading(false);
        setError(null);
      } else {
        setIsLoading(false);
        setIsConnecting(false);
        if (data.message) {
          setError(data.message);
        }
      }
    } catch (err: any) {
      console.error('Error checking connection:', err);
      setError(err.message || 'فشل الاتصال بالسيرفر');
      setIsLoading(false);
      setIsConnecting(false);
    }
  };

  const restartConnection = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await fetch('/api/whatsapp/restart', { 
        method: 'POST',
        headers: { 'Content-Type': 'application/json' }
      });
      
      if (!response.ok && response.status !== 500) {
        throw new Error(`خطأ في الخادم: ${response.status}`);
      }
      
      const data = await response.json().catch(() => ({ success: true }));
      
      toast.success('جاري إعادة الاتصال...');
      setTimeout(checkConnection, 5000); // Wait 5 seconds before checking
      
    } catch (err: any) {
      console.error('Restart error:', err);
      // Don't show error for timeout - it's expected during restart
      if (!err.message?.includes('timeout')) {
        toast.error('حدث خطأ، جرب مرة أخرى');
      } else {
        toast.success('جاري إعادة الاتصال...');
        setTimeout(checkConnection, 5000);
      }
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-dark-100 via-dark-200 to-dark-300 p-8">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-8"
        >
          <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-green-500 to-emerald-600 rounded-full mb-4 p-1">
            <img 
              src="/images/logo.jpg" 
              alt="Logo" 
              className="w-full h-full rounded-full object-cover"
              onError={(e) => {
                e.currentTarget.style.display = 'none';
                e.currentTarget.nextElementSibling?.classList.remove('hidden');
              }}
            />
            <div className="hidden w-full h-full rounded-full bg-gradient-to-br from-green-600 to-emerald-600 flex items-center justify-center">
              <Smartphone className="w-10 h-10 text-white" />
            </div>
          </div>
          <h1 className="text-4xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-green-400 to-emerald-400 mb-2">
            ربط واتساب
          </h1>
          <p className="text-gray-400">
            امسح رمز QR لربط حساب واتساب بالنظام
          </p>
        </motion.div>

        {/* Connection Status */}
        <div className="grid md:grid-cols-2 gap-6 mb-8">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className={`p-6 rounded-xl border ${
              isConnected
                ? 'bg-green-500/10 border-green-500/30'
                : 'bg-red-500/10 border-red-500/30'
            }`}
          >
            <div className="flex items-center gap-3">
              {isConnected ? (
                <CheckCircle className="w-8 h-8 text-green-400" />
              ) : (
                <XCircle className="w-8 h-8 text-red-400" />
              )}
              <div>
                <h3 className="text-lg font-semibold text-white">
                  {isConnected ? 'متصل' : 'غير متصل'}
                </h3>
                <p className="text-sm text-gray-400">
                  {isConnected
                    ? 'واتساب متصل ويعمل بشكل طبيعي'
                    : 'يرجى مسح رمز QR للاتصال'}
                </p>
              </div>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className="p-6 rounded-xl bg-blue-500/10 border border-blue-500/30"
          >
            <div className="flex items-center gap-3">
              <RefreshCw className="w-8 h-8 text-blue-400" />
              <div>
                <h3 className="text-lg font-semibold text-white">إعادة الاتصال</h3>
                <p className="text-sm text-gray-400">
                  اضغط لإعادة محاولة الاتصال
                </p>
              </div>
            </div>
            <button
              onClick={restartConnection}
              disabled={isLoading}
              className="mt-4 w-full py-2 bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700 disabled:from-gray-600 disabled:to-gray-700 text-white rounded-lg transition-all"
            >
              {isLoading ? 'جاري الاتصال...' : 'إعادة الاتصال'}
            </button>
          </motion.div>
        </div>

        {/* QR Code Display */}
        {!isConnected && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-dark-200/80 backdrop-blur-xl border border-blue-500/20 rounded-2xl p-8"
          >
            <div className="text-center">
              {isLoading ? (
                <div className="flex flex-col items-center justify-center py-16">
                  <div className="w-16 h-16 border-4 border-blue-500/30 border-t-blue-500 rounded-full animate-spin mb-4"></div>
                  <p className="text-gray-400">جاري تحميل رمز QR...</p>
                </div>
              ) : isConnecting ? (
                <div className="flex flex-col items-center justify-center py-16">
                  <div className="w-16 h-16 border-4 border-green-500/30 border-t-green-500 rounded-full animate-spin mb-4"></div>
                  <p className="text-green-400 text-xl font-semibold mb-2">جاري الاتصال...</p>
                  <p className="text-gray-400">تم مسح الكود بنجاح، يرجى الانتظار</p>
                </div>
              ) : qrCode ? (
                <>
                  <div className="mb-6">
                    <h3 className="text-xl font-bold text-white mb-2">
                      امسح رمز QR
                    </h3>
                    <p className="text-gray-400 text-sm">
                      افتح واتساب على هاتفك ← الأجهزة المرتبطة ← ربط جهاز
                    </p>
                  </div>

                  <div className="inline-block p-6 bg-white rounded-2xl shadow-2xl">
                    <img
                      src={`https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=${encodeURIComponent(
                        qrCode
                      )}`}
                      alt="WhatsApp QR Code"
                      className="w-64 h-64 md:w-80 md:h-80"
                    />
                  </div>

                  <div className="mt-6 p-4 bg-yellow-500/10 border border-yellow-500/20 rounded-xl">
                    <p className="text-yellow-400 text-sm">
                      ⏱️ رمز QR صالح لمدة دقيقتين فقط. إذا انتهت المدة، اضغط "إعادة
                      الاتصال"
                    </p>
                  </div>
                </>
              ) : error ? (
                <div className="py-16">
                  <XCircle className="w-16 h-16 text-red-400 mx-auto mb-4" />
                  <p className="text-red-400">{error}</p>
                  <button
                    onClick={restartConnection}
                    className="mt-4 px-6 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-all"
                  >
                    إعادة المحاولة
                  </button>
                </div>
              ) : (
                <div className="py-16">
                  <p className="text-gray-400 mb-4">لم يتم العثور على رمز QR</p>
                  <button
                    onClick={restartConnection}
                    className="px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-all"
                  >
                    طلب رمز QR
                  </button>
                </div>
              )}
            </div>
          </motion.div>
        )}

        {/* Connected State */}
        {isConnected && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-gradient-to-br from-green-500/10 to-emerald-500/10 border border-green-500/30 rounded-2xl p-8 text-center"
          >
            <CheckCircle className="w-20 h-20 text-green-400 mx-auto mb-4" />
            <h3 className="text-2xl font-bold text-white mb-2">
              متصل بنجاح! 🎉
            </h3>
            <p className="text-gray-300 mb-6">
              حساب واتساب مرتبط ويعمل بشكل صحيح
            </p>
            <div className="space-y-3 text-sm text-gray-400">
              <p>✅ البوت الذكي جاهز للرد على الرسائل</p>
              <p>✅ جميع المحادثات تصل للنظام</p>
              <p>✅ الردود التلقائية مفعلة</p>
            </div>
          </motion.div>
        )}

        {/* Instructions */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="mt-8 bg-dark-200/50 border border-blue-500/20 rounded-xl p-6"
        >
          <h3 className="text-lg font-semibold text-white mb-4">
            📝 خطوات الربط:
          </h3>
          <ol className="space-y-3 text-gray-300 text-sm list-decimal list-inside">
            <li>افتح واتساب على هاتفك المحمول</li>
            <li>
              اضغط على <strong>القائمة (⋮)</strong> أو <strong>الإعدادات</strong>
            </li>
            <li>
              اختر <strong>الأجهزة المرتبطة</strong>
            </li>
            <li>
              اضغط <strong>ربط جهاز</strong>
            </li>
            <li>وجّه كاميرا هاتفك نحو رمز QR أعلاه</li>
            <li>انتظر حتى يتم الاتصال بنجاح ✅</li>
          </ol>
        </motion.div>
      </div>
    </div>
  );
}
