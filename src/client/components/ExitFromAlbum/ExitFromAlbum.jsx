import React, { useState, useEffect } from 'react';

import './styles.css';

export function ExitFromAlbum({
  browsePath,
  setServerBackward,
}) {
  const [state, setState] = useState({
    ...stateInit,
    title: `${stateInit.title} ${albumName}`,
  });

  const [albumName] = browsePath.slice(-1);
  if (!albumName) return null;

  const { title } = state;

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

ExitFromAlbum.getReqProps = function (channel) {
  return channel.crop({
    path: {
      s: { browseState: { path: 'browsePath' } },
      API: { server: { backward: 'setServerBackward' } },
    }
  });
}

const stateInit = {
  title: 'Закрыть альбом',
};

