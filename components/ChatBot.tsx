'use client';

import { Conversation, Message, Question } from '@/types';
import { questionTree } from '@/lib/questionTree';
import { motion } from 'framer-motion';

interface ChatBotProps {
  conversation: Conversation;
  onSendBotMessage: (message: Message) => void;
  onUpdateConversation: (updates: Partial<Conversation>) => void;
}

const useChatBot = ({ conversation, onSendBotMessage, onUpdateConversation }: ChatBotProps) => {
  // Get current question
  const getCurrentQuestion = (): Question | null => {
    const questionId = conversation.currentQuestionId || 'welcome';
    return questionTree[questionId] || null;
  };

  // Send bot message
  const sendBotMessage = (text: string) => {
    console.log('🤖 Bot sending message:', text);
    const botMessage: Message = {
      id: Date.now().toString(),
      text,
      sender: 'bot',
      timestamp: new Date(),
      status: 'delivered',
    };
    onSendBotMessage(botMessage);
  };

  // Handle option selection
  const handleOptionSelect = (optionId: string) => {
    const currentQuestion = getCurrentQuestion();
    if (!currentQuestion) return;

    const selectedOption = currentQuestion.options.find(opt => opt.id === optionId);
    if (!selectedOption) return;

    // Send response text if exists
    if (selectedOption.responseText) {
      sendBotMessage(selectedOption.responseText);
    }

    // Update conversation department if specified
    if (selectedOption.department) {
      onUpdateConversation({ department: selectedOption.department });
    }

    // Navigate to next question
    if (selectedOption.nextQuestionId) {
      const nextQuestion = questionTree[selectedOption.nextQuestionId];
      if (nextQuestion) {
        // Update conversation state
        onUpdateConversation({ currentQuestionId: selectedOption.nextQuestionId });

        // Send next question after a delay
        setTimeout(() => {
          sendBotMessage(nextQuestion.text);
          
        }, 500);
      }
    }
  };

  // Handle user input (for text inputs)
  const handleUserInput = (userText: string) => {
    const currentQuestion = getCurrentQuestion();
    if (!currentQuestion || !currentQuestion.requiresInput) return;

    // Store collected data
    const collectedData = conversation.collectedData || {};
    collectedData[currentQuestion.id] = userText;
    onUpdateConversation({ collectedData });

    // Navigate to next step
    if (currentQuestion.nextStep) {
      const nextQuestion = questionTree[currentQuestion.nextStep];
      if (nextQuestion) {
        onUpdateConversation({ currentQuestionId: currentQuestion.nextStep });

        setTimeout(() => {
          // Replace placeholders in text
          let responseText = nextQuestion.text;
          if (responseText.includes('{booking_details}')) {
            const details = Object.entries(collectedData)
              .map(([key, value]) => `${key}: ${value}`)
              .join('\n');
            responseText = responseText.replace('{booking_details}', details);
          }
          if (responseText.includes('{complaint_number}')) {
            responseText = responseText.replace('{complaint_number}', Math.floor(Math.random() * 10000).toString());
          }

          sendBotMessage(responseText);
        }, 500);
      }
    }
  };

  // Initialize bot for new conversations
  const initializeBot = () => {
    console.log('🤖 Initializing bot, current question:', conversation.currentQuestionId);
    if (!conversation.currentQuestionId) {
      const welcomeQuestion = questionTree['welcome'];
      if (welcomeQuestion) {
        console.log('🤖 Sending welcome message:', welcomeQuestion.text);
        onUpdateConversation({ currentQuestionId: 'welcome' });
        setTimeout(() => {
          sendBotMessage(welcomeQuestion.text);
        }, 1000);
      }
    } else {
      console.log('🤖 Bot already initialized');
    }
  };

  // Render question options as buttons
  const renderOptions = () => {
    const currentQuestion = getCurrentQuestion();
    if (!currentQuestion || currentQuestion.requiresInput) return null;

    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-wrap gap-2 p-4 bg-dark-200/50 rounded-xl"
      >
        {currentQuestion.options.map((option) => (
          <button
            key={option.id}
            onClick={() => handleOptionSelect(option.id)}
            className="px-4 py-2 bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700 text-white rounded-lg transition-all flex items-center gap-2 shadow-lg hover:shadow-blue-500/30"
          >
            {option.emoji && <span>{option.emoji}</span>}
            <span>{option.label}</span>
          </button>
        ))}
      </motion.div>
    );
  };

  // Check if waiting for input
  const isWaitingForInput = () => {
    const currentQuestion = getCurrentQuestion();
    return currentQuestion?.requiresInput || false;
  };

  return {
    initializeBot,
    handleUserInput,
    renderOptions,
    isWaitingForInput,
  };
};

export default useChatBot;
