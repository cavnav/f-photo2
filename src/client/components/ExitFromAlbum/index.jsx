import React, { useState, useEffect } from 'react';

import './styles.css';

export function ExitFromAlbum(props) {
  const { dispatch } = props;
  const { title } = props.additionalActions;

  const stateInit = {};
  const [state, setState] = useState(stateInit);

  return (
    <div 
      className='' 
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
