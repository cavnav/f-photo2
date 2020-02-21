import React, { useState, useEffect } from 'react';

import './styles.css';

export function ControlPanel(props) {
  const stateInit = {};
  const [state, setState] = useState(stateInit);

  return (
    <div className="ControlPanel flex" onClick={onClickAction}>
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
    props.dispatch.setAppState({
      ...props.appState,
      view: actionId, 
    });
  };

}
