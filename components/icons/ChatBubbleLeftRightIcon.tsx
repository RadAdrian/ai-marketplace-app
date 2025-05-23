
import React from 'react';

interface SVGProps extends React.SVGProps<SVGSVGElement> {}

export const ChatBubbleLeftRightIcon: React.FC<SVGProps> = (props) => (
  <svg 
    xmlns="http://www.w3.org/2000/svg" 
    fill="none" 
    viewBox="0 0 24 24" 
    strokeWidth={1.5} 
    stroke="currentColor" 
    {...props}
  >
    <path strokeLinecap="round" strokeLinejoin="round" d="M20.25 8.511c.884.284 1.5 1.128 1.5 2.097v4.286c0 1.136-.847 2.1-1.98 2.193-.34.027-.68.052-1.02.072v3.091l-3.696-3.091c-.94.138-1.916.223-2.93.223h-3.125c-1.136 0-2.1-.847-2.193-1.98A18.75 18.75 0 013 14.086V9.8c0-1.136.847-2.1 1.98-2.193.34-.027.68-.052 1.02-.072V4.509l3.696 3.091c.94-.138 1.916-.223 2.93-.223h3.125c.297 0 .585.024.862.069L20.25 8.511zM12 10.875a2.625 2.625 0 110 5.25 2.625 2.625 0 010-5.25z" />
  </svg>
);
    