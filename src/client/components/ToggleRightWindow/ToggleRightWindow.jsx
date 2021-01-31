import React, { useState, useEffect, useReducer } from 'react';
import { Browse } from '../Browse/Browse';
import './styles.css';

export function ToggleRightWindow({
  tempReducer,
  BrowseAPI,
}) {
  const [state, setState] = useReducer(tempReducer, stateInit);

  const onClick = React.useCallback(() => BrowseAPI.toggleRightWindow(), []);

  if (window.self !== window.top) return null;
  return (
    <div 
      className="ToggleRightWindow" 
      onClick={onClick}      
    >
      <div className='title'>Отобразить второе окно</div>  
    </div>
  );

  // -----------------------------------------------------------------------

}

ToggleRightWindow.getReqProps = ({
  channel,
}) => {

  return channel.crop({
    comps: {
      [Browse.name]: {
        API: 'BrowseAPI',
      },
    }
  });
};

const stateInit = {};