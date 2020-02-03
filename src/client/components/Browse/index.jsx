import React, { useState, useEffect } from 'react';
import { serverApi } from '../../serverApi';

export function Browse({ props }) {
  const stateInit = {
    photos: [],
    isPhotosGetted: false,
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

  return (
    <div className="browse">
      { state.photos.map((photo, ind) => <img key={photo} src={photo} />) }
    </div>
  );
}
