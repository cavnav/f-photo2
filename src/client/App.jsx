import React, { useState, useReducer } from 'react';
import { ControlPanel, MyView, AdditionalPanel} from './components';
import { tempReducer } from './functions';

import './app.css';

export function App(props) {
  const d = {}; // dispatch.
  const s = {}; // states.
  [s.printState, d.setPrintState] = useState(printInit);
  [s.appState, d.setAppState] = useReducer(stateReducer, appStateInit);
  [s.photosState, d.setPhotosState] = useReducer(tempReducer(), photosStateInit);
  [s.browseState, d.setBrowseState] = useReducer(tempReducer(), browseStateInit);

  const { view, actions, } = s.appState;

  return (    
    <div className="f-photo">     
      <ControlPanel 
        dispatch={d} 
        actions={actions} 
        states={s}
      />
      <AdditionalPanel 
        dispatch={d} 
        states={s}
      />
      <MyView 
        target={view} 
        states={s}
        dispatch={d}
      />
    </div>
  );

  //--------------------------------------------------------------------------
}

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

const browseStateInit = {
  curPhotoInd: -1,
  scrollY: 0,
};

const navLink = [
  appStateInit, 
  photosStateInit, 
  browseStateInit,

];