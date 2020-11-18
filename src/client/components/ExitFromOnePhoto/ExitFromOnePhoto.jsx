import React, { useState, useEffect } from 'react';
import { Actions } from '../';
import './styles.css';

export function ExitFromOnePhoto({
  setAppState,
}) {
  const [state, setState] = useState(stateInit);

  return (
    <div 
      className='ExitFromAlbum action' 
      onClick={onClick}      
    >
      <div className='title'>Вернуться к списку фото</div>  
    </div>
  );

  // -----------------------------------------------------------------------
  function onClick(e) {
    setAppState({
      action: Actions.Browse.name,
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

