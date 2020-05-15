import React, { useState, useEffect } from 'react';

import './styles.css';

export function ExitFromAlbum({
  browsePath,
  apiBackward,
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
    apiBackward();
  };

}

ExitFromAlbum.getReqProps = ({
  s: { browseState: { path: browsePath }},
  API: { server: { backward: apiBackward } },
}) => ({
  browsePath,
  apiBackward,
});

const stateInit = {
  title: 'Закрыть альбом',
};

