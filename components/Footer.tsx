
import React from 'react';

const Footer: React.FC = () => {
  return (
    <footer className="bg-neutral-800 text-neutral-400 py-8 text-center">
      <div className="container mx-auto px-4">
        <p>&copy; {new Date().getFullYear()} AI Assistant Marketplace. All rights reserved.</p>
        <p className="text-sm mt-1">Empowering innovation through artificial intelligence.</p>
      </div>
    </footer>
  );
};

export default Footer;
    