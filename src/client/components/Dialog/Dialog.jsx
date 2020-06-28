import React from 'react';

import './styles.css';

export function Dialog({ 
  children, 
  isEnabled = false,
  onCancel,
}) {  

  React.useEffect(() => {
      setTimeout(() => { if (isEnabled) onCancel(); }, 1000);
      return;
    }, 
    [isEnabled]
  );

  return isEnabled === false ? null : (
    <dialog 
      className="Dialog fontSize20"
    >        
      <div 
        className="flexCenter"        
      >
        { children }
      </div>
    </dialog> 
  );

  // -------------------------------------------------------------------
}

Dialog.getReqProps = ({ 
  parentProps: {
    isEnabled,
  }
}) => {
  return {
    isEnabled,
  };
}
const InitState = {
};