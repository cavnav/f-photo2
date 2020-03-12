import React from 'react';

import './styles.css';

export function Help(props) {  
  const { appState } = props;

  if (appState.doNeedHelp === false) return null;

  return (
    <dialog className="Help fontSize20">
      { props.toRender }
  
      <div className="flexCenter">
        <input 
          className="attention"
          type="button"
          value="Ясно" 

          onClick={onClickGotIt}
        />
      </div>
    </dialog> 
  );

  // -------------------------------------------------------------------
  function onClickGotIt() {
    const appStateUpd = { 
      ...appState,
      doNeedHelp: false, 
    };
    props.dispatch.setAppState(appStateUpd);
  }
}
