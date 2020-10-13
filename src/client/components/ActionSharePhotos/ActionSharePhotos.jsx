import React, { useState, useEffect, useReducer } from 'react';
import './styles.css';

export function ActionSharePhotos({
  title,
  className,
  printState,

  tempReducer,
  saveToFlash,
}) {
  const [state, setState] = useReducer(tempReducer, stateInit);

  const onClick = React.useCallback(() => saveToFlash(), []);
  return (
    <div 
      className={className} 
      onClick={onClick}      
    >
      <div className='title'>{title}</div>  
    </div>
  );

  // -----------------------------------------------------------------------

}

ActionSharePhotos.getReqProps = ({
  channel,
  parentProps,
}) => {

  return channel.crop({
      parentProps: { 
        title: 1,
        className: 1,
      },
      channel: {
        s: {
          printState: 1,
        },
        API: {
          comps: {
            Print: {
              saveToFlash: 1,
            },
          }
        },
      },
    },
    { parentProps, }
  );
};

const stateInit = {
  photos: [],
};