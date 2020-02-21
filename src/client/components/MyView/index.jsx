import React, { useState, useEffect } from 'react';
import { Views } from '../index';

export function MyView(props) {  
  const Target = Views[props.target] || Views.default;
  return (
   <Target 
      {...props} 
    />
  );
}
