import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Send, Bot, User, Sparkles, ChevronRight, RotateCcw } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import { sendMessage } from '../../services/aiService.js';
import useStore from '../../store/useStore.js';

const QUICK_PROMPTS = [
  { text: "What's the current staking APY?", icon: '📊' },
  { text: 'How do I stake NEX tokens?', icon: '🔰' },
  { text: 'Explain DeFi risks I should know', icon: '⚠️' },
  { text: 'What is impermanent loss?', icon: '📉' },
  { text: 'How are staking rewards calculated?', icon: '🧮' },
  { text: 'Tips for DeFi portfolio management', icon: '💼' },
];

const INTRO_MESSAGE = {
  role: 'assistant',
  content: `# Welcome to NexAI! 🚀

I'm your intelligent DeFi assistant for the NexDeFi platform. I can help you with:

- **Staking guidance** — How to stake NEX, APY calculations, lock periods
- **DeFi education** — Understand protocols, risks, and strategies
- **Portfolio insights** — Analyze your positions and get recommendations
- **Blockchain basics** — Transactions, gas fees, wallets, and more

Select a quick prompt below or ask me anything about DeFi and Web3!`,
};

function TypingIndicator() {
  return (
    <div className="flex items-end gap-2">
      <div className="w-8 h-8 rounded-full bg-gradient-to-br from-neon-cyan/20 to-neon-purple/20 border border-neon-cyan/30 flex items-center justify-center flex-shrink-0">
        <Bot className="w-4 h-4 text-neon-cyan" />
      </div>
      <div className="bg-dark-hover border border-dark-border rounded-2xl rounded-bl-sm px-4 py-3">
        <div className="flex gap-1.5 items-center">
          <div className="typing-dot" />
          <div className="typing-dot" />
          <div className="typing-dot" />
        </div>
      </div>
    </div>
  );
}

function MessageBubble({ message, isNew }) {
  const isUser = message.role === 'user';

  return (
    <motion.div
      initial={isNew ? { opacity: 0, y: 10 } : false}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className={`flex gap-3 ${isUser ? 'flex-row-reverse' : 'flex-row'}`}
    >
      {/* Avatar */}
      <div className={`
        w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 mt-1
        ${isUser
          ? 'bg-neon-purple/20 border border-neon-purple/30'
          : 'bg-gradient-to-br from-neon-cyan/20 to-neon-purple/20 border border-neon-cyan/30'
        }
      `}>
        {isUser
          ? <User className="w-4 h-4 text-neon-purple" />
          : <Bot className="w-4 h-4 text-neon-cyan" />
        }
      </div>

      {/* Bubble */}
      <div className={`
        max-w-[85%] rounded-2xl px-4 py-3 text-sm leading-relaxed
        ${isUser
          ? 'bg-neon-purple/10 border border-neon-purple/20 text-white rounded-tr-sm'
          : 'bg-dark-hover border border-dark-border text-gray-200 rounded-tl-sm'
        }
      `}>
        {isUser ? (
          <p>{message.content}</p>
        ) : (
          <div className="prose prose-invert prose-sm max-w-none
            prose-headings:text-neon-cyan prose-headings:font-semibold
            prose-strong:text-white prose-strong:font-semibold
            prose-code:text-neon-cyan prose-code:bg-neon-cyan/10 prose-code:px-1 prose-code:rounded
            prose-li:text-gray-300 prose-p:text-gray-200
            prose-a:text-neon-cyan prose-a:no-underline hover:prose-a:underline
          ">
            <ReactMarkdown>{message.content}</ReactMarkdown>
          </div>
        )}
      </div>
    </motion.div>
  );
}

export default function AIAssistant({ contextData }) {
  const [messages, setMessages] = useState([INTRO_MESSAGE]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);
  const { account, nexBalance, stakedAmount, pendingRewards } = useStore();

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isLoading]);

  const buildContext = () => ({
    userAddress: account || 'Not connected',
    nexBalance: nexBalance || '0',
    stakedAmount: stakedAmount || '0',
    pendingRewards: pendingRewards || '0',
    platform: 'NexDeFi',
    stakingAPY: '12%',
    lockPeriod: '7 days',
    ...contextData,
  });

  const sendUserMessage = async (text) => {
    if (!text.trim() || isLoading) return;
    setError(null);

    const userMessage = { role: 'user', content: text.trim() };
    const updatedMessages = [...messages, userMessage];
    setMessages(updatedMessages);
    setInput('');
    setIsLoading(true);

    try {
      // Filter out the intro message (it's not part of real chat history)
      const chatHistory = updatedMessages.filter((m) => m !== INTRO_MESSAGE);
      const response = await sendMessage(chatHistory, buildContext());

      setMessages((prev) => [
        ...prev,
        { role: 'assistant', content: response.message, isNew: true },
      ]);
    } catch (err) {
      setError(err.message || 'Failed to get response. Please check if the backend is running.');
      setMessages((prev) => [
        ...prev,
        {
          role: 'assistant',
          content: `I'm currently unable to connect to the AI service. **Error:** ${err.message}\n\nPlease ensure the backend server is running on port 3001.`,
          isNew: true,
        },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    sendUserMessage(input);
  };

  const handleReset = () => {
    setMessages([INTRO_MESSAGE]);
    setError(null);
    inputRef.current?.focus();
  };

  const userMessages = messages.filter((m) => m.role === 'user');

  return (
    <div className="flex flex-col h-full bg-dark-card rounded-2xl border border-dark-border overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between px-5 py-4 border-b border-dark-border bg-gradient-to-r from-neon-cyan/5 to-neon-purple/5">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-neon-cyan/20 to-neon-purple/20 border border-neon-cyan/30 flex items-center justify-center relative">
            <Bot className="w-5 h-5 text-neon-cyan" />
            <span className="absolute -top-0.5 -right-0.5 w-2.5 h-2.5 rounded-full bg-neon-green border border-dark-card animate-pulse" />
          </div>
          <div>
            <h3 className="text-white font-semibold flex items-center gap-1.5">
              NexAI
              <Sparkles className="w-3.5 h-3.5 text-neon-cyan" />
            </h3>
            <p className="text-gray-400 text-xs">Powered by GPT-4o-mini</p>
          </div>
        </div>
        <button
          onClick={handleReset}
          className="p-2 rounded-xl hover:bg-white/5 text-gray-400 hover:text-neon-cyan transition-colors"
          title="Reset conversation"
        >
          <RotateCcw className="w-4 h-4" />
        </button>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto px-4 py-5 space-y-4 min-h-0">
        {messages.map((msg, i) => (
          <MessageBubble key={i} message={msg} isNew={!!msg.isNew} />
        ))}

        {/* Typing Indicator */}
        {isLoading && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
          >
            <TypingIndicator />
          </motion.div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Quick Prompts */}
      {userMessages.length === 0 && (
        <div className="px-4 pb-3">
          <p className="text-gray-500 text-xs mb-2 uppercase tracking-wider">Suggested Questions</p>
          <div className="flex flex-wrap gap-2">
            {QUICK_PROMPTS.map((prompt, i) => (
              <motion.button
                key={i}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: i * 0.05 }}
                onClick={() => sendUserMessage(prompt.text)}
                className="
                  flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs
                  bg-dark-hover border border-dark-border text-gray-400
                  hover:bg-neon-cyan/5 hover:border-neon-cyan/30 hover:text-neon-cyan
                  transition-all duration-200
                "
              >
                <span>{prompt.icon}</span>
                <span>{prompt.text}</span>
              </motion.button>
            ))}
          </div>
        </div>
      )}

      {/* Input */}
      <form
        onSubmit={handleSubmit}
        className="px-4 py-4 border-t border-dark-border"
      >
        <div className="flex gap-2">
          <input
            ref={inputRef}
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Ask NexAI anything about DeFi..."
            disabled={isLoading}
            className="
              flex-1 bg-dark-hover border border-dark-border rounded-xl
              px-4 py-2.5 text-white text-sm
              placeholder-gray-600
              focus:outline-none focus:border-neon-cyan/50 focus:shadow-[0_0_0_2px_rgba(0,212,255,0.1)]
              disabled:opacity-50 transition-all
            "
          />
          <motion.button
            type="submit"
            disabled={!input.trim() || isLoading}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="
              w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0
              bg-neon-cyan/10 border border-neon-cyan/30 text-neon-cyan
              hover:bg-neon-cyan/20 hover:border-neon-cyan hover:shadow-neon-cyan
              disabled:opacity-40 disabled:cursor-not-allowed
              transition-all duration-200
            "
          >
            {isLoading
              ? <div className="w-4 h-4 border-2 border-neon-cyan/30 border-t-neon-cyan rounded-full animate-spin" />
              : <Send className="w-4 h-4" />
            }
          </motion.button>
        </div>
      </form>
    </div>
  );
}
