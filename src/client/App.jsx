// TODO 
// content-visibility
// ctg file
// add loading
// print >< share
// Failed to load resource
// rename folder by id on serverSide. Rename reset otherside path to root.
    // need update files, dirs, printed, shared
// remove folder error in two  windows mode. trouble in server side.
// help
// scroll to selected folder
// Print why delete filesWithStates
// Dont rewrite files in Printed/New when rewrite old list.
// Two ExitFromFolder. One is only Label.
// +error Browse resetTo path=""
// -+save files after create printFlash to appropriate folder
// +active menu item
// +remove cardreader from pc
// +checkbox and remove
// +print
// +move
// +Next on copy from flash
// +extract files, then open new folder.
// +OnePhoto error after f5
// +ban print in two windows
// +highlight statusIcons
// +error location showing statusIcons  
// +add checks to show/hide status icons.
// -.toPrint, .toShare methode must get val.
// -may be create global object filesWithStatuses
// +zero print problem
// +multiple changing status error
// +save statuses on global resume object level
// +forbid insert non number symbols
// +progress
// +fix layout

import 'antd/dist/antd.css';
import './app.css';

import React from 'react';
import { additionalActions } from './constants';
import { Actions, ControlPanel, Action, AdditionalPanel} from './components';
import { useMyReducer } from './functions';
import { get as _get } from 'lodash';
import { channel } from './Channel';
import { ResumeObj } from './resumeObj';
import { ExitFromFolder } from './components/ExitFromFolder/ExitFromFolder';
import { ToggleRightWindow } from './components/ToggleRightWindow/ToggleRightWindow';
import { MoveSelections } from './components/MoveSelections/MoveSelections';
import { AddAlbum } from './components/AddAlbum/AddAlbum';
import { RemoveSelections } from './components/RemoveSelections/RemoveSelections';


const resumeObj = new ResumeObj({
  selector: [
    window.name,
    App.name,
  ],
});


export function App() {
  let s; // state
  const [d] = React.useState({}); // dispatch.

  [s, d.setAppState] = useMyReducer({
    initialState: getAppStateInit(),
    fn: resumeUpdFn,
  });

  channel.preset({
    s,
    d,
  });

  React.useEffect(() => {
    channel.API.comps.server.getAppData()
    .then((res) => {
      d.setAppState(res);
    })},
    []
  );

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

function resumeUpdFn({
  state,
}) {
  resumeObj.save({
    val: state,
  });
};

function getAppStateInit(
) {
  const resumed = resumeObj.get();

  return {
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
          additionalActions[ExitFromFolder.name], 
          additionalActions[ToggleRightWindow.name],
          additionalActions[MoveSelections.name],
          additionalActions[AddAlbum.name],
          additionalActions[RemoveSelections.name],
        ],
      },
      OnePhoto: {
        isActive: false,
        additionalActions: [       
          additionalActions.ExitFromOnePhoto,
          additionalActions.SaveChanges,
          additionalActions.RemoveSelections,
          additionalActions[MoveSelections.name],
        ],
      },
      Print: {
        title: 'Печатать',
        isActive: true,
        additionalActions: [
          additionalActions.Label,
          additionalActions.ExitFromFolder,
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
    ...resumed,    
  };
};