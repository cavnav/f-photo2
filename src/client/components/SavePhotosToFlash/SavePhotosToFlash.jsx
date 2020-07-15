import React, { useState, useEffect, useReducer } from 'react';
import './styles.css';

export function SavePhotosToFlash({
  title,
  className,
  printState,

  tempReducer,
  onActionAPI,
}) {
  const [state, setState] = useReducer(tempReducer, stateInit);

  return (
    <div 
      className={className} 
      onClick={onActionAPI({ photos: printState })}      
    >
      <div className='title'>{title}</div>  
    </div>
  );

  // -----------------------------------------------------------------------

}

SavePhotosToFlash.getReqProps = ({
  channel,
  parentProps,
}) => {

  const props = channel.crop({
      parentProps: { 
        title: 1,
        className: 1,
      },
      channel: {
        s: {
          printState: 1,
        },
        API: {
          server: {
            savePhotosToFlash: 1,
          },
        },
      },
    },
    { parentProps, }
  );
  
  return Object.assign(
    props, 
    {
      onActionAPI: ({ photos }) => props.savePhotosToFlash(
        { 
          photos,
        }
      )
      .then(res => onActionAPI(
        {

        }
      )),  
    },
  );
};

function onActionAPI({
  res,
}) {
  setState({
    action: onImgServerRotate,
  });
  additionalActions.SaveChanges.reset();
}

const stateInit = {
  photos: [],
};