import './styles.css';

import React, { useEffect, useRef, } from 'react';
import { channel } from '../../channel';
import { useMutedReducer } from '../../mutedReducer';
import classnames from 'classnames';

export const Dialog = channel.addComp({
  name: 'Dialog',
  render,
  getAPI,
  getReqProps,
});

function render(props) {  
  const Comp = this;
  const ref = useRef();
  const timerIdRef = useRef();
  const [state] = useMutedReducer({
    setCompDeps: Comp.bindSetCompDeps(),
    initialState,
  });

  const rp = this.getReqProps();

  const onHover = (isHover) => {
    if (isHover) {
      ref.current?.classList.remove(`Dialog__hide`);
      clearTimeout(timerIdRef.current);
    } 
    else {
      ref.current?.classList.add(`Dialog__hide`);
      timerIdRef.current = setTimeout(() => {
        ref.current?.classList.add(`Dialog__none`);
      }, DELAY.ms); 
    }
    
    return () => clearTimeout(timerIdRef.current);
  };

  useEffect(() => {
    return onHover(false);
  });

  return (
    <div 
      ref={ref}
      key={new Date()}
      className={classnames({
        [`DialogWrap`]: true,
        [`Dialog__error`]: state.type === `error`,
        [`Dialog__warning`]: state.type === `warning`,
        [`Dialog__notify`]: state.type === `notify`,
      })} 
      style={{
        left: rp.mouse.x,
        top: rp.mouse.y,
        transition: `opacity ${DELAY.s}s`,
      }}
      onMouseEnter={() => onHover(true)}
      onMouseLeave={() => onHover(false)}    
    >
      {state.message}
      {state.render}
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

  function show(props) {
    deps.setState({
      ...initialState,
      ...props,
    });
  }
}

const initialState = {
  type: undefined,
  message: '',
  render: undefined,
  isHide: true,
};

const DELAY = {
  s: 5,
};
DELAY.ms = DELAY.s * 1000;
