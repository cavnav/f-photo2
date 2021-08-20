import './styles.css';
import React from 'react';
import { channel } from '../../Channel';
import { getExistsProps, useMyReducer } from '../../functions';

const Comp = channel.addComp({
  fn: ExitFromFolder,
  getAPI,
});

export function ExitFromFolder(
) {

  const [state] = useMyReducer({
    initialState: stateInit,
    setCompDeps: Comp.setCompDeps,
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