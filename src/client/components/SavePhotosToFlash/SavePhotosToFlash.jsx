import React, { useState, useEffect, useReducer } from 'react';
import './styles.css';

export function SavePhotosToFlash({
  title,
  className,
  printState,

  tempReducer,
  savePhotosToFlash,
}) {
  const [state, setState] = useReducer(tempReducer, stateInit);

  return (
    <div 
      className={className} 
      onClick={savePhotosToFlash}      
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
            server: {
              savePhotosToFlash: 1,
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