import React from 'react';
import { channel } from '../../channel';
import { useMutedReducer } from '../../mutedReducer';
import { AlbumName } from './components/albumName';

import './styles.css';

export const AddAlbum = channel.addComp({
  name: 'AddAlbum',
  render,
  getAPI,
  getComps,
});

function render() {
  const Comp = this;
  const title = `Добавить альбом`;

  const [state, setState] = useMutedReducer({
    setCompDeps: Comp.bindSetCompDeps(),
    initialState: stateInit,
  });

  return (
    <div 
      className='AddAlbum' 
      onClick={onClick}      
    >
      <div className='title'>{title}</div>
    </div>
  );

  // -----------------------------------------------------------------------
  function onClick() {
    const {
      DialogAPI,
    } = Comp.getComps();

    DialogAPI.show({
      render: <AlbumName onSubmit={state.onSubmit} />,
      isHide: false,
    });
  };
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

