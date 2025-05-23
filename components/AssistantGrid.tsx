import React from 'react';
import { AIAssistant } from '../types';
import AssistantCard from './AssistantCard';
import { SparklesIcon } from './icons/SparklesIcon';

interface AssistantGridProps {
  assistants: AIAssistant[];
  onSelectAssistant: (assistant: AIAssistant) => void;
}

const AssistantGrid: React.FC<AssistantGridProps> = ({ assistants, onSelectAssistant }) => {
  if (assistants.length === 0) {
    return (
      <section id="assistants" className="mb-16 py-10 text-center">
        <SparklesIcon className="h-16 w-16 text-primary-400 mx-auto mb-4" />
        <h2 className="text-3xl font-semibold mb-4">Explore AI Assistants</h2>
        <p className="text-neutral-300 text-lg">No AI assistants available at the moment.</p>
        <p className="text-neutral-400 mt-2">Why not be the first to create a custom one?</p>
      </section>
    );
  }

  return (
    <section id="assistants" className="mb-16">
      <h2 className="text-3xl sm:text-4xl font-bold text-center mb-10">AI Assistants</h2>
      <div className="flex flex-wrap justify-center gap-6 md:gap-8">
        {assistants.map((assistant) => (
          <div key={assistant.id}>
            <AssistantCard assistant={assistant} onSelect={onSelectAssistant} />
          </div>
        ))}
      </div>
    </section>
  );
};

export default AssistantGrid;