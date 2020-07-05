import React, { useState, useEffect, useReducer } from 'react';
import './styles.css';

export function SavePhotosToFlash({
  title,
  className,
  printState,

  tempReducer,
  onActionAPI,
}) {
  const [state, setState] = useReducer(tempReducer, stateInit);

  return (
    <div 
      className={className} 
      onClick={() => onActionAPI({ photos: printState })}      
    >
      <div className='title'>{title}</div>  
    </div>
  );

  // -----------------------------------------------------------------------

}

SavePhotosToFlash.getReqProps = ({
  channel,
  parentProps,
}) => {
  return {
    ...channel.crop({
        parentProps: { 
          title: 1,
          onAction: { 
            API: 'onActionAPI' 
          },
          className: 1,
        },
        channel: {
          s: {
            printState: 1,
          },
        },
      },
      { parentProps, }
    ),
    additionalActions.SavePhotosToFlash
}

const stateInit = {
  photos: [],
};