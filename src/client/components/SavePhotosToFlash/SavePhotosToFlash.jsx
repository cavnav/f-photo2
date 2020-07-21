import React, { useState, useEffect, useReducer } from 'react';
import './styles.css';

export function SavePhotosToFlash({
  title,
  className,
  printState,

  tempReducer,
  onAction,
}) {
  const [state, setState] = useReducer(tempReducer, stateInit);

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

SavePhotosToFlash.getReqProps = ({
  channel,
  parentProps,
}) => {

  const props = channel.crop({
      parentProps: { 
        title: 1,
        className: 1,
      },
      channel: {
        s: {
          printState: 1,
        },
        API: {
          server: {
            savePhotosToFlash: 1,
          },
          Print: {
            saveToFlash: 1,
          },
        },
      },
    },
    { parentProps, }
  );

  return Object.assign(props, {
    onAction: props.Print.saveToFlash,
  });
};

const stateInit = {
  photos: [],
};