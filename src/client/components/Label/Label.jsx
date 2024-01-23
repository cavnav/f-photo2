import './styles.css';
import React from 'react';
import { channel } from '../../channel';
import { useMutedReducer } from '../../mutedReducer';

export const Label = channel.addComp({
  name: 'Label',
  render,
  getAPI,
});

function render(props) {
  const Comp = this;
  const {state} = useMutedReducer({
    initialState: stateInit,
    props,
    setCompDeps: Comp.setCompDeps,
  });

  if (!state.title) return null;
  
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
  title: '',
  onClick: () => {},
};

function getAPI({
  deps,
}) {
  return {
    forceUpdate: (props) => {
      deps.setState?.(props);
    },
  };
}