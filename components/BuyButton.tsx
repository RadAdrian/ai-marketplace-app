
import React from 'react';

interface BuyButtonProps {
  onClick: () => void;
  accentColor: string;
}

const BuyButton: React.FC<BuyButtonProps> = ({ onClick, accentColor }) => {
  return (
    <button
      onClick={onClick}
      className={`px-6 py-3 rounded-lg font-semibold text-white ${accentColor} hover:opacity-90 transition-opacity shadow-md hover:shadow-lg transform hover:scale-105`}
    >
      Buy Now
    </button>
  );
};

export default BuyButton;
    