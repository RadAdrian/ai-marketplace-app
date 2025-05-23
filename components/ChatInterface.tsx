
import React, { useState, useCallback, useRef, useEffect } from 'react';
import { ChatMessage } from '../types';
import { getResponse } from '../services/geminiService';
import { fetchConversationHistory, saveConversationHistory, resetConversationHistory } from '../services/conversationService';
import { logUserMessage, getUserMessagesInLast24Hours } from '../services/usageService'; // New import
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
const MAX_USER_MESSAGES_24H = 50; // Limit for logged-in users
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
  const [isLoading, setIsLoading] = useState<boolean>(false); // For AI response
  const [isHistoryLoading, setIsHistoryLoading] = useState<boolean>(false); // For conversation history
  const [error, setError] = useState<string | null>(null); // General chat errors

  // Guest usage state
  const [guestMessagesSent, setGuestMessagesSent] = useState<number>(0);

  // Logged-in user usage state
  const [userMessagesLast24h, setUserMessagesLast24h] = useState<number>(0);
  const [isUserMessageLimitLoading, setIsUserMessageLimitLoading] = useState<boolean>(false);
  const [isUserMessageLimitReachedState, setIsUserMessageLimitReachedState] = useState<boolean>(false);

  const chatEndRef = useRef<null | HTMLDivElement>(null);
  const textareaRef = useRef<null | HTMLTextAreaElement>(null);

  // Log props when they change
  useEffect(() => {
    console.log(`[ChatInterface Props Check] userId: ${userId}, assistantId: ${assistantId}`);
  }, [userId, assistantId]);

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
    const loadChatData = async () => {
      console.log(`[ChatInterface loadChatData] Called. userId: ${userId}, assistantId: ${assistantId}`);
      setMessages([]); 
      setIsUserMessageLimitReachedState(false); 
      setError(null); 

      if (userId && assistantId) { 
        console.log('[ChatInterface loadChatData] Logged-in user flow.');
        setIsHistoryLoading(true);
        setIsUserMessageLimitLoading(true);
        setGuestMessagesSent(0); 
        try {
          const [history, count] = await Promise.all([
            fetchConversationHistory(userId, assistantId),
            getUserMessagesInLast24Hours(userId)
          ]);
          console.log(`[ChatInterface loadChatData] Fetched history (length ${history.length}) and message count (${count}).`);
          setMessages(history.length > 0 ? history : [getInitialGreeting()]);
          setUserMessagesLast24h(count);

          if (count >= MAX_USER_MESSAGES_24H) {
            setIsUserMessageLimitReachedState(true);
            setError(`You have reached your message limit of ${MAX_USER_MESSAGES_24H} for the past 24 hours. Please try again later.`);
            console.log('[ChatInterface loadChatData] User message limit reached on load.');
          }
        } catch (err) {
          console.error("[ChatInterface loadChatData] Failed to load conversation history or usage count:", err);
          setError("Could not load chat data. Starting fresh.");
          setMessages([getInitialGreeting()]);
          setUserMessagesLast24h(0);
        } finally {
          setIsHistoryLoading(false);
          setIsUserMessageLimitLoading(false);
        }
      } else if (assistantId) { 
        console.log('[ChatInterface loadChatData] Guest user flow.');
        setIsHistoryLoading(false); 
        setIsUserMessageLimitLoading(false);
        setUserMessagesLast24h(0); 
        try {
            const count = parseInt(sessionStorage.getItem(getGuestMessageCountKey(assistantId)) || '0', 10);
            setGuestMessagesSent(count);
        } catch(e) {
            console.warn("[ChatInterface loadChatData] Could not access sessionStorage for guest message count:", e);
            setGuestMessagesSent(0);
        }
        setMessages([getInitialGreeting()]);
      } else { 
        console.log('[ChatInterface loadChatData] No userId or assistantId. Setting initial greeting.');
        setMessages([getInitialGreeting()]);
        setGuestMessagesSent(0);
        setUserMessagesLast24h(0);
      }
    };

    loadChatData();
  }, [userId, assistantId, getInitialGreeting]); 
  
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto'; 
      textareaRef.current.style.height = `${textareaRef.current.scrollHeight}px`; 
    }
  }, [userInput]);


  const handleSendMessage = useCallback(async () => {
    console.log('[ChatInterface Log 1] handleSendMessage called.');
    console.log(`[ChatInterface Log 2] Initial states: userInput='${userInput}', isLoading=${isLoading}, isHistoryLoading=${isHistoryLoading}, isUserMessageLimitLoading=${isUserMessageLimitLoading}, userId=${userId}, assistantId=${assistantId}`);

    if (!userInput.trim() || isLoading || isHistoryLoading || isUserMessageLimitLoading) {
      console.log(`[ChatInterface Log 3] Early exit: userInput empty or loading. userInput: '${userInput.trim()}', isLoading: ${isLoading}, isHistoryLoading: ${isHistoryLoading}, isUserMessageLimitLoading: ${isUserMessageLimitLoading}`);
      return;
    }

    if (!userId && assistantId) { 
      console.log('[ChatInterface Log 4] Guest user flow initiated.');
      if (guestMessagesSent >= MAX_GUEST_MESSAGES) {
        console.log('[ChatInterface Log 5] Guest limit reached.');
        onAuthRequired(`You've reached the ${MAX_GUEST_MESSAGES} message limit for guests with this assistant. Please register or log in to continue chatting.`);
        return;
      }
    }

    if (userId && assistantId) {
      console.log('[ChatInterface Log 6] Logged-in user flow initiated. Checking message limit.');
      console.log(`[ChatInterface Log 7] User messages in last 24h: ${userMessagesLast24h}, Limit: ${MAX_USER_MESSAGES_24H}`);
      if (userMessagesLast24h >= MAX_USER_MESSAGES_24H) {
        console.log('[ChatInterface Log 8] Logged-in user message limit reached.');
        setIsUserMessageLimitReachedState(true); 
        setError(`You have reached your daily message limit of ${MAX_USER_MESSAGES_24H}. Please try again later.`);
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
    
    // This is the block we are trying to reach for logged-in users
    if (userId && assistantId) {
      console.log(`[ChatInterface Log 9] PRE-LOGGING BLOCK REACHED. User ID: ${userId}, Assistant ID: ${assistantId}`);
      await logUserMessage(userId, assistantId); 
      setUserMessagesLast24h(prev => prev + 1); 
    } else if (assistantId) { // Guest user
      console.log('[ChatInterface Log 10] Guest message count update block.');
      const newCount = guestMessagesSent + 1;
      setGuestMessagesSent(newCount);
      try {
        sessionStorage.setItem(getGuestMessageCountKey(assistantId), newCount.toString());
      } catch (e) {
        console.warn("[ChatInterface] Could not access sessionStorage to set guest message count:", e);
      }
    } else {
      console.log('[ChatInterface Log 11] Neither logged-in user nor guest with assistantId. No logging/counting performed.');
    }

    const currentInput = userInput; 
    setUserInput(''); 
    setIsLoading(true);
    setError(null); 

    try {
      const historyForGemini = messages.concat(newUserMessage); 
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
      console.error("[ChatInterface] Error getting AI response or saving history:", err);
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
  }, [
    userInput, 
    messages, 
    assistantSystemPrompt, 
    userId, 
    assistantId, 
    guestMessagesSent, 
    userMessagesLast24h, 
    onAuthRequired, 
    isLoading, 
    isHistoryLoading,
    isUserMessageLimitLoading,
    setError, // Added setError to dependency array
    setIsUserMessageLimitReachedState // Added setIsUserMessageLimitReachedState
  ]);

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
  const isUserLimitEffectivelyReached = userId && (userMessagesLast24h >= MAX_USER_MESSAGES_24H || isUserMessageLimitReachedState) ;


  const isSendDisabled = isLoading || isHistoryLoading || isUserMessageLimitLoading || !userInput.trim() || isGuestLimitReached || isUserLimitEffectivelyReached;
  
  let placeholderText = "Type your message (Shift+Enter for new line)";
  if (isGuestLimitReached) {
    placeholderText = "Login to continue chatting...";
  } else if (isUserLimitEffectivelyReached) {
    placeholderText = "Daily message limit reached.";
  }


  return (
    <div className="flex flex-col h-full bg-neutral-800/70 rounded-lg">
      <div className="p-3 border-b border-neutral-700/50 flex justify-between items-center flex-shrink-0">
         <h3 className={`text-base sm:text-lg font-semibold ${accentColor.replace('bg-','text-')} truncate pr-2`}>Chat with {assistantName}</h3>
         {userId && assistantId && (
           <button
             onClick={handleResetConversation}
             disabled={isLoading || isHistoryLoading || isUserMessageLimitLoading}
             title="Reset conversation history"
             className={`p-1.5 rounded-md hover:bg-neutral-600 text-neutral-400 hover:text-neutral-100 transition-colors disabled:opacity-50 disabled:cursor-not-allowed`}
           >
             <ArrowPathIcon className="h-5 w-5" />
           </button>
         )}
      </div>

      <div className="flex-grow overflow-y-auto p-3 sm:p-4 space-y-3 sm:space-y-4 scrollbar-thin scrollbar-thumb-neutral-600 scrollbar-track-neutral-700/50">
        {(isHistoryLoading || isUserMessageLimitLoading) && messages.length === 0 && ( 
           <div className="flex justify-center items-center py-10">
             <Spinner />
             <p className="ml-3 text-sm text-neutral-400">Loading chat...</p>
           </div>
        )}
        
        {!isHistoryLoading && messages.map((msg) => ( 
          <div key={msg.id} className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}>
            <div
              className={`max-w-[85%] sm:max-w-[80%] px-3 py-2 sm:px-4 sm:py-2.5 rounded-lg shadow ${
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
              <Spinner />
              <span className="text-sm sm:text-base italic">AI is thinking...</span>
            </div>
          </div>
        )}

        {error && !isHistoryLoading && !isLoading && ( 
          <div className="flex justify-center">
            <div className={`max-w-[85%] px-3 py-2 sm:px-4 sm:py-2.5 rounded-lg shadow text-white text-center ${isUserLimitEffectivelyReached ? 'bg-amber-600' : 'bg-red-600'}`}>
              <p className="text-sm sm:text-base">{error}</p>
            </div>
          </div>
        )}
        <div ref={chatEndRef} />
      </div>
      <div className="p-3 sm:p-4 border-t border-neutral-700/50 flex-shrink-0 bg-neutral-800/50 rounded-b-lg">
        {(isGuestLimitReached || isUserLimitEffectivelyReached) && !error && (
            <p className="text-xs text-amber-400 text-center mb-2">
                {isGuestLimitReached ? "Message limit reached for guests. Please log in or register." : "Daily message limit reached. Please try again later."}
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
            placeholder={placeholderText}
            className="flex-grow p-2.5 sm:p-3 bg-neutral-700 text-neutral-100 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none resize-none scrollbar-thin scrollbar-thumb-neutral-600 scrollbar-track-neutral-700/50 text-sm sm:text-base placeholder-neutral-500"
            rows={1}
            style={{ minHeight: '46px', maxHeight: '150px' }} 
            disabled={isSendDisabled}
            aria-disabled={isSendDisabled}
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
