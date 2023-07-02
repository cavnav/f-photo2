import React from 'react';

export const emptyTitles = {
  empty: 'Пусто',
}; 

export function Empty({
  title = emptyTitles.empty,
}) {  
  return (
    <div className='flexCenter height100pr width100pr'>{title}</div>
  );
}