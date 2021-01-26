import React from 'react';
import { Actions } from '../';
import { channel } from '../../Channel';
import './styles.css';

const ExitFromOnePhotoComp = channel.addComp({
  fn: ExitFromOnePhoto,
  getReqProps,
});
export function ExitFromOnePhoto(
) {
  const {
    setAppState,
  } = ExitFromOnePhotoComp.getReqProps();

  return (
    <div 
      className='ExitFromAlbum action' 
      onClick={onClick}      
    >
      <div className='title'>Вернуться в альбом</div>  
    </div>
  );

  // -----------------------------------------------------------------------
  function onClick(e) {
    setAppState({
      action: Actions.Browse.name,
    })
  };
}

function getReqProps({ channel }) {
  return channel.crop({
    d: { setAppState: 1 },
  });
};

const stateInit = {
  
};

