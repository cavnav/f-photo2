import './styles.css';
import React from 'react';
import { channel } from '../../channel';
import { getExistsProps } from '../../functions';
import { useMutedReducer } from '../../mutedReducer';

export const ExitFromFolder = channel.addComp({
  name: 'ExitFromFolder',
  render,
  getAPI,
});

function render(
) {

  const [state] = useMutedReducer({
    initialState: stateInit,
    setCompDeps: this.bindSetCompDeps(),
  });

  if (state.folderName === undefined) return null;

  const titleUpd = `${state.title}${state.folderName}`;

  return (
    <div 
      className='ExitFromFolder' 
      onClick={state.onClick}      
    >
      <div className='title'>{titleUpd}</div>  
    </div>
  );
}

const stateInit = {
  title: 'Закрыть альбом ',
  folderName: undefined,
  onClick: () => {},
};

function getAPI({
  deps,
}) {
  return {
    forceUpdate: (props) => {   
      deps.setState(getExistsProps({
        obj: props,
        rp: {
          folderName: 1,
          title: 1,
          onClick: 1,
        },
      }));
    },
  };
}