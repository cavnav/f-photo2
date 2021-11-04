import './styles.css';
import React from 'react';
import { channel } from '../../Channel';
import { useMutedReducer } from '../../mutedReducer';

export const Label = channel.addComp({
  name: 'Label',
  render,
  getAPI,
});

function render(props) {
  const Comp = this;
  const [state] = useMutedReducer({
    initialState: stateInit,
    props,
    setCompDeps: Comp.bindSetCompDeps(),
  });

  if (!state.title) return null;
console.log('label render', state.title)
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