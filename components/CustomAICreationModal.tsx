
import React, { useState, useCallback, useEffect } from 'react';
import { XMarkIcon } from './icons/XMarkIcon';
import { SparklesIcon } from './icons/SparklesIcon';
import { NewAIAssistant } from '../types'; // Use NewAIAssistant

interface CustomAICreationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAddAssistant: (assistant: NewAIAssistant) => Promise<void>; // onAddAssistant is now async
}

const CustomAICreationModal: React.FC<CustomAICreationModalProps> = ({ isOpen, onClose, onAddAssistant }) => {
  const [agentName, setAgentName] = useState('');
  const [tagline, setTagline] = useState('');
  const [detailedDescription, setDetailedDescription] = useState('');
  const [systemPrompt, setSystemPrompt] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const resetForm = useCallback(() => { // Added useCallback
    setAgentName('');
    setTagline('');
    setDetailedDescription('');
    setSystemPrompt('');
    setErrorMessage(null);
  }, []);


  const handleSubmit = useCallback(async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    if (!agentName.trim() || !tagline.trim() || !systemPrompt.trim() || !detailedDescription.trim()) {
      setErrorMessage("All fields (Name, Tagline, Detailed Description, System Prompt) are required.");
      return;
    }
    setIsSubmitting(true);

    const normalizedName = agentName.trim().toLowerCase().replace(/\s+/g, '-');
    const newAssistantData: NewAIAssistant = {
      name: agentName.trim(),
      tagline: tagline.trim(),
      description: detailedDescription.trim(),
      category: 'Custom',
      price: 'N/A', 
      imageUrl: `https://picsum.photos/seed/${normalizedName || 'customai'}/600/400`,
      features: ['User-defined behavior via System Prompt', 'Customizable interactions'],
      systemPrompt: systemPrompt.trim(),
      accentColor: 'bg-purple-600', 
    };

    try {
      await onAddAssistant(newAssistantData);
      // resetForm(); // App.tsx handles closing, which triggers useEffect to reset form.
                     // Kept if direct reset before close is preferred.
    } catch (error) {
      setErrorMessage(error instanceof Error ? error.message : "Failed to create assistant. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  }, [agentName, tagline, detailedDescription, systemPrompt, onAddAssistant]);

  useEffect(() => {
    if (!isOpen) {
      resetForm();
      setIsSubmitting(false); 
    }
  }, [isOpen, resetForm]);


  if (!isOpen) return null;

  return (
    <div 
        className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center p-4 z-[100] transition-opacity duration-300 ease-in-out"
        style={{ opacity: isOpen ? 1 : 0 }}
        role="dialog"
        aria-modal="true"
        aria-labelledby="custom-ai-modal-title"
    >
      <div 
        className="bg-neutral-800 rounded-lg shadow-xl w-full max-w-2xl max-h-[90vh] flex flex-col overflow-hidden transform transition-all duration-300 ease-in-out"
        style={{ transform: isOpen ? 'scale(1)' : 'scale(0.95)', opacity: isOpen ? 1 : 0 }}
        onClick={(e) => e.stopPropagation()}
      >
        <header className="p-4 bg-primary-600 text-white flex justify-between items-center">
          <div className="flex items-center space-x-2">
            <SparklesIcon className="h-6 w-6" />
            <h2 id="custom-ai-modal-title" className="text-2xl font-bold">Create Your Custom AI Assistant</h2>
          </div>
          <button 
            onClick={onClose} 
            className="text-white hover:text-neutral-200"
            aria-label="Close custom AI creation modal"
            disabled={isSubmitting}
          >
            <XMarkIcon className="h-7 w-7" />
          </button>
        </header>

        <form onSubmit={handleSubmit} className="flex-grow overflow-y-auto p-6 space-y-4">
          <p className="text-neutral-300 text-sm mb-2">
            Define the properties of your new AI assistant. The "System Prompt" is key to how your AI will behave.
          </p>
          
          <div>
            <label htmlFor="agentName" className="block text-sm font-medium text-neutral-200 mb-1">AI Assistant Name <span className="text-red-500">*</span></label>
            <input
              type="text"
              id="agentName"
              name="agentName"
              value={agentName}
              onChange={(e) => setAgentName(e.target.value)}
              className="w-full p-2 bg-neutral-700 text-neutral-100 rounded-md focus:ring-2 focus:ring-primary-500 outline-none"
              placeholder="e.g., Story Weaver, Code Helper"
              required
              disabled={isSubmitting}
            />
          </div>

          <div>
            <label htmlFor="tagline" className="block text-sm font-medium text-neutral-200 mb-1">Short Description / Tagline <span className="text-red-500">*</span></label>
            <input
              type="text"
              id="tagline"
              name="tagline"
              value={tagline}
              onChange={(e) => setTagline(e.target.value)}
              className="w-full p-2 bg-neutral-700 text-neutral-100 rounded-md focus:ring-2 focus:ring-primary-500 outline-none"
              placeholder="e.g., Generates fantasy stories."
              required
              disabled={isSubmitting}
            />
          </div>

          <div>
            <label htmlFor="detailedDescription" className="block text-sm font-medium text-neutral-200 mb-1">Detailed Description <span className="text-red-500">*</span></label>
            <textarea
              id="detailedDescription"
              name="detailedDescription"
              value={detailedDescription}
              onChange={(e) => setDetailedDescription(e.target.value)}
              rows={3}
              className="w-full p-2 bg-neutral-700 text-neutral-100 rounded-md focus:ring-2 focus:ring-primary-500 outline-none"
              placeholder="Describe what this AI assistant does, its capabilities, and intended use cases."
              required
              disabled={isSubmitting}
            />
          </div>
          
          <div>
            <label htmlFor="systemPrompt" className="block text-sm font-medium text-neutral-200 mb-1">System Prompt <span className="text-red-500">*</span></label>
            <textarea
              id="systemPrompt"
              name="systemPrompt"
              value={systemPrompt}
              onChange={(e) => setSystemPrompt(e.target.value)}
              rows={6} 
              className="w-full p-2 bg-neutral-700 text-neutral-100 rounded-md focus:ring-2 focus:ring-primary-500 outline-none scrollbar-thin scrollbar-thumb-neutral-600 scrollbar-track-neutral-700"
              placeholder="e.g., You are a helpful assistant that writes short, engaging fantasy stories for children. Always be positive and creative."
              required
              disabled={isSubmitting}
            />
            <p className="text-xs text-neutral-400 mt-1">This prompt guides the AI's behavior. Be specific for best results.</p>
          </div>
          
          {errorMessage && (
            <p className="text-sm p-3 rounded-md bg-red-700/50 text-red-100 border border-red-600" role="alert">
              {errorMessage}
            </p>
          )}

          <div className="pt-4 flex justify-end space-x-3 border-t border-neutral-700 mt-4">
            <button
              type="button"
              onClick={onClose}
              disabled={isSubmitting}
              className="px-4 py-2 rounded-md text-neutral-300 bg-neutral-600 hover:bg-neutral-500 transition-colors disabled:opacity-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting || !agentName.trim() || !tagline.trim() || !systemPrompt.trim() || !detailedDescription.trim()}
              className="px-6 py-2 rounded-md font-semibold text-white bg-primary-600 hover:bg-primary-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
            >
              {isSubmitting ? (
                <>
                  <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Creating...
                </>
              ) : (
                'Create AI Assistant'
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CustomAICreationModal;
