import React, { useState, useReducer } from 'react';
import { ControlPanel, Action, AdditionalPanel} from './components';
import { tempReducer } from './functions';
import { Actions } from './components';
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
      action: s.appState.action,
    });
  }, [s.appState.action]);

  return (    
    <div className="f-photo">     
      <ControlPanel 
        {...channel.essentials(ControlPanel)}
      />
      <AdditionalPanel
        {...channel.essentials(AdditionalPanel)}
      />
      <Action 
        {...channel.essentials(Action)}
      />
    </div>
  );

  //--------------------------------------------------------------------------
}

function getAppStateInit({
  resumeObj,
}) {
  return resumeObj.load({
    action: Actions.Welcome.name,
    forceUpdate: false,
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
  });
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
