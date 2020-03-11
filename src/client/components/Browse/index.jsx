import React, { useState, useEffect, } from 'react';
import { serverApi } from '../../serverApi';
import { OnePhoto } from './components';

import './styles.css';

export function Browse(props) {
  const { appState, } = props;
  const [state, setState] = useState(stateInit);
  const [photos, setPhotos] = useState([]);

  useEffect(getPhotos, []);

  return getRender();

  // --------------------------------------------------------------------
  function getRender() {
    let render;

    if (appState.view === 'Help') {
      render = <Help />;
    }
    if (state.curPhotoInd > -1) {
      render = <OnePhoto 
        curPhotoInd={state.curPhotoInd}
        photos={photos}
        {...props}
      />;
    }
    if (state.curPhotoInd === -1) {
      render = <div 
        className='Browse' 
        onDoubleClick={onDblClickPhoto}
      >
        { getPhotosToRender() }
      </div>
    }

    return render;
  }

  function getPhotos() {
    serverApi({
      props: {
        url: 'browsePhotos'
      }
    })
    .then(res => res.json())
    .then((res) => {
      setPhotos(res.photos);
    });
  }

  function onDblClickPhoto(e) {
    
    setState({
      ...state,
      curPhotoInd: +e.target.getAttribute('ind'),
    });
  }

  function getPhotosToRender() {
    return photos.map((photo, ind) => {
      return (
        <div 
          key={photo}
          className='fitPreview100'
          style={{ 'backgroundImage': `url(${photo})` }}
          ind={ind} 
          src={photo}
        >
        </div>
      );
    });
  }  
}

const stateInit = {
  previewWidth: 100,
  previewHeight: 100,
  curPhotoInd: -1,
};
