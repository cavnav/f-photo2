import React, { useState, useEffect } from 'react';
import { serverApi } from '../../serverApi';

export function Browse({ props }) {
  const stateInit = {
    photos: [],
    isPhotosGetted: false,
    thWidth: 100,
    thHeight: 100,
    curPhotoInd: -1,
    forReact: 0,
  };

  const [state, setState] = useState(stateInit);

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
    toRender = <img key={photo} ind={state.curPhotoInd} src={photo} />;
  }

  return (
    <div className="browse" onDoubleClick={onDblClickPhoto}>
      { toRender }
    </div>
  );


  function onDblClickPhoto(e) {
    setState({
      ...state,
      curPhotoInd: e.target.getAttribute('ind'),
    });
  }
}
