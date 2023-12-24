import React from 'react';

export function Default({
  children,
}) {
  return (
    <dialog 
      className="Dialog fontSize20"
    >        
      <div 
        className="flexCenter"        
      >
        {children}      
      </div>
    </dialog> 
  )
}