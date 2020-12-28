import React from 'react';
import { tempReducer } from '../../functions';
import { RemoveItems, Default } from './';
import * as Types from './';

import './styles.css';

export function Dialog({ 
  type = Dialog.default,
  children, 
  onCancel = () => {},
}) {  

  const [state] = React.useReducer(tempReducer, initState);

  React.useEffect(() => {
      setTimeout(() => { 
        onCancel();         
      }, 1000);
    }, 
    []
  );

  const res = ({
    [Default.name]: (
      <Default>
        {children}
      </Default>
    ),
    [RemoveItems.name]: (
      <RemoveItems />
    ),
  })[type];

  return res;
}

Object.assign(
  Dialog,
  Object.keys(Types).reduce((res, type) => { res[type] = type; return res; }, {})
);

const initState = {
  isEnabled: false,
};