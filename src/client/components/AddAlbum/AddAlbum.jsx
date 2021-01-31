import React from 'react';
import { Browse } from '../Browse/Browse';

import './styles.css';

export function AddAlbum({
  browseState,
  BrowseAPI,
}) {
  const title = `Добавить альбом`;

  const [state, setState] = React.useState({
    ...stateInit,
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
    BrowseAPI.addAlbum({
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

AddAlbum.getReqProps = function ({ channel }) {
  return channel.crop({
    s: { 
      browseState: 1 
    },
    comps: { 
      ...Browse.API,
    }
  });
}

const stateInit = {
  albumName: '',
  target: undefined,
};

