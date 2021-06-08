import './styles.css';

import React from 'react';
import { tempReducer } from '../../functions';
import { RemoveItems, Default, Select } from './';
import * as Types from './';


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
      <Default>
        {children}
      </Default>
    ),
    [Select.name]: (
      <Select
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

  return res;
}

Object.assign(
  Dialog,
  Object.keys(Types).reduce((res, type) => { res[type] = type; return res; }, {})
);

const initState = {
  isEnabled: false,
};