import './styles.css';
import React from 'react';
import { channel } from '../../Channel';
import { getExistsProps, useMyReducer } from '../../functions';

export const Notification = channel.addComp({
  name: 'Notification',
  render,
  getAPI,
});

function render(props) {
  const Comp = this;
  const [state, setState] = useMyReducer({
    initialState: stateInit,
    props,
    setCompDeps: Comp.bindSetCompDeps(),
  });

  React.useEffect(
    () => {
      setTimeout(
        () => {
          setState({
            title: '', 
          });
          state.onCancel();
        }, 
        state.timer,
      );
    }, 
    [state.title]
  );

  if (!state.title) return null;
  return (
    <div 
      className={`${Notification.name}`}
    >
      <div className='title'>{state.title}</div>  
    </div>
  );
}

const stateInit = {
  title: '',
  timer: 2000,
  onCancel: () => {},
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
          timer: 1,
          onCancel: 1,
        },
      }));
    },
  };
}