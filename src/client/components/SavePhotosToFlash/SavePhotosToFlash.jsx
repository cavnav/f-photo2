import React, { useState, useEffect, useReducer } from 'react';
import './styles.css';

export function SavePhotosToFlash({
  title,
  className,
  printState,

  tempReducer,
  compsAPI,
}) {
  const [state, setState] = useReducer(tempReducer, stateInit);

  const { saveToFlash } = compsAPI.Print;

  return (
    <div 
      className={className} 
      onClick={saveToFlash}      
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
          comps: 1,
        },
      },
    },
    { parentProps, }
  );

  return Object.assign(props, {
    compsAPI: props.comps,
  });
};

const stateInit = {
  photos: [],
};