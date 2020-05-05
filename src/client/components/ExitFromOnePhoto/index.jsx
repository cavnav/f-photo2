import React, { useState, useEffect } from 'react';
import { Views } from './';
import './styles.css';

export function ExitFromOnePhoto(props) {
  const { dispatch, states } = props;  
  const [state, setState] = useState(stateInit);

  const { appServerAPI } = dispatch;
  const { browseState } = states;

  const [albumName] = browseState.path.slice(-1);
  const title = `Вернуть фото`;

  if (!albumName) return null;

  return (
    <div 
      className='ExitFromAlbum' 
      onClick={onClick}      
    >
      <div className='title'>{title}</div>  
    </div>
  );

  // -----------------------------------------------------------------------
  function onClick(e) {
    setAppState({
      view: Views.Browse,
    })
  };

}

const stateInit = {
};