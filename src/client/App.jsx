import React, { useState, useReducer } from 'react';
import { ControlPanel, MyView, AdditionalPanel} from './components';

import './app.css';

export function App(props) {
  const [printState, setPrintState] = useState(printInit);
  const [appState, setAppState] = useReducer(stateReducer, appStateInit);
  const [photosState, setPhotosState] = useReducer(photosReducer, photosStateInit);

  const dispatch = {
    setAppState,
    setPrintState,
    setPhotosState,
  };

  const { view, actions, } = appState;

  return (    
    <div className="f-photo">     
      <ControlPanel 
        dispatch={dispatch} 
        actions={actions} 
        appState={appState}
      />
      <AdditionalPanel 
        dispatch={dispatch} 
        appState={appState}
        photosState={photosState}
      />
      <MyView 
        target={view} 
        appState={appState}
        printState={printState}
        photosState={photosState}
        dispatch={dispatch}
      />
    </div>
  );

  //--------------------------------------------------------------------------
}

const appStateInit = {
  view: 'Welcome',
  doNeedHelp: false,
  additionalActionId: undefined,
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
      additionalActions: ['ExitFromAlbum', 'SelectAlbum'],
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
  },
  additionalActions: {
    ExitFromAlbum: {
      title: 'Закрыть альбом',
      isActive: true,
    },
    SelectAlbum: {
      title: 'Выбрать альбом',
      isActive: false,
    },
  },
};

const printInit = {
  // "2020-02-21": {
  //   "br/20170107_112131.jpg": {
  //     toPrint: 1,
  //     toShare: 0,
  //   }
  // }
};

const photosStateInit = {
  photos: [],
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

function photosReducer(prevState, newState) {
  return {
    ...prevState,
    ...newState,
  };
}