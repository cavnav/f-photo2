import React, { useState, useEffect, useReducer } from 'react';

import './styles.css';
import { tempReducer } from '../../functions';

export function SaveChanges({
  onAction,
}) {
  const [state, setState] = useReducer(tempReducer, stateInit);
  const { title } = state;

  return (
    <div 
      className='SaveChanges' 
      onClick={onAction}      
    >
      <div className='title'>{title}</div>  
    </div>
  );

  // -----------------------------------------------------------------------

}

SaveChanges.getReqProps = ({
  API: { server: { saveChanges: apiSaveChanges } },
}) => ({
  onAction: action.api
});

const stateInit = {
  title: `Сохранить изменения`,
};