import React from 'react';
import { channel } from '../../Channel';
import { getExistsProps } from '../../functions';
import { useMutedReducer } from '../../mutedReducer';

import './styles.css';

export const AddAlbum = channel.addComp({
  name: 'AddAlbum',
  render,
  getAPI,
});

function render() {
  const Comp = this;
  const title = `Добавить альбом`;

  const [state, setState] = useMutedReducer({
    setCompDeps: Comp.bindSetCompDeps(),
    initialState: stateInit,
  });

  const onChangeAlbumName = React.useCallback(changeAlbumName, []);
  const onInputAlbumNameClick = React.useCallback((e) => e.stopPropagation(), []);

  return (
    <div 
      className='AddAlbum' 
      onClick={onClick}      
    >
      <div className='title'>
        {title}
        <div className='albumNameBox'>
          <input 
            className='albumName'
            type='text' 
            value={state.albumName}
            onClick={onInputAlbumNameClick}
            onChange={onChangeAlbumName}
          />
        </div>        
      </div>        
    </div>
  );

  // -----------------------------------------------------------------------
  function onClick() {
    state.onClick({
      albumName: state.albumName,
    });
    setState({
      albumName: '',
    });
  };

  function changeAlbumName(e) {
    const albumName = e.target.value;
    setState({
      albumName,
    });
  }
}

function getAPI({
  deps,
}) {
  return {
    forceUpdate: (props) => {
      deps.setState(props);
    },
  };
}

const stateInit = {
  albumName: '',
  target: undefined,
  onClick: () => {},
};

