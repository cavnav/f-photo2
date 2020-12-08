import React, { useState, useEffect } from 'react';

import './styles.css';

export function ExitFromAlbum({
  browseState,
  server,
}) {
  const [albumName] = browseState.path.slice(-1);
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
    server.backward();
  };
}

ExitFromAlbum.getReqProps = function ({ channel }) {
  return channel.crop({
    s: { 
      browseState: 1 
    },
    API: { 
      comps: {
        server: 1,
      },
    }
  });
}

const stateInit = {
};

