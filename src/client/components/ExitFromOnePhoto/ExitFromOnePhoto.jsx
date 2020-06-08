import React, { useState, useEffect } from 'react';
import { Views } from '../';
import './styles.css';

export function ExitFromOnePhoto({
  setAppState,
  Views,
}) {
  const [state, setState] = useState(stateInit);

  return (
    <div 
      className='ExitFromAlbum' 
      onClick={onClick}      
    >
      <div className='title'>Вернуться к списку фото</div>  
    </div>
  );

  // -----------------------------------------------------------------------
  function onClick(e) {
    setAppState({
      view: Views.Browse,
    })
  };

}

ExitFromOnePhoto.getReqProps = ({ channel }) => {
  return channel.crop({
    d: { setAppState: 1 },
  });
};

const stateInit = {
  
};

