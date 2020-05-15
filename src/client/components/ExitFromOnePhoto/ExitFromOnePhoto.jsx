import React, { useState, useEffect } from 'react';
import './styles.css';

export function ExitFromOnePhoto({
  setAppState,
  Views,
}) {
  const [state, setState] = useState(stateInit);
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
    setAppState({
      view: Views.Browse,
    })
  };

}

ExitFromOnePhoto.getReqProps = ({
  d: { setAppState },
  API: { Views },
}) => ({
  setAppState,
  Views,
});

const stateInit = {
  title: `Вернуться к списку фото`,
};

