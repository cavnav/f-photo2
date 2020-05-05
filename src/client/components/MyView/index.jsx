import React, { useState, useEffect } from 'react';
import { Views } from '../';

import './styles.css';

export function MyView(props) {  
  const { target: Target } = props;
  return (
    <div className="MyView">
      <Target 
        {...props} 
      />
    </div>
  );
}
