import React, { useState, useEffect } from 'react';
import { CompsAddPanel } from '../';
import { get as _get } from 'lodash';

import './styles.css';

export function AdditionalPanel(props) {
  const stateInit = {};
  const [state, setState] = useState(stateInit);

  const { appState, appState: {view} } = props;

  const additionalActions = _get(appState, ['actions', view, 'additionalActions']);
  
  if (!additionalActions) return null;

  return (
    <div 
      className=''       
    >{
      Object.entries(additionalActions)
        .filter(([action, actionProps]) => actionProps.isActive)
        .map(([action, actionProps]) => {
          const Target = CompsAddPanel[action] || CompsAddPanel.Default;
          return (
            <Target 
              {...props}
              additionalActions={additionalActions}
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
