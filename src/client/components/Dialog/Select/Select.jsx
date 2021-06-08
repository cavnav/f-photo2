import React from 'react';

export function Select({
  children,
  agreeTitle = 'Да',
  cancelTitle = 'Нет',
  onAgree,
  onCancel,
}) {
  return (
    <dialog 
      className="Dialog fontSize20"
    >        
      <div 
        className="flexCenter"        
      >
        {children} 
        <input 
            type='button' 
            value={agreeTitle} 
            onClick={onAgree}
        />   
        <input 
            type='button' 
            value={cancelTitle} 
            onClick={onCancel}
        />   
      </div>
    </dialog> 
  )
}