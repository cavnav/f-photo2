import React, { useState, useEffect } from 'react';

import './styles.css';

export function ExitFromAlbum(props) {
  const { dispatch, states } = props;  
  const [state, setState] = useState(stateInit);

  const { appServerAPI } = dispatch;
  const { browseState } = states;

  console.log('path', browseState.path);
  const [albumName] = browseState.path.slice(-1);
  const title = `Закрыть альбом ${albumName}`;

  if (!albumName) return null;

  return (
    <div 
      className='ExitFromAlbum' 
      onClick={onClick}      
    >
      <div>{title}</div>  
    </div>
  );

  // -----------------------------------------------------------------------
  function onClick(e) {
    appServerAPI.backward();
  };

}

const stateInit = {
};