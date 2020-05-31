import React, { useState, useReducer } from 'react';
import { ControlPanel, MyView, AdditionalPanel} from './components';
import { tempReducer } from './functions';
import { Views } from './components';
import { additionalActions } from './constants';
import { get as _get } from 'lodash';
import { Channel } from './Channel';

import './app.css';

export function App(props) {
  const d = {}; // dispatch.
  const s = {}; // states.
  const channel = new Channel({ s, d });

  [s.appState, d.setAppState] = useReducer(tempReducer, appStateInit);
  [s.printState, d.setPrintState] = useReducer(tempReducer, printInit);
  [s.photosState, d.setPhotosState] = useReducer(tempReducer, photosStateInit);
  [s.browseState, d.setBrowseState] = useReducer(tempReducer, browseStateInit);
  [s.ignored, d.forceUpdate] = useReducer(x => !x, true);
  
  return (    
    <div className="f-photo">     
      <ControlPanel 
        {...channel.essentials(ControlPanel)}
      />
      <AdditionalPanel
        {...channel.essentials(AdditionalPanel)}
      />
      <MyView 
        {...channel.essentials(MyView)}
      />
    </div>
  );

  //--------------------------------------------------------------------------
}

const appStateInit = {
  view: Views.Welcome,
  doNeedHelp: false, // move to Help module.
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
      additionalActions: [
        additionalActions.ExitFromAlbum, 
      ],
    },
    OnePhoto: {
      additionalActions: [       
        additionalActions.ExitFromOnePhoto,
        additionalActions.SaveChanges,
      ],
      isActive: false,
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
  files: [],
  dirs: [],
};

const browseStateInit = {
  path: [],
  curPhotoInd: -1,
  scrollY: 0,
};

const navLink = [
  appStateInit, 
  photosStateInit, 
  browseStateInit,
];