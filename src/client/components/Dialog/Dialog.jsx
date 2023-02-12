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
  const [state] = useMutedReducer({
    setCompDeps: Comp.bindSetCompDeps(),
    initialState: initState,
  });

  const rp = this.getReqProps();

  const Hide = () => {
    if (ref.current) {
      ref.current.classList.add(`Dialog__hide`);
    }
  };

  useEffect(() => {
    if (state.message) {
      setTimeout(Hide);
    }
  }, [state.message, Hide]);

  return (
    <div 
      ref={ref}
      key={Math.random()}
      className={classnames({
        [`DialogWrap`]: true,
        [`Dialog__error`]: state.type === `error`,
        [`Dialog__warning`]: state.type === `warning`,
        [`Dialog__notify`]: state.type === `notify`,
      })} 
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

  function show(props) {
    deps.setState(props);
  }
}

const initState = {
  type: undefined,
  isEnabled: false,
};