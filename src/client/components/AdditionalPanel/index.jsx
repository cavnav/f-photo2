import React, { useState, useEffect } from 'react';
import { CompsAddPanel } from '../';
import { get as _get } from 'lodash';

import './styles.css';

export function AdditionalPanel(props) {
  const { dispatch, states } = props; 
  const { setAppState } = dispatch;
  const { appState } = states;
  const stateInit = {};
  const [state, setState] = useState(stateInit);

  const customAdditionalActions = _get(appState, ['actions', appState.view, 'additionalActions'], []);
  
  if (customAdditionalActions.length === 0) return null;

  const { additionalActions } = appState;

  return (
    <div 
      className='AdditionalPanel'       
    >{
      customAdditionalActions
        .map(actionName => {
          const action = additionalActions[actionName];
          const Target = action.isActive ? CompsAddPanel[actionName] : CompsAddPanel.Default;
          return (
            <Target 
              {...props}
            />
          );
        })
    }
    </div>
  );

  // -----------------------------------------------------------------------
  function onClickAction(e) {
    const actionId = e.target.getAttribute('data-id');

    setAppState({
      additionalActionId: actionId,
    });
  };

}
