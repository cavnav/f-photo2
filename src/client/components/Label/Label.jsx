import './styles.css';
import React from 'react';
import { channel } from '../../Channel';
import { getExistsProps, useMyReducer } from '../../functions';

export const Label = channel.addComp({
  name: 'Label',
  render,
  getAPI,
});

function render(
) {
  const Comp = this;
  const [state] = useMyReducer({
    initialState: stateInit,
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
      deps.setState?.(getExistsProps({
        obj: props,
        rp: {
          title: 1,
          onClick: 1,
        },
      }));
    },
  };
}