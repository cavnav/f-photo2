import React, { useState, useEffect } from 'react';
import { serverApi } from '../../serverApi';

import './styles.css';

export function Print({ props }) {
  const stateInit = {
    
  };

  const [state, setState] = useState(stateInit);
  const [photos, setPhotos] = useState([]);

  useEffect(() => {

    return () => {
    };
  });

  useEffect(() => {
    
  }, []);

  let toRender = 'testPrint';

  return (
    <div className="printPhoto">
      { toRender }
    </div>    
  );

  // --------------------------------------------------------------------
  
}
