import React, { useState, useEffect, useReducer } from 'react';
import './styles.css';

export function SavePhotosToFlash({
  title,
  className,

  tempReducer,
  PrintAPI,
}) {
  const [state, setState] = useReducer(tempReducer, stateInit);

  const onClick = React.useCallback(() => PrintAPI.saveToFlash(), []);
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
        API: {
          comps: {
            Print: 'PrintAPI',
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