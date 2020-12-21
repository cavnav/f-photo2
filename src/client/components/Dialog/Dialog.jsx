import React from 'react';
import { tempReducer, useMyReducerWithPropsUpdated } from '../../functions';

import './styles.css';

export function Dialog({ 
  children, 
  onCancel = () => {},
}) {  

  const [state, setState] = React.useReducer(tempReducer, initState);

  React.useEffect(() => {
      setTimeout(() => { 
        onCancel();         
      }, 1000);
    }, 
    []
  );

  return (
    <dialog 
      className="Dialog fontSize20"
    >        
      <div 
        className="flexCenter"        
      >
        { children }
      </div>
    </dialog> 
  );

  // -------------------------------------------------------------------
}

Dialog.getReqProps = ({ 
  parentProps: {
    isEnabled,
  }
}) => {
  return {
    isEnabled,
  };
}
const initState = {
  isEnabled: false,
};