import React from 'react';

import './styles.css';

export function Welcome(props) {  
  React.useEffect(() => {
    setTimeout(() => controlPanelAttention({}), 1500);

    return () => {
      controlPanelAttention({ enabled: false }) ;
    }
  });

  return (
   <div className="welcome textCenter">
      Выбери одно из действий в верхней строке.
    </div>
  );

  // -------------------------------------------------------------------
  function controlPanelAttention({ enabled = true }) {
    const controlPanelEl = document.querySelector('.controlPanel');
    if (!controlPanelEl) return;
    enabled ? controlPanelEl.classList.add('attention') : controlPanelEl.remove('attention');
  }
}
