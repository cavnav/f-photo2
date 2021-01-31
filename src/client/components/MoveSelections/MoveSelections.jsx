import React from 'react';
import { channel } from '../../Channel';
import { useMyReducer } from '../../functions';
import { ResumeObj } from '../../resumeObj';
import { Browse } from '../Browse/Browse';
import { get as _get } from 'lodash';
import './styles.css';

export const eventNames = {
  checkSameWindowPaths: 'checkSameWindowPaths'
};

const resumeObj = new ResumeObj ({
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

function isSameWindowPaths() {
  const resumeState = resumeObj.state;
  const res = _get(resumeState.leftWindow, 'App.browseState.path', 1) === 
    _get(resumeState.rightWindow, 'App.browseState.path', 2)

  return res;
}

function onCheckSameWindowPaths() {
  MoveSelectionsComp.deps.setState({});
}