import React, { useState, useEffect } from 'react';

import './styles.css';

export function SelectAlbum(props) {
  const stateInit = {};
  const [state, setState] = useState(stateInit);

  const { appState, appState: {view} } = props;

  return (
    <div 
      className=''       
    >
      
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
