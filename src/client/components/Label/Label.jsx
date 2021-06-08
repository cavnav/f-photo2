import './styles.css';
import React from 'react';
import { channel } from '../../Channel';
import { getExistsProps, useMyReducer } from '../../functions';

const LabelComp = channel.addComp({
  fn: Label,
  getAPI,
});

export function Label(
) {

  const [state] = useMyReducer({
    initialState: stateInit,
    setCompDeps: LabelComp.setCompDeps,
  });

  if (state.title === undefined) return null;

  return (
    <div 
      className={`${Label.name}`}
      onClick={state.onClick} 
    >
      <div className='title'>{state.title}</div>  
    </div>
  );
}

const stateInit = {
  title: '2021-01-02',
  onClick: () => {},
};

function getAPI({
}) {
  return {
    forceUpdate: (props) => {
      Label.deps.setState(getExistsProps({
        obj: props,
        rp: {
          title: 1,
          onClick: 1,
        },
      }));
    },
  };
}