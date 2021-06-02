import './styles.css';

import React from 'react';
import { channel } from '../../Channel';
import { getOppositeWindowObj, isCatalogSelected, isSameWindowPaths, useMyReducer } from '../../functions';
import { ResumeObj } from '../../resumeObj';
import { Browse } from '../Browse/Browse';
import { eventNames } from '../../constants';
import { OnePhoto } from '../OnePhoto/OnePhoto';


const MoveSelectionsComp = channel.addComp({
  fn: MoveSelections,
  getReqProps,
  getAPI,
})
export function MoveSelections(
) {
  const ComponentAPI = MoveSelectionsComp.getReqProps();

  const itemsCount = ComponentAPI.getCountSelections();  

  useMyReducer({
    setCompDeps: MoveSelectionsComp.setCompDeps,
  });

  React.useEffect(
    () => {      
      document.addEventListener(eventNames.checkSameWindowPaths, onCheckSameWindowPaths);
      return () => document.removeEventListener(eventNames.checkSameWindowPaths, onCheckSameWindowPaths);
    },
    []
  );

  const oppositeWindowObj = getOppositeWindowObj();

  if (
    !oppositeWindowObj ||
    itemsCount === 0 ||
    (

      itemsCount > 0 &&
      oppositeWindowObj && 
      isCatalogSelected({
          windowName: oppositeWindowObj.name
        }) &&
      isSameWindowPaths()
    )
  ) return null;

  const title = `Переместить ${itemsCount}`;

  return (
    <div 
      className='MoveSelections' 
      onClick={onClick}      
    >
      <div className='title'>{title}</div>  
    </div>
  );

  // -----------------------------------------------------------------------
  function onClick(e) {
    ComponentAPI.moveSelections();
  };
}

function getReqProps({ 
  channel 
}) {
  const { action } = channel.crop({
    s: {
      appState: {
        action: 1, 
      },
    },
  });

  const API = channel.crop({
    comps: {
      ...Browse.API,
      ...OnePhoto.API,
    }
  });

  return API[`${action}API`];
}

function getAPI({
}) {
  return {
    forceUpdate: () => MoveSelectionsComp.deps.setState({}),
  };
}

const stateInit = {
};

function onCheckSameWindowPaths() {
  MoveSelectionsComp.deps.setState({});
}