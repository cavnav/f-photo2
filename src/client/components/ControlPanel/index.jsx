import React, { useReducer, } from 'react';

import './styles.css';
import { Views } from '..';

export function ControlPanel({
  tempReducer,
  actions,
  isWelcome,
  setAppState,
}) {
  const [state, setState] = useReducer(tempReducer, stateInit);

  return (
    <div 
      className={`controlPanel flex ${isWelcome ? 'attention' : ''}`} 
      onClick={onClickAction}
    >
      {Object.entries(actions)
        .filter(([action, actionProps]) => actionProps.isActive)
        .map(([action, actionProps]) => (
          <div key={action} className="action" data-id={action}>
            {actionProps.title}
          </div>
        ))}
    </div>
  );

  // -----------------------------------------------------------------------
  function onClickAction(e) {
    const actionId = e.target.getAttribute('data-id');

    setAppState({
      view: Views[actionId],
    });
  };

}

ControlPanel.getReqProps = ({ 
  s: { appState: { actions, view } }
}) => ({
  isWelcome: view === Views.Welcome,
  actions,
  setAppState,
});

const stateInit = {};
