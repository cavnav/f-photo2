import React from 'react';
import { channel } from '../../channel';

import './styles.css';

export const Welcome = channel.addComp({
  render,
  name: 'Welcome',
});

function render() {  
  return (
   <div className="welcome textCenter">
      Выбери действие в верхней строке.
    </div>
  );

  // -------------------------------------------------------------------
}
