import React from 'react';
import { additionalActions } from './constants';
import { Actions, ControlPanel, Action, AdditionalPanel} from './components';
import { useMyReducer } from './functions';
import { get as _get } from 'lodash';
import { channel } from './Channel';
import { ResumeObj } from './resumeObj';

import 'antd/dist/antd.css';
import './app.css';
import { ExitFromAlbum } from './components/ExitFromAlbum/ExitFromAlbum';
import { ToggleRightWindow } from './components/ToggleRightWindow/ToggleRightWindow';
import { MoveSelections } from './components/MoveSelections/MoveSelections';
import { AddAlbum } from './components/AddAlbum/AddAlbum';
import { RemoveSelections } from './components/RemoveSelections/RemoveSelections';

const resumeObj = new ResumeObj({
  compName: App.name,
});

export function App() {
  const [d] = React.useState({}); // dispatch.
  const [s] = React.useState(resumeObj.load({
    props: {},
  })); // states.

  channel.preset({
    s,
    d,
  });
  
  const appStateInit = React.useMemo(() => getAppStateInit({
    resumeObj,
  }), []);

  const photosStateInit = React.useMemo(() => resumeObj.load({
    compName: 'photosState',
    props: {
      files: [],
      dirs: [],
    },
  }), []);

  const browseStateInit = React.useMemo(() => resumeObj.load({
    compName: 'browseState',
    props: {
      sep: undefined,
      path: '',
      curPhotoInd: -1,
      scrollY: 0,
    },
  }), []);

  const resumeSaveFn = React.useCallback(
    () => resumeObj.save({
      stateUpd: s,
    }),
    [],
  );
  
  [s.appState, d.setAppState] = useMyReducer({
    initialState: appStateInit,
    fn: resumeSaveFn, // for silent setting case.
  });

  [s.photosState, d.setPhotosState] = useMyReducer({
    initialState: photosStateInit,
    fn: resumeSaveFn, 
  });

  [s.browseState, d.setBrowseState] = useMyReducer({
    initialState: browseStateInit,
    fn: resumeSaveFn, 
  });

  [s.ignored, d.forceUpdate] = React.useReducer(x => !x, true);

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
    compName: 'appState',
    props: {
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
            additionalActions[ExitFromAlbum.name], 
            additionalActions[ToggleRightWindow.name],
            additionalActions[MoveSelections.name],
            additionalActions[AddAlbum.name],
            additionalActions[RemoveSelections.name],
          ],
        },
        OnePhoto: {
          additionalActions: [       
            additionalActions.ExitFromOnePhoto,
            additionalActions.SaveChanges,
            additionalActions.RemoveSelections,
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
    },
  });
};