import React from 'react';

export const emptyTitles = {
  empty: 'Пусто',
}; 

export function Empty({
  title = emptyTitles.empty,
  isTrue,
}) {  
  return isTrue === false ? null : (
    <div className='flexCenter height100pr width100pr'>{title}</div>
  );
}