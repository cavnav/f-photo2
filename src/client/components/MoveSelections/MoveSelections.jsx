import './styles.css';

import React from 'react';
import { channel } from '../../Channel';
import { getExistsProps, getOppositeWindowObj, isCatalogSelected, isSameWindowPaths, useMyReducer } from '../../functions';
import { eventNames } from '../../constants';


export const MoveSelections = channel.addComp({
  name: 'MoveSelections',
  render,
  getAPI,
});

function render(
) {
  const Comp = this;
  const [state] = useMyReducer({
    setCompDeps: Comp.bindSetCompDeps(),
  });

  React.useEffect(
    () => {      
      const onCheckSamePathsWrap = () => onCheckSamePaths({ Comp });
      document.addEventListener(eventNames.checkSameWindowPaths, onCheckSamePathsWrap);
      return () => document.removeEventListener(eventNames.checkSameWindowPaths, onCheckSamePathsWrap);
    },
    []
  );

  const oppositeWindowObj = getOppositeWindowObj();

  if (
    !oppositeWindowObj ||
    state.itemsCount === 0 ||
    (

      state.itemsCount > 0 &&
      oppositeWindowObj && 
      isCatalogSelected({
          windowName: oppositeWindowObj.name
        }) &&
      isSameWindowPaths()
    )
  ) return null;

  const title = `Переместить ${state.itemsCount}`;

  return (
    <div 
      className='MoveSelections' 
      onClick={state.onClick}      
    >
      <div className='title'>{title}</div>  
    </div>
  );

  // -----------------------------------------------------------------------
}

function getAPI({
  deps,
}) {
  return {
    forceUpdate: (stateUpd) => {
      deps.setState(getExistsProps({
        obj: stateUpd,
        rp: {
          itemsCount: 1,
          onClick: 1,
        },
      }));
    },
  };
}

const stateInit = {
  itemsCount: 0,
  onClick: () => {},
};

function onCheckSamePaths({
  Comp,
}) {
  Comp.getDeps().setState({});
}