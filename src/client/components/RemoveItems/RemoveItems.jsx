import React from 'react';

import './styles.css';

export function RemoveItems({
  browseState,
  BrowseAPI,
}) {
  const title = `Удалить`;

  const [state, setState] = React.useState({
    ...stateInit,
  });

  return (
    <div 
      className='RemoveItems' 
      onClick={onClick}      
    >
      <div className='title'>
        {title}
      </div>        
    </div>
  );

  // -----------------------------------------------------------------------
  function onClick() {
    BrowseAPI.removeItems({
    });
  };

  function changeAlbumName(e) {
    const albumName = e.target.value;
    setState({
      albumName,
    });
  }
}

RemoveItems.getReqProps = function ({ channel }) {
  return channel.crop({
    s: { 
      browseState: 1 
    },
    API: { 
      comps: {
        Browse: 'BrowseAPI',
      },
    }
  });
}

const stateInit = {
  albumName: '',
  target: undefined,
};

