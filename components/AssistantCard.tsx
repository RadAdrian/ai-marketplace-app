import React from 'react';
import { AIAssistant } from '../types';

interface AssistantCardProps {
  assistant: AIAssistant;
  onSelect: (assistant: AIAssistant) => void;
  // isFeatured prop removed as the carousel concept is reverted
}

const AssistantCard: React.FC<AssistantCardProps> = ({ assistant, onSelect }) => {
  return (
    <div 
      className={`w-72 bg-neutral-800 rounded-xl shadow-lg overflow-hidden flex flex-col group transition-all duration-300 ease-in-out hover:shadow-md h-full`}
      // Removed animation styles
    >
      <img 
        src={assistant.imageUrl || 'https://picsum.photos/seed/default/600/400'} 
        alt={assistant.name} 
        className="w-full h-48 object-cover transition-transform duration-300 group-hover:scale-105" 
      />
      <div className="p-5 flex flex-col flex-grow">
        <h3 className={`text-xl font-bold mb-1.5 ${assistant.accentColor.replace('bg-','text-')}`}>{assistant.name}</h3>
        <p className="text-xs text-neutral-400 mb-2 uppercase tracking-wider">{assistant.category}</p>
        <p className="text-neutral-300 mb-4 text-sm flex-grow line-clamp-3 group-hover:line-clamp-none transition-all duration-200">{assistant.tagline}</p>
        <div className="mt-auto flex justify-between items-center pt-2">
          <span className={`text-lg font-semibold ${assistant.accentColor.replace('bg-','text-')}`}>{assistant.price}</span>
          <button
            onClick={() => onSelect(assistant)}
            className={`px-4 py-2 rounded-md text-sm font-medium text-white ${assistant.accentColor} hover:opacity-80 transition-opacity`}
          >
            View Details
          </button>
        </div>
      </div>
    </div>
  );
};

export default AssistantCard;