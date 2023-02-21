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
  const [state, setState] = useMutedReducer({
    setCompDeps: Comp.bindSetCompDeps(),
    initialState,
  });

  const rp = this.getReqProps();
  
  const onHover = (isHover) => {
    if (state.isOpen === false || !ref.current || state.isHide === false) return;
    if (isHover) {
      setState({
        isFadeout: false,
      });
      clearTimeout(timerIdRef.current);
    } 
    else {
      setState({
        isFadeout: true,
      });
      timerIdRef.current = setTimeout(() => {
        setState({
          isOpen: false,
        });
      }, DELAY.ms); 
    }
    
    return () => clearTimeout(timerIdRef.current);
  };

  useEffect(() => {
    return onHover(false);
  }, [state.type, state.render, state.message]);


  return state.isOpen === false ? null : (
    <div 
      ref={ref}
      className={classnames({
        [`DialogWrap`]: true,
        [`Dialog__hide`]: state.isFadeout,
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
      {state.message && <div>{state.message}</div>}
      {state.render && state.render}
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
    close,
  };

  function close() {
    deps.setState({
      isOpen: false,
    });
  }

  function show(props) {
    deps.setState({
      ...initialState,
      isOpen: true,
      ...props,
    });
  }
}

const initialState = {
  type: undefined,
  message: '',
  render: undefined,
  isHide: true, // признак - исчезает ли спустя время
  isOpen: false,
  isFadeout: false,
};

const DELAY = {
  s: 15,
};
DELAY.ms = DELAY.s * 1000;
