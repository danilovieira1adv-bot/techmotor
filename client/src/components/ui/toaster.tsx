import React from 'react';

export const Toaster = () => {
  return React.createElement('div', { 
    id: 'toaster',
    style: { 
      position: 'fixed', 
      top: '20px', 
      right: '20px', 
      zIndex: 9999 
    }
  });
};

export default Toaster;
