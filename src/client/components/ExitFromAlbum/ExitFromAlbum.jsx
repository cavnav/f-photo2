import React, { useState, useEffect } from 'react';

import './styles.css';

export function ExitFromAlbum({
  browsePath,
  setServerBackward,
}) {
  const [albumName] = browsePath.slice(-1);
  if (!albumName) return null;

  const title = `Закрыть альбом ${albumName}`;

  const [state, setState] = useState({
    ...stateInit,
  });

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
    setServerBackward();
  };

}

ExitFromAlbum.getReqProps = function ({ channel }) {
  return channel.crop({
    s: { browseState: { path: 'browsePath' } },
    API: { 
      comps: {
        server: { backward: 'setServerBackward' } },
      },
  });
}

const stateInit = {
};

