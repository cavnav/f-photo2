import React, { useState, useEffect, useReducer } from 'react';
import { additionalActions } from '../../constants';
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
      onClick={onActionAPI({ photos: printState })}      
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
    onActionAPI: additionalActions.SavePhotosToFlash.onAction.API,
  };
}

const stateInit = {
  photos: [],
};