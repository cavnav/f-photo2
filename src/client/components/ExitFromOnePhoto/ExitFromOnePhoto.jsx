import React from 'react';
import { Actions } from '../';
import { channel } from '../../Channel';
import { Browse } from '../Browse/Browse';
import './styles.css';

const Comp = channel.addComp({
  fn: ExitFromOnePhoto,
  getReqProps,
});
export function ExitFromOnePhoto(
) {
  const {
    setAppState,
  } = Comp.getReqProps();

  return (
    <div 
      className='ExitFromFolder action' 
      onClick={onClick}      
    >
      <div className='title'>Вернуться в альбом</div>  
    </div>
  );

  // -----------------------------------------------------------------------
  function onClick(e) {
    setAppState({
      action: Actions.Browse.name,
    });
    const rp = Comp.getReqProps();
    rp.BrowseAPI.resetAction();
  };
}

function getReqProps({ channel }) {
  return channel.crop({
    d: { setAppState: 1 },
    comps: {
      ...Browse.API,
    }
  });
};

const stateInit = {
  
};

