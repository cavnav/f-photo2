import './styles.css';

import React from 'react';
import { tempReducer } from '../../functions';
import { RemoveItems, Default, Select } from './';
import * as Types from './';
import { channel } from '../../Channel';


const Comp = channel.addComp({
  fn: Dialog,
  getReqProps,
});

export function Dialog({ 
  title,
  type = Dialog.Default,
  autoClose = true,
  children, 
  onAgree = () => {},
  onCancel = () => {},
}) {  

  const [state] = React.useReducer(tempReducer, initState);

  React.useEffect(() => {
      setTimeout(() => { 
        autoClose && onCancel();         
      }, 2000);
    }, 
    []
  );

  const res = ({
    [Default.name]: (
      <Default
      >
        {children}
      </Default>
    ),
    [Select.name]: (
      <Select
        title={title}
        onAgree={onAgree}
        onCancel={onCancel}
      >
        {children}
      </Select>
    ),
    [RemoveItems.name]: (
      <RemoveItems title={title} />
    ),
  })[type];

  const rp = Comp.getReqProps();
  return (
    <div 
      className='DialogWrap' 
      style={{
        left: rp.mouse.x,
        top: rp.mouse.y,
      }}
    >
      {res}
    </div>
  );
}

Object.assign(
  Dialog,
  Object.keys(Types).reduce((res, type) => { res[type] = type; return res; }, {})
);

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