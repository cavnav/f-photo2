import React from 'react';
import { Browse } from '../Browse/Browse';
import { OnePhoto } from '../OnePhoto/OnePhoto';

import './styles.css';

export function RemoveItems({
  ComponentAPI,
}) {
  const title = `Удалить`;

  const [state] = React.useState({
    ...stateInit,
  });

  return (
    <div 
      className='RemoveItems' 
      onClick={onClick}      
    >
      <div className='title'>
        {title}
      </div>        
    </div>
  );

  // -----------------------------------------------------------------------
  function onClick() {
    ComponentAPI.removeItems();
  };
}

RemoveItems.getReqProps = function ({ channel }) {
  const { action: component } = channel.crop({
    s: {
      appState: {
        action: 1, 
      },
    },
  });

  const res = ({
    [OnePhoto.name]: channel.crop({      
      API: { 
        comps: {
          OnePhoto: 'ComponentAPI',
        },
      }
    }),
    [Browse.name]: channel.crop({      
      API: { 
        comps: {
          Browse: 'ComponentAPI',
        },
      }
    }),
  })[component];

  return res;
}

const stateInit = {
  albumName: '',
  target: undefined,
};

