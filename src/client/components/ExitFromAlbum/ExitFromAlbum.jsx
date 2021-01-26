import React from 'react';
import { channel } from '../../Channel';
import { Browse } from '../Browse/Browse';

import './styles.css';

const ExitFromAlbumComp = channel.addComp({
  fn: ExitFromAlbum,
  getReqProps,
});
export function ExitFromAlbum(
) {
  const {
    browseState,
    BrowseAPI,
    server,
  } = ExitFromAlbumComp.getReqProps();

  const [albumName] = browseState.path.split('/').slice(-1);
  if (!albumName) return null;

  const title = `Закрыть альбом ${albumName}`;

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
    BrowseAPI.clearSelections();
    server.backward();
  };
}

function getReqProps({ channel }) {
  return channel.crop({
    s: { 
      browseState: 1, 
    },
    API: { 
      comps: {
        server: 1,        
      },
    },
    comps: {
      [Browse.name]: {
        API: 'BrowseAPI',
      },
    }
  });
}

const stateInit = {
};

