

import React, { useState, useCallback, useRef, useEffect } from 'react';
import { ChatMessage } from '../types';
import { getResponse } from '../services/geminiService';
import { fetchConversationHistory, saveConversationHistory, resetConversationHistory } from '../services/conversationService';
import { PaperAirplaneIcon } from './icons/PaperAirplaneIcon';
import { ChatBubbleLeftRightIcon } from './icons/ChatBubbleLeftRightIcon';
import { ArrowPathIcon } from './icons/ArrowPathIcon'; 
import Spinner from './Spinner';

interface ChatInterfaceProps {
  assistantSystemPrompt: string;
  assistantName: string;
  accentColor: string;
  userId?: string; 
  assistantId: string; 
  onAuthRequired: (message: string) => void;
}

const MAX_GUEST_MESSAGES = 3;
const getGuestMessageCountKey = (assistId: string) => `guestMessageCount_${assistId}`;

const ChatInterface: React.FC<ChatInterfaceProps> = ({
  assistantSystemPrompt,
  assistantName,
  accentColor,
  userId,
  assistantId,
  onAuthRequired,
}) => {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [userInput, setUserInput] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [isHistoryLoading, setIsHistoryLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [guestMessagesSent, setGuestMessagesSent] = useState<number>(0);
  const chatEndRef = useRef<null | HTMLDivElement>(null);
  const textareaRef = useRef<null | HTMLTextAreaElement>(null);

  const scrollToBottom = useCallback(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  },[]);

  useEffect(scrollToBottom, [messages, isLoading]);

  const getInitialGreeting = useCallback((): ChatMessage => ({
    id: Date.now().toString(),
    sender: 'ai',
    text: `Hello! I'm ${assistantName}. How can I assist you today?`,
    timestamp: Date.now(),
  }), [assistantName]);

  useEffect(() => {
    const loadHistoryOrInitialize = async () => {
      if (userId && assistantId) { 
        setIsHistoryLoading(true);
        setError(null);
        setGuestMessagesSent(0); 
        try {
          const history = await fetchConversationHistory(userId, assistantId);
          setMessages(history.length > 0 ? history : [getInitialGreeting()]);
        } catch (err) {
          console.error("Failed to load conversation history:", err);
          setError("Could not load previous conversation. Starting fresh.");
          setMessages([getInitialGreeting()]);
        } finally {
          setIsHistoryLoading(false);
        }
      } else if (assistantId) { 
        setIsHistoryLoading(false); 
        setError(null);
        try {
            const count = parseInt(sessionStorage.getItem(getGuestMessageCountKey(assistantId)) || '0', 10);
            setGuestMessagesSent(count);
        } catch(e) {
            console.warn("Could not access sessionStorage for guest message count:", e);
            setGuestMessagesSent(0);
        }
        setMessages([getInitialGreeting()]);
      } else { 
        setMessages([getInitialGreeting()]);
        setGuestMessagesSent(0);
      }
    };

    loadHistoryOrInitialize();
  }, [userId, assistantId, assistantName, getInitialGreeting]);
  
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto'; 
      textareaRef.current.style.height = `${textareaRef.current.scrollHeight}px`; 
    }
  }, [userInput]);


  const handleSendMessage = useCallback(async () => {
    if (!userInput.trim()) return;

    if (!userId && assistantId) { 
      if (guestMessagesSent >= MAX_GUEST_MESSAGES) {
        onAuthRequired(`You've reached the ${MAX_GUEST_MESSAGES} message limit for guests with this assistant. Please register or log in to continue chatting.`);
        return;
      }
    }

    const newUserMessage: ChatMessage = {
      id: Date.now().toString(),
      sender: 'user',
      text: userInput.trim(),
      timestamp: Date.now(),
    };
    
    setMessages(prevMessages => [...prevMessages, newUserMessage]);
    
    const currentInput = userInput; 
    setUserInput(''); 
    setIsLoading(true);
    setError(null);

    if (!userId && assistantId) {
      const newCount = guestMessagesSent + 1;
      setGuestMessagesSent(newCount);
      try {
        sessionStorage.setItem(getGuestMessageCountKey(assistantId), newCount.toString());
      } catch (e) {
        console.warn("Could not access sessionStorage to set guest message count:", e);
      }
    }

    try {
      const historyForGemini = messages; 
      const aiResponseText = await getResponse(currentInput.trim(), assistantSystemPrompt, historyForGemini);
      
      const newAiMessage: ChatMessage = {
        id: (Date.now() + 1).toString(), 
        sender: 'ai',
        text: aiResponseText,
        timestamp: Date.now(),
      };
      
      setMessages(prevMessages => [...prevMessages, newAiMessage]);

      if (userId && assistantId) { 
        setMessages(currentMessagesForSave => {
          saveConversationHistory(userId, assistantId, currentMessagesForSave);
          return currentMessagesForSave; 
        });
      }
    } catch (err) {
      console.error("Error getting AI response or saving history:", err);
      const errorMessageText = err instanceof Error ? err.message : "An unknown error occurred.";
      const errorAiMessage: ChatMessage = {
        id: (Date.now() + 1).toString(), 
        sender: 'ai',
        text: `Oops! I encountered an issue: ${errorMessageText}. Please try again.`,
        timestamp: Date.now(),
      };
      setMessages(prevMessages => [...prevMessages, errorAiMessage]);
    } finally {
      setIsLoading(false);
      textareaRef.current?.focus();
    }
  }, [userInput, messages, assistantSystemPrompt, userId, assistantId, guestMessagesSent, onAuthRequired, assistantName, getInitialGreeting]);

  const handleResetConversation = async () => {
    if (!userId || !assistantId) return; 
    
    const confirmed = window.confirm("Are you sure you want to reset this conversation? All history with this assistant will be deleted.");
    if (!confirmed) return;

    setIsLoading(true); 
    setError(null);
    try {
      await resetConversationHistory(userId, assistantId);
      setMessages([getInitialGreeting()]); 
    } catch (err) {
      console.error("Failed to reset conversation:", err);
      setError(err instanceof Error ? err.message : "Could not reset conversation.");
    } finally {
      setIsLoading(false);
    }
  };

  const isGuestLimitReached = !userId && guestMessagesSent >= MAX_GUEST_MESSAGES;
  const isSendDisabled = isLoading || isHistoryLoading || !userInput.trim() || isGuestLimitReached;

  return (
    <div className="flex flex-col h-full bg-neutral-800/70 rounded-lg">
      <div className="p-3 border-b border-neutral-700/50 flex justify-between items-center flex-shrink-0">
         <h3 className={`text-base sm:text-lg font-semibold ${accentColor.replace('bg-','text-')} truncate pr-2`}>Chat with {assistantName}</h3>
         {userId && assistantId && (
           <button
             onClick={handleResetConversation}
             disabled={isLoading || isHistoryLoading}
             title="Reset conversation history"
             className={`p-1.5 rounded-md hover:bg-neutral-600 text-neutral-400 hover:text-neutral-100 transition-colors disabled:opacity-50 disabled:cursor-not-allowed`}
           >
             <ArrowPathIcon className="h-5 w-5" />
           </button>
         )}
      </div>

      <div className="flex-grow overflow-y-auto p-3 sm:p-4 space-y-3 sm:space-y-4 scrollbar-thin scrollbar-thumb-neutral-600 scrollbar-track-neutral-700/50">
        {isHistoryLoading && (
           <div className="flex justify-center items-center py-10">
             <Spinner />
             <p className="ml-3 text-sm text-neutral-400">Loading chat history...</p>
           </div>
        )}
        {!isHistoryLoading && messages.map((msg) => (
          <div key={msg.id} className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}>
            <div
              className={`max-w-[85%] sm:max-w-[80%] px-3 py-2 sm:px-4 sm:py-2.5 rounded-lg shadow ${ // Simplified rounding
                msg.sender === 'user'
                  ? `${accentColor} text-white`
                  : 'bg-neutral-700 text-neutral-200'
              }`}
            >
              <p className="text-sm sm:text-base whitespace-pre-wrap break-words">{msg.text}</p>
              <p className={`text-[10px] sm:text-xs mt-1.5 opacity-70 ${msg.sender === 'user' ? 'text-neutral-200 text-right' : 'text-neutral-400 text-left'}`}>
                {new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
              </p>
            </div>
          </div>
        ))}
        {isLoading && !isHistoryLoading && ( 
          <div className="flex justify-start">
            <div className="max-w-[70%] px-3 py-2 sm:px-4 sm:py-2.5 rounded-lg shadow bg-neutral-700 text-neutral-200 flex items-center space-x-2">
              <Spinner /> {/* Removed animate-pulseSubtle */}
              <span className="text-sm sm:text-base italic">AI is thinking...</span>
            </div>
          </div>
        )}
        {error && !isHistoryLoading && ( 
          <div className="flex justify-center">
            <div className="max-w-[85%] px-3 py-2 sm:px-4 sm:py-2.5 rounded-lg shadow bg-red-600 text-white text-center">
              <p className="text-sm sm:text-base">{error}</p>
            </div>
          </div>
        )}
        <div ref={chatEndRef} />
      </div>
      <div className="p-3 sm:p-4 border-t border-neutral-700/50 flex-shrink-0 bg-neutral-800/50 rounded-b-lg">
        {isGuestLimitReached && (
            <p className="text-xs text-amber-400 text-center mb-2">
                Message limit reached. Please log in or register to continue.
            </p>
        )}
        <div className="flex items-end space-x-2 sm:space-x-3">
          <ChatBubbleLeftRightIcon className="h-6 w-6 text-neutral-500 mb-2 hidden sm:block flex-shrink-0" />
          <textarea
            ref={textareaRef}
            value={userInput}
            onChange={(e) => setUserInput(e.target.value)}
            onKeyPress={(e) => {
              if (e.key === 'Enter' && !e.shiftKey && !isSendDisabled) {
                e.preventDefault(); 
                handleSendMessage();
              }
            }}
            placeholder={isGuestLimitReached ? "Login to continue chatting..." : "Type your message (Shift+Enter for new line)"}
            className="flex-grow p-2.5 sm:p-3 bg-neutral-700 text-neutral-100 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none resize-none scrollbar-thin scrollbar-thumb-neutral-600 scrollbar-track-neutral-700/50 text-sm sm:text-base placeholder-neutral-500"
            rows={1}
            style={{ minHeight: '46px', maxHeight: '150px' }} 
            disabled={isLoading || isHistoryLoading || isGuestLimitReached}
            aria-disabled={isLoading || isHistoryLoading || isGuestLimitReached}
            aria-label="Chat input"
          />
          <button
            onClick={handleSendMessage}
            disabled={isSendDisabled}
            aria-disabled={isSendDisabled}
            className={`${accentColor} text-white p-2.5 sm:p-3 rounded-lg hover:opacity-90 transition-opacity disabled:opacity-60 disabled:cursor-not-allowed self-end flex-shrink-0 focus:ring-2 focus:ring-offset-2 focus:ring-offset-neutral-800 focus:${accentColor.replace('bg-','ring-')}`}
            aria-label="Send message"
          >
            <PaperAirplaneIcon className="h-5 w-5 sm:h-6 sm:w-6" />
          </button>
        </div>
      </div>
    </div>
  );
};

export default ChatInterface;