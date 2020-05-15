import React, { useState, useReducer } from 'react';
import { ControlPanel, MyView, AdditionalPanel} from './components';
import { tempReducer } from './functions';
import { serverApi } from './serverApi';
import { Views } from './components';
import { additionalActions,  changeAction } from './constants';
import { get as _get } from 'lodash';

import './app.css';

export function App(props) {
  const d = {}; // dispatch.
  const s = {}; // states.
  const channel = new Channel({ s, d });

  [s.appState, d.setAppState] = useReducer(tempReducer(), appStateInit);
  [s.printState, d.setPrintState] = useReducer(tempReducer(), printInit);
  [s.photosState, d.setPhotosState] = useReducer(tempReducer(), photosStateInit);
  [s.browseState, d.setBrowseState] = useReducer(tempReducer(), browseStateInit);
  [s.ignored, d.forceUpdate] = useReducer(x => !x, true);

  d.appServerAPI = new AppServerAPI({ dispatch: d, states: s });
  channel.addAPI({ name: 'server', methods: new AppServerAPI({ dispatch: d, states: s }) });
  
  const { view, actions, } = s.appState;

  return (    
    <div className="f-photo">     
      <ControlPanel 
        dispatch={d} 
        actions={actions} 
        states={s}
      />
      <AdditionalPanel
        {...channel.essentials(AdditionalPanel)}
      />
      <MyView 
        target={view} 
        states={s}
        dispatch={d}
        channel={channel}
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
class AppServerAPI {
  constructor({ dispatch, states }) {
    this.dispatch = dispatch;
    this.states = states;
  }
  saveChanges = () => {

  }
  backward = () => {
    this.navigate({ direction: 'backward' });
    this.states.browseState.path = this.states.browseState.path.slice(0, -1);
  }
  toward = ({ subdir } = {}) => {
    this.navigate({ direction: 'toward', params: { subdir } });
    this.states.browseState.path.push(subdir);
  }
  navigate = ({ direction, params = {} }) => {
    serverApi({
      props: {
        url: direction,
        params,
      }
    })
    .then(res => res.json())
    .then((res) => {
      const { files, dirs } = res;
      this.dispatch.setPhotosState({
        files,
        dirs,
      });    
    });
  }
}

class Channel {
  API = {
    Views,
    _get,
  };

  props = {};

  constructor(props) {
    this.props = { 
      ...props,
      API: this.API,
    };
    // Object.entries(props).map((p, v) => this[p] = v);
  }
  addAPI = ({ name, methods }) => {
    this.API[name] = methods;
  }
  essentials = (component) => {
    if (component.API) this.addAPI({
      channel: this,
      tempReducer,
      ...component.API(this.props)});
    if (component.getReqProps) return {
      channel: this,
      tempReducer,
      ...component.getReqProps(this.props),
    };
  }
}

const navLink = [
  appStateInit, 
  photosStateInit, 
  browseStateInit,
  Channel,
];