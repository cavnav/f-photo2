import React from 'react';

export function Select({
  title,
  children,
  agreeTitle = 'Да',
  cancelTitle = 'Нет',
  onAgree,
  onCancel,
}) {
  return (
    <dialog 
      className="Dialog fontSize20 flexCenter flexDirColumn"
    >        
      <div className='title'>{title}</div>
      <div>
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