'use client';

import { Conversation, User } from '@/types';
import { Monitor, MonitorOff, X, Users, UserPlus } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useState } from 'react';

interface ScreenSharePanelProps {
  conversation: Conversation;
  currentUserName: string;
  onStartShare: () => void;
  onStopShare: () => void;
  users: User[];
  onShareWithColleague: (colleagueId: string) => void;
  onStopColleagueShare: (colleagueId: string) => void;
}

const ScreenSharePanel = ({
  conversation,
  currentUserName,
  onStartShare,
  onStopShare,
  users,
  onShareWithColleague,
  onStopColleagueShare,
}: ScreenSharePanelProps) => {
  const [showColleagueSelect, setShowColleagueSelect] = useState(false);
  const isSharing = conversation.isScreenSharing;
  const isMyShare = conversation.screenShareBy === currentUserName;
  const sharedColleagues = conversation.screenShareWithColleagues || [];
  const availableColleagues = users.filter(u => 
    u.name !== currentUserName && !sharedColleagues.includes(u.id)
  );

  return (
    <AnimatePresence>
      {isSharing && (
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
          className="p-4 bg-gradient-to-r from-purple-600/20 to-pink-600/20 border border-purple-500/30 rounded-xl mb-4"
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-purple-500/30 rounded-lg animate-pulse">
                <Monitor className="w-5 h-5 text-purple-300" />
              </div>
              <div>
                <p className="text-white font-semibold">
                  {isMyShare ? 'أنت تشارك الشاشة الآن' : `${conversation.screenShareBy} يشارك الشاشة`}
                </p>
                <p className="text-sm text-purple-300">
                  مشاركة الشاشة نشطة
                </p>
              </div>
            </div>
            <div className="flex gap-2">
              {isMyShare && (
                <>
                  <button
                    onClick={() => setShowColleagueSelect(!showColleagueSelect)}
                    className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-all flex items-center gap-2"
                  >
                    <UserPlus className="w-4 h-4" />
                    <span>مشاركة مع زميل</span>
                  </button>
                  <button
                    onClick={onStopShare}
                    className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-all flex items-center gap-2"
                  >
                    <MonitorOff className="w-4 h-4" />
                    <span>إيقاف المشاركة</span>
                  </button>
                </>
              )}
            </div>
          </div>

          {/* Colleague Selector */}
          <AnimatePresence>
            {showColleagueSelect && isMyShare && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="mt-3 p-3 bg-purple-500/10 rounded-lg border border-purple-500/20"
              >
                <p className="text-sm text-purple-300 mb-2 font-semibold">اختر زميل لمشاركة الشاشة معه:</p>
                <div className="flex flex-wrap gap-2">
                  {availableColleagues.length > 0 ? (
                    availableColleagues.map(colleague => (
                      <button
                        key={colleague.id}
                        onClick={() => {
                          onShareWithColleague(colleague.id);
                          setShowColleagueSelect(false);
                        }}
                        className="px-3 py-1 bg-purple-600 hover:bg-purple-700 text-white text-sm rounded-lg transition-all"
                      >
                        {colleague.name}
                      </button>
                    ))
                  ) : (
                    <p className="text-sm text-purple-400">لا يوجد زملاء متاحين</p>
                  )}
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Shared Colleagues List */}
          {sharedColleagues.length > 0 && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="mt-3 p-3 bg-purple-500/10 rounded-lg border border-purple-500/20"
            >
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <Users className="w-4 h-4 text-purple-300" />
                  <p className="text-sm text-purple-300 font-semibold">الزملاء المشاركون:</p>
                </div>
              </div>
              <div className="flex flex-wrap gap-2">
                {sharedColleagues.map(colleagueId => {
                  const colleague = users.find(u => u.id === colleagueId);
                  return colleague ? (
                    <div
                      key={colleagueId}
                      className="flex items-center gap-2 px-3 py-1 bg-purple-600/50 text-white text-sm rounded-lg"
                    >
                      <span>{colleague.name}</span>
                      {isMyShare && (
                        <button
                          onClick={() => onStopColleagueShare(colleagueId)}
                          className="hover:text-red-300 transition-colors"
                        >
                          <X className="w-3 h-3" />
                        </button>
                      )}
                    </div>
                  ) : null;
                })}
              </div>
            </motion.div>
          )}

          {/* Mock Screen Share View */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="mt-4 aspect-video bg-dark-300 rounded-lg overflow-hidden border border-purple-500/20 relative"
          >
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="text-center">
                <Monitor className="w-16 h-16 text-purple-400 mx-auto mb-3 animate-pulse" />
                <p className="text-gray-400">عرض مشاركة الشاشة</p>
                <p className="text-xs text-gray-500 mt-1">
                  {isMyShare ? 'شاشتك مرئية للعميل' : 'مشاهدة شاشة الموظف'}
                </p>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default ScreenSharePanel;
