import React, { useState, useEffect, useReducer } from 'react';
import './styles.css';

export function SaveChanges({
  title,
  className,

  tempReducer,
  onAction,
}) {
  const [state, setState] = useReducer(tempReducer(), stateInit);

  return (
    <div 
      className={className} 
      onClick={onAction}      
    >
      <div className='title'>{title}</div>  
    </div>
  );

  // -----------------------------------------------------------------------

}

SaveChanges.getReqProps = ({
  channel,
  parentProps,
}) => channel.crop({
    parentProps: { 
      title: 1,
      onAction: 1,
      className: 1,
    },
  },
  { parentProps, },
);

SaveChanges.getAPI = () => {
  return {
  }
};

const stateInit = {
};