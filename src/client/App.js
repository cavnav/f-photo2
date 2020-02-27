import React, { useState, useEffect } from 'react';
import { ControlPanel, MyView } from './components';

import './app.css';

export function App(props) {
  const appStateInit = {
    view: '',
    actions: {
      Tune: {
        title: 'Настроить',
        isActive: true
      },
      Copy: {
        title: 'Копировать',
        isActive: true
      },
      Browse: {
        title: 'Смотреть',
        isActive: true,
      },
      Print: {
        title: 'Напечатать',
        isActive: true,
      }
    }
  };

  const printInit = {
    // "2020-02-21": {
    //   "br/20170107_112131.jpg": {
    //     toPrint: 1,
    //     toShare: 0,
    //   }
    // }
  };

  const [appState, setAppState] = useState(appStateInit);
  const [printState, setPrintState] = useState(printInit);

  const dispatch = {
    setAppState,
    setPrintState,
  };

  const { view, actions } = appState;

  return (    
    <div className="f-photo">     
      <ControlPanel 
        dispatch={dispatch} 
        actions={actions} 
        appState={appState}
      />
      <MyView 
        target={view} 
        appState={appState}
        printState={printState}
        dispatch={dispatch}
      />
    </div>
  );

  //--------------------------------------------------------------------------
  
}
