import React, { useState, useReducer } from 'react';
import { ControlPanel, MyView, } from './components';

import './app.css';

export function App(props) {
  const [appState, setAppState] = useReducer(stateReducer, appStateInit);
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

const appStateInit = {
  view: 'Welcome',
  doNeedHelp: false,
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
      title: 'Печатать',
      isActive: true,
    },
    Share: {
      title: 'Отправить',
      isActive: true,
    },
    Help: {
      title: '?',
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

function stateReducer(prevState, newState) {
  if (newState.view === 'Help') return {
    ...newState,
    view: prevState.view,
    doNeedHelp: true,
  };

  return {
    ...newState,
    doNeedHelp: false,
  };
}