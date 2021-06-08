import React from 'react';
import { channel } from '../../Channel';
import { Browse } from '../Browse/Browse';
import { OnePhoto } from '../OnePhoto/OnePhoto';

import './styles.css';

const strComponentAPI = 'ComponentAPI';

const RemoveSelectionsComp = channel.addComp({
  fn: RemoveSelections,
  getReqProps,
})

export function RemoveSelections(
  
) {
  const title = `Удалить`;

  const rp = RemoveSelectionsComp.getReqProps();
  const ComponentAPI = rp[strComponentAPI];
  
  return (
    <div 
      className='RemoveSelections' 
      onClick={onClick}      
    >
      <div className='title'>
        {title}
      </div>        
    </div>
  );

  // -----------------------------------------------------------------------
  function onClick() {
    ComponentAPI.removeSelections();
  };
}

function getReqProps({ 
  channel 
}) {
  const { action } = channel.crop({
    s: {
      action: 1, 
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
};