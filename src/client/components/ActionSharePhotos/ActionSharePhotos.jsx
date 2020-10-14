import React, { useState, useEffect, useReducer } from 'react';
import './styles.css';

export function ActionSharePhotos({
  getItems,

  tempReducer,
  $share,
}) {
  const [state, setState] = useReducer(tempReducer, stateInit);

  const onClick = React.useCallback(() => $share(getItems()), []);

  return (
    <div 
      className={className} 
      onClick={onClick}      
    >
      <div className="ActionSharePhotos">Послать</div>  
    </div>
  );

  // -----------------------------------------------------------------------

}

ActionSharePhotos.getReqProps = ({
  crop,
}) => {

  return crop({      
    channel: {
      API: {
        comps: {
          server: {
            $share: 1,
          },
          Share: {
            getItems: 1,
          },
        }
      },
    },
  });
};

const stateInit = {
  photos: [],
};