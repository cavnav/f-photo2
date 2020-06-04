import React, { useState, useEffect, useReducer } from 'react';

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
    >{
      activeComponentActions
        .map(action => {
          const Target = action.isActive ? action.component : () => null;
          return (
            <Target 
              {...channel.essentials(Target)}
            />
          );
        })
    }
    </div>
  );
}

AdditionalPanel.forceUpdate = () => {};

AdditionalPanel.getReqProps = (channel) => { 
  const {
    API: { _get }, 
    s: { appState }
  } = channel;
  
  return {
    activeComponentActions: _get(appState, ['actions', appState.view.name, 'additionalActions'], []),
  };
}

AdditionalPanel.getAPI = () => {
  return {
    forceUpdate: AdditionalPanel.forceUpdate,
  };
};

const stateInit = {};