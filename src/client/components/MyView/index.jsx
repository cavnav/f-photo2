import React, { useState, useEffect } from 'react';
import { Views } from '../';

import './styles.css';

export function MyView(props) {  
  const Target = Views[props.target] || Views.default;
  return (
    <div className="MyView">
      <Target 
        {...props} 
      />
    </div>
  );
}
