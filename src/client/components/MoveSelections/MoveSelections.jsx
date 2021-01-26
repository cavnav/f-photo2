import React from 'react';
import { channel } from '../../Channel';
import { Browse } from '../Browse/Browse';

import './styles.css';

const MoveSelectionsComp = channel.addComp({
  fn: MoveSelections,
  getReqProps,
})
export function MoveSelections(
) {
  const {
    browseState,
    BrowseAPI,
  } = MoveSelectionsComp.getReqProps();

  const itemsCount = browseState.items.length;

  if (itemsCount === 0) return null;

  const title = `Переместить ${itemsCount}`;

  return (
    <div 
      className='MoveSelections' 
      onClick={onClick}      
    >
      <div className='title'>{title}</div>  
    </div>
  );

  // -----------------------------------------------------------------------
  function onClick(e) {
    BrowseAPI.moveSelections();
  };
}

function getReqProps({ channel }) {
  return channel.crop({
    s: { 
      browseState: 1 
    },
    comps: {
      [Browse.name]: 'BrowseAPI',
    }
  });
}

const stateInit = {
};

