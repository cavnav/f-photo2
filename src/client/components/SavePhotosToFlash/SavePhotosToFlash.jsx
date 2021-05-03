import React from 'react';
import { channel } from '../../Channel';
import { additionalActions } from '../../constants';
import { useMyReducer } from '../../functions';
import { Print } from '../Print/Print';
import './styles.css';

const SavePhotosToFlashComp = channel.addComp({
  fn: SavePhotosToFlash,
  getReqProps,
});
export function SavePhotosToFlash({
}) {
  const { 
    PrintAPI,
    title,
    className,
  } = SavePhotosToFlashComp.getReqProps();
  const [state, setState] = useMyReducer({
    initialState: stateInit,
  });

  const onClick = React.useCallback(() => PrintAPI.saveToFlash(), []);
  return (
    <div 
      className={className} 
      onClick={onClick}      
    >
      <div className='title'>{title}</div>  
    </div>
  );

  // -----------------------------------------------------------------------

}

function getReqProps({
  channel,
}) {
  return channel.crop({
      parentProps: { 
        title: 1,
        className: 1,
      },
      channel: {
        comps: {
          ...Print.API,
        },
      },
    },
    { parentProps: additionalActions.SavePhotosToFlash } // TODO. add props to use without parent.
  );
};

const stateInit = {
  photos: [],
};