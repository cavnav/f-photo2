import React from 'react';
import { channel } from '../../channel';
import { useMutedReducer } from '../../mutedReducer';
import { ChangeName } from './components/ChangeName';

import './styles.css';

export const AddAlbum = channel.addComp({
  name: 'AddAlbum',
  render,
  getAPI,
  getComps,
});

function render() {
  const Comp = this;

  const [state] = useMutedReducer({
    setCompDeps: Comp.bindSetCompDeps(),
    initialState: stateInit,
  });

  function onClick() {
    const {
      DialogAPI,
    } = Comp.getComps();

    DialogAPI.show({
      render: <ChangeName onSubmit={state.onSubmit} onClose={DialogAPI.close} />,
      isHide: false,
    });
  };

  return (
    <div 
      className='AddAlbum' 
      onClick={onClick}      
    >
      <div className='title'>Добавить альбом</div>
    </div>
  );  
}

function getAPI({
  deps,
}) {
  return {
    forceUpdate: (props) => {
      deps.setState(props);
    },
    onSubmit(callback) {
      if (callback) {
        deps.setState({
          onSubmit: callback,
        });
      }
    },
  };
}

function getComps({
  channelComps,
}) {
  return {
    items: {
      Dialog: channelComps.Dialog,
    },
  };
}

const stateInit = {
  onClick: undefined,
  onSubmit: undefined,
};

