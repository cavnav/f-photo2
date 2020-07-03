import React, { useState, useEffect, useReducer } from 'react';
import './styles.css';

export function SavePhotosToFlash({
  title,
  className,

  tempReducer,
  onActionAPI,
}) {
  const [state, setState] = useReducer(tempReducer, stateInit);

  return (
    <div 
      className={className} 
      onClick={onActionAPI}      
    >
      <div className='title'>{title}</div>  
    </div>
  );

  // -----------------------------------------------------------------------

}

SavePhotosToFlash.getReqProps = ({
  channel,
  parentProps,
}) => channel.crop({
    parentProps: { 
      title: 1,
      onAction: { API: 'onActionAPI' },
      className: 1,
    },
  },
  { parentProps, },
);

const stateInit = {
};