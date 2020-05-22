import React, { useState, useEffect, useReducer } from 'react';
import { additionalActions } from '../../constants';
import './styles.css';

export function SaveChanges({
  tempReducer,
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
  API: { additionalActions: { onAction } },
}) => ({
  onAction,
});

SaveChanges.getAPI = () => {
  return {
    additionalActions,
  }
};

const stateInit = {
  title: `Сохранить изменения`,
};