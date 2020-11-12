import React, { useState, useReducer } from 'react';
import { ControlPanel, MyView, AdditionalPanel} from './components';
import { tempReducer } from './functions';
import { Views } from './components';
import { additionalActions } from './constants';
import { get as _get } from 'lodash';
import { Channel } from './Channel';

import 'antd/dist/antd.css';
import './app.css';
import { useEffect } from 'react';
import { getResumeObj } from './resumeObj';

export function App(props) {
  const [d] = React.useState({}); // dispatch.
  const [s] = React.useState({}); // states.
  const channel = React.useMemo(() => new Channel({ s, d }), []);

  const resumeObj = React.useMemo(() => getResumeObj(), []);
  const appStateInit = React.useMemo(() => getAppStateInit({
    resumeObj,
  }), []);
  [s.appState, d.setAppState] = useReducer(tempReducer, appStateInit);
  [s.photosState, d.setPhotosState] = useReducer(tempReducer, photosStateInit);
  [s.browseState, d.setBrowseState] = useReducer(tempReducer, browseStateInit);
  [s.ignored, d.forceUpdate] = useReducer(x => !x, true);

  useEffect(() => {
    resumeObj.save({
      action: s.appState.view,
    });
  }, [s.appState.view]);

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

function getAppStateInit({
  resumeObj,
}) {
  const resumeView = resumeObj.load().action;
  return {
    forceUpdate: false,
    view: resumeView || Views.Welcome.name,
    doNeedHelp: false, // move to Help module.
    actions: {
      Copy: {
        title: 'Копировать',
        isActive: true
      },
      Browse: {
        title: 'Смотреть',
        isActive: true,
        additionalActions: [
          additionalActions.ExitFromAlbum, 
          additionalActions.ToggleRightWindow,
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
        additionalActions: [
          additionalActions.SavePhotosToFlash,
        ],
      },
      Share: {
        title: 'Отправить',
        isActive: true,
        additionalActions: [
          additionalActions.SharePhotos,
        ],
      },
      // Help: {
      //   title: '?',
      //   isActive: true,
      // }
    },
  };
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
