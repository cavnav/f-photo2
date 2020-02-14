import React, { useState, useEffect } from 'react';
import { serverApi } from '../../serverApi';

import './styles.css';

export function Browse({ props }) {
  const stateInit = {
    photos: [],
    isPhotosGetted: false,
    thWidth: 100,
    thHeight: 100,
    curPhotoInd: -1,
    curPhotoRotateDeg: 0,
    forReact: 0,
  };

  const [state, setState] = useState(stateInit);

  useEffect(() => {
    document.addEventListener('keydown', onKeyDown);

    return () => {
      document.removeEventListener('keydown', onKeyDown);
    };
  });

  !state.isPhotosGetted && serverApi({
    props: {
      url: 'browsePhotos'
    }
  })
    .then(res => res.json())
    .then((res) => {
      setState({
        ...state,
        photos: res.photos,
        isPhotosGetted: true,
      });
    });

  let toRender = null;
  if (state.curPhotoInd === -1) {
    toRender = state.photos.map((photo, ind) => <img key={photo} ind={ind} src={photo} width={state.thWidth} height={state.thHeight} />);
  }
  if (state.curPhotoInd !== -1) {
    const photo = state.photos[state.curPhotoInd];
    toRender = <img key={photo} className="fitScreen" style={{transform: `rotate(${state.curPhotoRotateDeg}deg)`}} ind={state.curPhotoInd} src={photo} />;
  }

  return (
    <div className="browse" onDoubleClick={onDblClickPhoto}>
      { toRender }
    </div>
  );

  // --------------------------------------------------------------------
  function onDblClickPhoto(e) {
    setState({
      ...state,
      curPhotoInd: +e.target.getAttribute('ind'),
    });
  }

  function onKeyDown(e) {
    switch (e.which) {
      case 37: getPhoto({ curPhotoInd: state.curPhotoInd - 1 }); break; // prev
      case 39: getPhoto({ curPhotoInd: state.curPhotoInd + 1 }); break; // next
      case 38: getPhoto({ curPhotoRotateDeg: state.curPhotoRotateDeg + 90 }); break; // rotate right
      case 40: getPhoto({ curPhotoRotateDeg: state.curPhotoRotateDeg - 90 }); break; // rotate left
    }
  }

  function getPhoto({ 
    curPhotoInd = state.curPhotoInd, 
    curPhotoRotateDeg = state.curPhotoRotateDeg,
  }) {
    setState({
      ...state,
      curPhotoInd,
      curPhotoRotateDeg,
    });
  }
}
