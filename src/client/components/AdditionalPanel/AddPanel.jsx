import React from 'react';
import { AdditionalActionsComps } from '../';
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
       ) => <Action key={ind} />)
    }
    </div>
  );

  // ----------------
}

function getReqProps({ channel }) { 
  const {
    API: { _get }, 
    s: { 
      action,
      actions,
    },
  } = channel;
  
  return {
    activeComponentActions: _get(
      actions, 
      [action, 'additionalActions'], 
      channel.comps[action].API?.getAdditionalActions?.() || []
    ),
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