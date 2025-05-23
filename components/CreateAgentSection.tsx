import React from 'react';
import { SparklesIcon } from './icons/SparklesIcon';

interface CreateAgentSectionProps {
  onStartBuilding: () => void;
}

const CreateAgentSection: React.FC<CreateAgentSectionProps> = ({ onStartBuilding }) => {
  return (
    <section 
      id="create" 
      className="py-16 sm:py-20 bg-neutral-800 rounded-xl my-16 sm:my-24 shadow-xl relative overflow-hidden"
    >
      {/* Removed gradient overlay div */}
      <div className="container mx-auto px-4 text-center relative z-10">
        <SparklesIcon className="h-16 w-16 sm:h-20 sm:w-20 text-primary-400 mx-auto mb-6" />
        <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold mb-6 text-neutral-100">
          Need Something More Specific?
        </h2>
        <p className="text-lg sm:text-xl text-neutral-200 max-w-3xl mx-auto mb-10">
          Our platform empowers you to build custom AI assistants and agents tailored precisely to your unique requirements.
          Unleash the full potential of AI for your business or personal projects.
        </p>
        <button
          onClick={onStartBuilding}
          className="bg-primary-600 hover:bg-primary-700 text-white font-semibold py-3.5 px-10 sm:py-4 sm:px-12 rounded-lg text-lg sm:text-xl shadow-md hover:shadow-lg transform hover:scale-105 transition-all duration-300"
          // Removed animation style and pulse class
          aria-label="Start building your custom AI agent"
          title="Start building your custom AI"
        >
          Start Building Your AI
        </button>
      </div>
    </section>
  );
};

export default CreateAgentSection;