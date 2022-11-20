// when toward not exists path fire error. need check path.
// remove, move, rename (only one folder) (print, share)  

// inside Print a lot of images. how it print?
// add loading

// same layout for all actions - Browse, Print.
// add icon type for items
// share print, share file status
// sync between browse, print, share, onePhoto
  // z100 error
// add path to onePhoto, it is understand where this photo is
// add status icon to preview image
// ban move file on Welcome screen
// hide printed, shared folders
// scroll to selected folder
// help

// ban move to print 
// 
// Failed to load resource
// ctg file
// add create resumeObj in channel.addComp().
// content-visibility

import 'antd/dist/antd.css';
import './app.css';

import React from 'react';
import { Notification, Actions, ControlPanel, AdditionalPanel } from './components';
import { updFromObj } from './functions';
import { get as _get } from 'lodash';
import { channel } from './Channel';
import { ResumeObj } from './resumeObj';
import { useMutedReducer } from './mutedReducer';

export const App = channel.addComp({
  name: 'App',
  render,
  getAPI,
});

const resumeObj = new ResumeObj({
  selector: [
    window.name,
    App.name,
  ],
});

function render() {
  const Comp = this;
  let s; // state
  const [d] = React.useState({}); // dispatch.

  [s, d.setAppState] = useMutedReducer({
    initialState: getAppStateInit(),
    setCompDeps: Comp.bindSetCompDeps(),
    fn: resumeUpdFn,
  });

  channel.preset({
    s,
    d,
  });

  React.useEffect(() => 
    {
      const onMouseUpWrap = (e) => onMouseUp({ Comp, e });
      document.addEventListener('mouseup', onMouseUpWrap);
      return () => document.removeEventListener('mouseup', onMouseUpWrap);
    },
    []
  );


  const Action = Actions[s.action];

  return (    
    <div className="f-photo">     
      <ControlPanel.r />
      <AdditionalPanel.r/>
      <div className="Action">
        <Action.r />
      </div>
      <Notification.r />
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
    notification: '',
    forceUpdate: false,
    doNeedHelp: false, // move to Help module.
    mouse: {
      x: 0,
      y: 0,
    },
    actions: {
      Copy: {
        title: 'Добавить',
        isEnabled: true
      },
      Browse: {
        title: 'Смотреть',
        isEnabled: true,
      },
      OnePhoto: {
        title: 'Смотреть',
        isEnabled: false,
      },
      Print: {
        title: 'Печатать',
        isEnabled: true,
      },
      Share: {
        title: 'Отправить',
        isEnabled: true,
      },
      // Help: {
      //   title: '?',
      //   isEnabled: true,
      // }
    },
    ...resumed,    
  };
};


// Need to be sameFunction and App must be 'this'.
function onMouseUp({
  Comp, 
  e
}) {
  Comp.deps.setState({
    forceUpdate: false,
    mouse: {
      x: e.clientX,
      y: e.clientY,
    }
  });
}

export function getAPI({
  deps,
}) {
  return {
    setState: deps.setState,
    toggleActions,
    toggleNotification,
  };

  function toggleNotification({
    title,
    time = 2000,
  }) {
    deps.setState({
      notification: title,
    });
  }

  function toggleActions({
    action,
    actions = {},
  }) {
    deps.setState({
      action,
      actions: updFromObj({
        obj: deps.state.actions,
        objUpd: actions,      
      }),
    });
  }
}