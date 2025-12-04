'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, Edit2, Trash2, Save, ChevronDown, ChevronRight } from 'lucide-react';
import { toast } from 'react-hot-toast';

interface QuestionOption {
  id: string;
  label: string;
  emoji: string;
  nextQuestionId: string | null;
  responseText: string;
}

interface QuestionNode {
  id: string;
  text: string;
  options: QuestionOption[];
}

interface QuestionTreeEditorProps {
  onSave: (tree: Record<string, QuestionNode>) => void;
}

export default function QuestionTreeEditor({ onSave }: QuestionTreeEditorProps) {
  const [questionTree, setQuestionTree] = useState<Record<string, QuestionNode>>({});
  const [selectedNode, setSelectedNode] = useState<string | null>(null);
  const [expandedNodes, setExpandedNodes] = useState<Set<string>>(new Set(['welcome']));
  const [editingNode, setEditingNode] = useState<QuestionNode | null>(null);

  // Load initial question tree
  useEffect(() => {
    // Load from localStorage or API
    const saved = localStorage.getItem('questionTree');
    if (saved) {
      try {
        setQuestionTree(JSON.parse(saved));
      } catch (e) {
        loadDefaultTree();
      }
    } else {
      loadDefaultTree();
    }
  }, []);

  const loadDefaultTree = () => {
    const defaultTree: Record<string, QuestionNode> = {
      welcome: {
        id: 'welcome',
        text: 'مرحبًا بك في *المسار الساخن للسفر والسياحة* 🔥🌍\n\nيشرفنا نخدمك! اختر الخدمة المطلوبة:',
        options: [
          {
            id: '1',
            label: 'حجز وحدات الضيافة',
            emoji: '🏘️',
            nextQuestionId: 'hospitality_units',
            responseText: 'ممتاز! اختر نوع وحدة الضيافة:',
          },
          {
            id: '2',
            label: 'حجز سيارات',
            emoji: '🚗',
            nextQuestionId: 'car_rental',
            responseText: 'اختر نوع حجز السيارة:',
          },
          {
            id: '3',
            label: 'البرامج السياحية',
            emoji: '🗺️',
            nextQuestionId: 'tours_activities',
            responseText: 'اختر نوع الخدمة السياحية:',
          },
        ],
      },
    };
    setQuestionTree(defaultTree);
  };

  const toggleNode = (nodeId: string) => {
    const newExpanded = new Set(expandedNodes);
    if (newExpanded.has(nodeId)) {
      newExpanded.delete(nodeId);
    } else {
      newExpanded.add(nodeId);
    }
    setExpandedNodes(newExpanded);
  };

  const handleSave = () => {
    localStorage.setItem('questionTree', JSON.stringify(questionTree));
    onSave(questionTree);
    toast.success('تم حفظ شجرة الأسئلة بنجاح! ✅');
  };

  const handleEditNode = (node: QuestionNode) => {
    setEditingNode({ ...node });
  };

  const handleUpdateNode = () => {
    if (!editingNode) return;
    
    setQuestionTree({
      ...questionTree,
      [editingNode.id]: editingNode,
    });
    setEditingNode(null);
    toast.success('تم تحديث السؤال ✅');
  };

  const handleAddOption = () => {
    if (!editingNode) return;
    
    const newOption: QuestionOption = {
      id: String(editingNode.options.length + 1),
      label: 'خيار جديد',
      emoji: '📌',
      nextQuestionId: null,
      responseText: 'شكراً لاختيارك!',
    };
    
    setEditingNode({
      ...editingNode,
      options: [...editingNode.options, newOption],
    });
  };

  const handleDeleteOption = (optionId: string) => {
    if (!editingNode) return;
    
    setEditingNode({
      ...editingNode,
      options: editingNode.options.filter((opt) => opt.id !== optionId),
    });
  };

  const renderNode = (nodeId: string, level: number = 0) => {
    const node = questionTree[nodeId];
    if (!node) return null;

    const isExpanded = expandedNodes.has(nodeId);
    const isSelected = selectedNode === nodeId;

    return (
      <div key={nodeId} className="relative" style={{ marginRight: `${level * 20}px` }}>
        <div
          onClick={() => {
            toggleNode(nodeId);
            setSelectedNode(nodeId);
          }}
          className={`flex items-center gap-2 p-3 rounded-lg cursor-pointer transition-all mb-2 ${
            isSelected
              ? 'bg-blue-500/20 border border-blue-500/50'
              : 'bg-dark-300/50 border border-blue-500/10 hover:border-blue-500/30'
          }`}
        >
          {node.options.length > 0 && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                toggleNode(nodeId);
              }}
              className="text-gray-400 hover:text-white"
            >
              {isExpanded ? <ChevronDown className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
            </button>
          )}
          
          <div className="flex-1">
            <div className="text-white font-medium text-sm mb-1">{nodeId}</div>
            <div className="text-gray-400 text-xs line-clamp-1">{node.text.substring(0, 50)}...</div>
          </div>

          <button
            onClick={(e) => {
              e.stopPropagation();
              handleEditNode(node);
            }}
            className="p-2 text-blue-400 hover:bg-blue-500/20 rounded-lg transition-all"
          >
            <Edit2 className="w-4 h-4" />
          </button>
        </div>

        {isExpanded && node.options.length > 0 && (
          <div className="mr-6 space-y-1">
            {node.options.map((option) => (
              <div key={option.id} className="relative">
                <div className="flex items-center gap-2 p-2 bg-dark-200/50 border border-blue-500/10 rounded-lg text-sm">
                  <span className="text-lg">{option.emoji}</span>
                  <span className="text-gray-300">{option.label}</span>
                </div>
                {option.nextQuestionId && renderNode(option.nextQuestionId, level + 1)}
              </div>
            ))}
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-xl font-bold text-white">محرر شجرة الأسئلة</h3>
          <p className="text-gray-400 text-sm mt-1">عدّل الأسئلة والأجوبة بشكل مرئي</p>
        </div>
        <button
          onClick={handleSave}
          className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-green-600 to-emerald-600 text-white rounded-lg hover:from-green-700 hover:to-emerald-700 transition-all"
        >
          <Save className="w-4 h-4" />
          <span>حفظ التعديلات</span>
        </button>
      </div>

      <div className="grid grid-cols-2 gap-6">
        {/* Tree View */}
        <div className="bg-dark-200/50 border border-blue-500/20 rounded-xl p-4 max-h-[600px] overflow-y-auto">
          <h4 className="text-white font-semibold mb-4">شجرة الأسئلة</h4>
          {renderNode('welcome')}
        </div>

        {/* Editor Panel */}
        <div className="bg-dark-200/50 border border-blue-500/20 rounded-xl p-4 max-h-[600px] overflow-y-auto">
          {editingNode ? (
            <div className="space-y-4">
              <div className="flex items-center justify-between mb-4">
                <h4 className="text-white font-semibold">تعديل السؤال</h4>
                <button
                  onClick={() => setEditingNode(null)}
                  className="text-gray-400 hover:text-white"
                >
                  إلغاء
                </button>
              </div>

              {/* Question ID */}
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  معرف السؤال (ID)
                </label>
                <input
                  type="text"
                  value={editingNode.id}
                  disabled
                  className="w-full bg-dark-300 border border-gray-600 rounded-lg px-4 py-2 text-gray-500"
                />
              </div>

              {/* Question Text */}
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  نص السؤال
                </label>
                <textarea
                  value={editingNode.text}
                  onChange={(e) => setEditingNode({ ...editingNode, text: e.target.value })}
                  rows={4}
                  className="w-full bg-dark-300 border border-blue-500/20 rounded-lg px-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              {/* Options */}
              <div>
                <div className="flex items-center justify-between mb-3">
                  <label className="block text-sm font-medium text-gray-300">
                    الخيارات ({editingNode.options.length})
                  </label>
                  <button
                    onClick={handleAddOption}
                    className="flex items-center gap-1 px-3 py-1 bg-blue-600 text-white rounded-lg text-sm hover:bg-blue-700"
                  >
                    <Plus className="w-4 h-4" />
                    إضافة خيار
                  </button>
                </div>

                <div className="space-y-3">
                  {editingNode.options.map((option, index) => (
                    <div
                      key={option.id}
                      className="bg-dark-300/50 border border-blue-500/10 rounded-lg p-3"
                    >
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-sm text-gray-400">خيار {index + 1}</span>
                        <button
                          onClick={() => handleDeleteOption(option.id)}
                          className="text-red-400 hover:text-red-500"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>

                      <input
                        type="text"
                        placeholder="اسم الخيار"
                        value={option.label}
                        onChange={(e) => {
                          const newOptions = [...editingNode.options];
                          newOptions[index].label = e.target.value;
                          setEditingNode({ ...editingNode, options: newOptions });
                        }}
                        className="w-full bg-dark-200 border border-gray-600 rounded-lg px-3 py-2 text-white text-sm mb-2"
                      />

                      <input
                        type="text"
                        placeholder="Emoji (مثل: 🔥)"
                        value={option.emoji}
                        onChange={(e) => {
                          const newOptions = [...editingNode.options];
                          newOptions[index].emoji = e.target.value;
                          setEditingNode({ ...editingNode, options: newOptions });
                        }}
                        className="w-full bg-dark-200 border border-gray-600 rounded-lg px-3 py-2 text-white text-sm mb-2"
                      />

                      <textarea
                        placeholder="رسالة الرد"
                        value={option.responseText}
                        onChange={(e) => {
                          const newOptions = [...editingNode.options];
                          newOptions[index].responseText = e.target.value;
                          setEditingNode({ ...editingNode, options: newOptions });
                        }}
                        rows={2}
                        className="w-full bg-dark-200 border border-gray-600 rounded-lg px-3 py-2 text-white text-sm"
                      />
                    </div>
                  ))}
                </div>
              </div>

              {/* Save Button */}
              <button
                onClick={handleUpdateNode}
                className="w-full py-2 bg-gradient-to-r from-blue-600 to-cyan-600 text-white rounded-lg hover:from-blue-700 hover:to-cyan-700 transition-all"
              >
                حفظ التغييرات
              </button>
            </div>
          ) : (
            <div className="flex items-center justify-center h-full text-gray-400">
              <div className="text-center">
                <Edit2 className="w-12 h-12 mx-auto mb-3 opacity-50" />
                <p>اختر سؤالاً من الشجرة للتعديل</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
