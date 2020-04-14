import React, { useState, useEffect } from 'react';

import './styles.css';

export function ExitFromAlbum(props) {
  const { dispatch } = props;  
  const [state, setState] = useState(stateInit);

  const { title } = state;

  return (
    <div 
      className='ExitFromAlbum' 
      onClick={onClick}      
    >
      <div>{title}</div>  
    </div>
  );

  // -----------------------------------------------------------------------
  function onClick(e) {
    
    function navigateBackward() {
      serverApi({
        props: {
          url: 'backward'
        }
      })
      .then(res => res.json())
      .then((res) => {
        dispatch.setPhotos({
          photos: res
        });    
      });
    }
  };

}

const stateInit = {
  title: 'Закрыть альбом',
};