import './styles.css';
import React from 'react';
import { channel } from '../../channel';
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

  return !state.isEnabled ? null : (
    <div
      className={`${Notification.name}`}
    >
      <div className='title'>{state.title}</div>
      <div>
        <input type='button' value='Да' onClick={() => {
          setState({
            isEnabled: false,
          });
          state.onConfirm();
        }} />
        <input type='button' value='Нет' onClick={() => {
          setState({
            isEnabled: false,
          });
          state.onCancel();
        }} />          
      </div>
    </div>
  );
}

const initialState = {
  title: '',
  isEnabled: false,
  onConfirm: () => {},
  onCancel: () => {},
};

function getAPI(props) {
  return {
    ...getDefaultAPI(props),
  };
}
