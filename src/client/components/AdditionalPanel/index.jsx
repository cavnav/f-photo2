import React, { useState, useEffect } from 'react';
import { CompsAddPanel } from '../';
import { get as _get } from 'lodash';

import './styles.css';

export function AdditionalPanel(props) {
  const stateInit = {};
  const [state, setState] = useState(stateInit);

  const { appState, appState: {view} } = props;

  const customAdditionalActions = _get(appState, ['actions', view, 'additionalActions'], []);
  
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

    props.dispatch.setAppState({
      ...props.appState,
      additionalActionId: actionId,
    });
  };

}
