import React from 'react';

export function RemoveItems({
  title = 'Удалить?',
}) {
  return (
    <dialog 
      className="Dialog fontSize20"
    >        
      <div 
        className="flexCenter"        
      >
        <div>{`${title} Нажми еще раз`}</div>      
      </div>
    </dialog> 
  )
}