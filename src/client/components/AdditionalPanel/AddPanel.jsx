import React from 'react';
import { channel } from '../../Channel';
import { useMyReducer } from '../../functions';

import './styles.css';

const Comp = channel.addComp({
  fn: AdditionalPanel,
  getReqProps,
  getAPI,
});

export function AdditionalPanel(
) {
  useMyReducer({ 
    initialState: getInitialState(),
    setCompDeps: Comp.setCompDeps,
    fn: () => console.log('after dispatch'),
  });

  const rp = Comp.getReqProps();  
  if (rp.activeComponentActions.length === 0) return null;

  return (
    <div 
      className='AdditionalPanel'       
    >
    {
      rp.activeComponentActions
      .map((
        Action,
        ind,
      ) => {
        const Component = Action.comp({});
        return Component ? (
          <div key={`${Action.name}-${Action.compId ?? ind}`} className='btn'>
            { Component }
          </div>
        ) : null;
      })
    }
    </div>
  );

  // ----------------
}

function getReqProps({ channel }) { 
  const {
    s: { 
      action,
    },
  } = channel;
  
  return {
    activeComponentActions: (channel.comps[action]?.API?.getAdditionalActions?.() || [])
    .filter((action) => action.isEnabled),
  };
}

function getAPI() {
  return {
    forceUpdate: () => {
      Comp.deps.setState?.({});
    },
  };
};

function getInitialState() {
  return {};
};