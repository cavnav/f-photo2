import React, { useState, useEffect } from 'react';
import { Views } from '..';
import './styles.css';

export function ExitFromOnePhoto(props) {
  const { dispatch, states } = props;  
  const [state, setState] = useState(stateInit);

  const { appServerAPI, setAppState } = dispatch;

  const title = `Вернуться к списку фото`;

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