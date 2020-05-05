import React from 'react';

import './styles.css';

export function Help(props) {  
  const { doNeedHelp, dispatch } = props;

  if (doNeedHelp === false) return null;

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
    dispatch.setAppState({ doNeedHelp: false });
  }
}
