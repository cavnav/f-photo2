import React, { useState, useEffect, useReducer } from 'react';
import { AdditionalActionsComps } from '../';

import './styles.css';

export function AdditionalPanel({
  channel,
  tempReducer,
  activeComponentActions,
}) {
  const [state, setState] = useReducer(tempReducer, stateInit);
  const [ignored, forceUpdate] = useReducer(x => !x, false);

  AdditionalPanel.forceUpdate = forceUpdate;

  if (activeComponentActions.length === 0) return null;

  return (
    <div 
      className='AdditionalPanel'       
    >
      { getItems() }
    </div>
  );

  // ----------------

  function getItems() {
    return activeComponentActions
      .map(action => {
        const Action = action.isActive ? AdditionalActionsComps[action.componentName] : () => null;
      
        return (
          <Action 
            {...channel.essentials(Action, { parentProps: action })}
          />
        );
      });
  }
}

AdditionalPanel.forceUpdate = () => {};

AdditionalPanel.getReqProps = ({ channel }) => { 
  const {
    API: { _get }, 
    s: { 
      action,
      actions,
    },
  } = channel;
  
  return {
    activeComponentActions: _get(actions, [action, 'additionalActions'], []),
  };
}

AdditionalPanel.getAPI = () => {
  return {
    forceUpdate: AdditionalPanel.forceUpdate,
  };
};

const stateInit = {};