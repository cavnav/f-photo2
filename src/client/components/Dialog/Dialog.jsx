import './styles.css';

import React from 'react';
import { channel } from '../../channel';
import { useMutedReducer } from '../../mutedReducer';


export const Dialog = channel.addComp({
  name: 'Dialog',
  render,
  getAPI,
  getReqProps,
});

function render(props) {  
  const Comp = this;
  const [state] = useMutedReducer({
    setCompDeps: Comp.bindSetCompDeps(),
    initialState: initState,
  });

  const rp = this.getReqProps();

  return (
    <div 
      className='DialogWrap' 
      style={{
        left: rp.mouse.x,
        top: rp.mouse.y,
      }}
    >
      {state.message}
      {props.children}
    </div>
  );
}

function getReqProps({
  channel,
}) {
  const props = channel.crop({
    s: {
      mouse: 1,
    },
  });

  return {
    mouse: {
      x: props.mouse.x + 10,
      y: props.mouse.y + 10,
    },
  };
}

function getAPI({
  deps,
}) {
  return {
    show,
  };

  function show({
    message,
  }) {
    const {
      setState,
    } = deps;
    setState({
      message,
    });
  }
}

const initState = {
  isEnabled: false,
};