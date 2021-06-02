import './styles.css';
import React from 'react';
import { channel } from '../../Channel';
import { resumeObjConstants } from '../../resumeObj';
import { Browse } from '../Browse/Browse';
import { getFromResumeObj, setToResumeObj } from '../../functions';


const ExitFromAlbumComp = channel.addComp({
  fn: ExitFromAlbum,
  getReqProps,
});
export function ExitFromAlbum(
) {
  const {
    browsePath,
    BrowseAPI,
    server,
  } = ExitFromAlbumComp.getReqProps();

  const albumName = browsePath.slice(1);
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
    BrowseAPI.changeSelections();
    const rp = ExitFromAlbumComp.getReqProps();
    rp.BrowseAPI.setToResumeObj({
      stateUpd: {
        curPhotoInd: -1,
      },
    });
    server.backward()
    .then(rp.BrowseCompAPI.onNavigate);
  };
}

function getReqProps({ channel }) {  
  const croped = channel.crop(
    {    
      API: { 
        comps: {
          server: 1,        
        },
      },
      comps: {
        ...Browse.API,
      },      
    }
  );

  return {
    ...croped,
    get browsePath() {
      const { path = '' } = getFromResumeObj({
        selector: {
          [window.name]: {
            [resumeObjConstants.Browse]: {
              path: 1,
            },
          },
        }
      });
      return path;
    },
  };
}

const stateInit = {
};

