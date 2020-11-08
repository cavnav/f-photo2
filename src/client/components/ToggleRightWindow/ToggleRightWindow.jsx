import React, { useState, useEffect, useReducer } from 'react';
import './styles.css';

export function ToggleRightWindows({
  tempReducer,
  BrowseAPI,
}) {
  const [state, setState] = useReducer(tempReducer, stateInit);

  const onClick = React.useCallback(() => PrintAPI.saveToFlash(), []);
  return (
    <div 
      className="ToggleRightWindow" 
      onClick={onClick}      
    >
      <div className='title'>{Отобразить второе окно}</div>  
    </div>
  );

  // -----------------------------------------------------------------------

}

SavePhotosToFlash.getReqProps = ({
  channel,
}) => {

  return channel.crop({
    API: {
      comps: {
        Browse: 'BrowseAPI',
      }
    },
  });
};

const stateInit = {};