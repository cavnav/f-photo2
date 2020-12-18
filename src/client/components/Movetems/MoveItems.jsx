import React from 'react';

import './styles.css';

export function MoveItems({
  browseState,
  BrowseAPI,
}) {
  const itemsCount = browseState.items.length;

  if (itemsCount === 0) return null;

  const title = `Переместить ${itemsCount}`;

  const [state, setState] = React.useState({
    ...stateInit,
  });
  return (
    <div 
      className='MoveItems' 
      onClick={onClick}      
    >
      <div className='title'>{title}</div>  
    </div>
  );

  // -----------------------------------------------------------------------
  function onClick(e) {
    BrowseAPI.copyItems();
  };
}

MoveItems.getReqProps = function ({ channel }) {
  return channel.crop({
    s: { 
      browseState: 1 
    },
    API: { 
      comps: {
        Browse: 'BrowseAPI',
      },
    }
  });
}

const stateInit = {
};

