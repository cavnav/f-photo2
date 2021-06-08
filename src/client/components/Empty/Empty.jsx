import React from 'react';

export function Empty({
  isTrue,
}) {  
  return isTrue === false ? null : (
    <div className='flexCenter height100pr width100pr'>Пусто</div>
  );
}