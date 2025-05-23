import React from 'react';
import { AIAssistant, User } from '../types'; 
import ChatInterface from './ChatInterface';
import BuyButton from './BuyButton';
import { XMarkIcon } from './icons/XMarkIcon';
// Removed CheckCircleIcon import

interface AssistantDetailModalProps {
  assistant: AIAssistant | null;
  isOpen: boolean;
  onClose: () => void;
  currentUser: User | null;
  onAuthRequired: (message: string) => void;
}

const AssistantDetailModal: React.FC<AssistantDetailModalProps> = ({ assistant, isOpen, onClose, currentUser, onAuthRequired }) => {
  if (!isOpen || !assistant) return null;

  const handleBuy = () => {
    alert(`Simulated purchase of ${assistant.name} successful!`);
    onClose();
  };

  return (
    <div 
      className="fixed inset-0 bg-black bg-opacity-70 backdrop-blur-sm flex items-center justify-center p-2 sm:p-4 z-[100] transition-opacity duration-300 ease-in-out"
      style={{ opacity: isOpen ? 1 : 0 }}
      onClick={onClose} 
    >
      <div 
        className="bg-neutral-800 rounded-xl shadow-2xl w-full max-w-4xl max-h-[90vh] flex flex-col overflow-hidden transform transition-all duration-300 ease-in-out border border-neutral-700"
        style={{ transform: isOpen ? 'scale(1)' : 'scale(0.95)', opacity: isOpen ? 1 : 0 }}
        onClick={(e) => e.stopPropagation()} 
      >
        <header className={`p-4 sm:p-5 ${assistant.accentColor} text-white flex justify-between items-center flex-shrink-0`}>
          <h2 className="text-xl sm:text-2xl font-bold truncate pr-2">{assistant.name}</h2>
          <button onClick={onClose} className="text-white p-1 rounded-full hover:bg-black/20 transition-colors">
            <XMarkIcon className="h-6 w-6 sm:h-7 sm:w-7" />
          </button>
        </header>

        <div className="flex-grow overflow-y-auto p-4 sm:p-6 scrollbar-thin scrollbar-thumb-neutral-700 scrollbar-track-neutral-800">
          <div className="flex flex-col md:grid md:grid-cols-2 md:gap-6 lg:gap-8 gap-5 h-full">
            
            <div className="space-y-4 md:order-1 flex-shrink-0">
              <img src={assistant.imageUrl || 'https://picsum.photos/seed/default/600/400'} alt={assistant.name} className="w-full h-52 sm:h-64 object-cover rounded-lg shadow-md" />
              <div>
                <h3 className="text-lg sm:text-xl font-semibold text-primary-400 mb-1.5">Description</h3>
                <p className="text-neutral-300 text-sm sm:text-base leading-relaxed">{assistant.description}</p>
              </div>
              <div>
                <h3 className="text-lg sm:text-xl font-semibold text-primary-400 mb-1.5">Category</h3>
                <p className="text-neutral-300 text-sm sm:text-base bg-neutral-700/50 inline-block px-3 py-1 rounded-full">{assistant.category}</p>
              </div>
              <div>
                <h3 className="text-lg sm:text-xl font-semibold text-primary-400 mb-2">Key Features</h3>
                <ul className="space-y-1.5 text-neutral-300 text-sm sm:text-base list-disc list-inside pl-1">
                  {assistant.features.map((feature, index) => (
                    <li key={index}>
                      {feature}
                    </li>
                  ))}
                </ul>
              </div>
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center pt-3 sm:pt-5 space-y-4 sm:space-y-0 border-t border-neutral-700/70 mt-5">
                <span className={`text-2xl sm:text-3xl font-bold ${assistant.accentColor.replace('bg-','text-')}`}>{assistant.price}</span>
                <BuyButton onClick={handleBuy} accentColor={assistant.accentColor} />
              </div>
            </div>

            <div className="bg-neutral-800/60 rounded-lg flex flex-col md:order-2 min-h-[380px] sm:min-h-[450px] md:min-h-[500px] flex-grow shadow-inner border border-neutral-700/50">
              <ChatInterface
                assistantSystemPrompt={assistant.systemPrompt}
                assistantName={assistant.name}
                accentColor={assistant.accentColor}
                userId={currentUser?.id} 
                assistantId={assistant.id}
                onAuthRequired={onAuthRequired}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AssistantDetailModal;