import './styles.css';
import React from 'react';
import { channel } from '../../Channel';
import { getDefaultAPI, } from '../../functions';
import { useMutedReducer } from '../../mutedReducer';

export const Notification = channel.addComp({
  name: 'Notification',
  render,
  getAPI,
});

function render(props) {
  const Comp = this;
  const [state, setState] = useMutedReducer({
    initialState,
    props,
    setCompDeps: Comp.bindSetCompDeps(),
  });

  //if (!state.title) return null;
  return (
    <div
      className={`${Notification.name}`}
    >
      <div className='title'>{state.title}</div>
      {state.isConfirm && (
        <div>
          <input type='button' value='Да' onClick={() => {
            setState({
              isConfirm: false,
            });
            state.onConfirm();
          }} />
          <input type='button' value='Нет' onClick={() => {
            setState({
              isConfirm: false,
            });
            state.onCancel();
          }} />
          {/* <span className='closeEl' onClik={() => {
            setState({
              isConfirm: false,
            });
            state.onCancel();
          }}>X</span> */}
        </div>
      )}
    </div>
  );
}

const initialState = {
  title: '',
  isConfirm: false,
  timer: 2000,
  onConfirm: () => {},
  onCancel: () => {},
};

function getAPI(props) {
  return {
    ...getDefaultAPI(props),
  };
}