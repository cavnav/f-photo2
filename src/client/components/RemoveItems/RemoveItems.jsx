import React from 'react';
import { channel } from '../../Channel';
import { Browse } from '../Browse/Browse';
import { OnePhoto } from '../OnePhoto/OnePhoto';

import './styles.css';

const strComponentAPI = 'ComponentAPI';

const RemoveItemsComp = channel.addComp({
  fn: RemoveItems,
  getReqProps,
})

export function RemoveItems({
}) {
  const title = `Удалить`;

  const [state] = React.useState({
    ...stateInit,
  });

  const {
    ComponentAPI,
  } = RemoveItemsComp.reqProps;

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

function getReqProps({ 
  channel 
}) {
  const { action } = channel.crop({
    s: {
      appState: {
        action: 1, 
      },
    },
  });

  const res = ({
    [OnePhoto.name]: channel.crop({      
      comps: {
        [OnePhoto.name]: {
          API: strComponentAPI,
        },
      },
    }),
    [Browse.name]: channel.crop({      
      comps: {
        [Browse.name]: {
          API: strComponentAPI,
        },
      }
    }),
  })[action];

  return res;
}

const stateInit = {
  albumName: '',
  target: undefined,
};