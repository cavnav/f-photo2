import './styles.css';

import React from 'react';
import { tempReducer } from '../../functions';
import { channel } from '../../channel';


export const Dialog = channel.addComp({
  name: 'Dialog',
  render,
  getReqProps,
});

function render(props) {  
  const [state] = React.useReducer(tempReducer, initState);

  const rp = this.getReqProps();
  return (
    <div 
      className='DialogWrap' 
      // style={{
      //   top: rp.mouse.y,
      // }}
    >
      {props.children}
    </div>
  );
}

const initState = {
  isEnabled: false,
};

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