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
      className="ActionSharePhotos action" 
      onClick={onClick}      
    >
      <div class="title">Послать</div>  
    </div>
  );

  // -----------------------------------------------------------------------

}

ActionSharePhotos.getReqProps = ({
  channel,
}) => {

  return channel.crop({      
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