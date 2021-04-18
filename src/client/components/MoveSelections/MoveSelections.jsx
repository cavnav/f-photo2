import './styles.css';

import React from 'react';
import { channel } from '../../Channel';
import { isSameWindowPaths, useMyReducer } from '../../functions';
import { ResumeObj } from '../../resumeObj';
import { Browse } from '../Browse/Browse';
import { eventNames } from '../../constants';

const resumeObj = new ResumeObj({
  compName: MoveSelections.name,
});

const MoveSelectionsComp = channel.addComp({
  fn: MoveSelections,
  getReqProps,
  getAPI,
})
export function MoveSelections(
) {
  const {
    BrowseAPI,
  } = MoveSelectionsComp.getReqProps();

  const itemsCount = BrowseAPI.getCountSelections();  

  useMyReducer({
    comp: {
      setDeps: MoveSelectionsComp.setDeps,
    },
  });

  React.useEffect(
    () => {      
      document.addEventListener(eventNames.checkSameWindowPaths, onCheckSameWindowPaths);
      return () => document.removeEventListener(eventNames.checkSameWindowPaths, onCheckSameWindowPaths);
    },
    []
  );

  if (itemsCount === 0 ||
    isSameWindowPaths()
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
    BrowseAPI.moveSelections();
  };
}

function getReqProps({ channel }) {
  return channel.crop({
    s: { 
      browseState: 1 
    },
    comps: {
      [Browse.name]: {
        API: 'BrowseAPI',
      },
    }
  });
}

function getAPI({

}) {
  return {
    forceUpdate,
  };

  function forceUpdate() {
    const {
      setState,
    } = MoveSelectionsComp.deps;
    setState({
    });
  }
}

const stateInit = {
};

function onCheckSameWindowPaths() {
  MoveSelectionsComp.deps.setState({});
}