import React, { useState, useEffect, useReducer } from 'react';

import './styles.css';
import { tempReducer } from '../../functions';

export function SaveChanges({
  apiSaveChanges,
}) {
  const [state, setState] = useReducer(tempReducer, stateInit);
  const { title } = state;

  return (
    <div 
      className='SaveChanges' 
      onClick={onClick}      
    >
      <div className='title'>{title}</div>  
    </div>
  );

  // -----------------------------------------------------------------------
  function onClick(e) {
    apiSaveChanges();
  };

}

SaveChanges.getReqProps = ({
  API: { server: { saveChanges: apiSaveChanges } },
}) => ({
  apiSaveChanges,
  
});

const stateInit = {
  title: `Сохранить изменения`,
};