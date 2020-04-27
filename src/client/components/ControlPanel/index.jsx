import React, { useState, useEffect } from 'react';

import './styles.css';

export function ControlPanel(props) {
  const { dispatch, states } = props;
  const { setAppState } = dispatch;
  const { appState } = states;
  const stateInit = {};
  const [state, setState] = useState(stateInit);

  const isWelcome = appState.view === 'Welcome';

  return (
    <div className={`controlPanel flex ${isWelcome ? 'attention' : ''}`} onClick={onClickAction}>
      {Object.entries(props.actions)
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
      view: actionId,
    });
  };

}
