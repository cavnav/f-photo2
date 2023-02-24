// error Dialog between change Action 
// Warning: Can't perform a React state update on an unmounted component. This is a no-op, but it indicates a memory leak in your application. To fix, cancel all subscriptions and asynchronous tasks in a useEffect cleanup function.
//     in bound render (created by bound render)
// create rename folder dialog
// remove, move, rename (only one folder) (print, share)  
// inside Print a lot of images. how it print?
// add loading (create Proxy Comp for loading)
// magnifying glass
// last added folder
// *hide printed, shared folders
// after back to list to scroll to last opened folder
// help (fire dialog with corresponding actions)
// ban move to print 
// ban move file on Welcome screen
// add path to onePhoto, it is understand where this photo is
// add status icon to preview image

// same layout for all actions - Browse, Print.
// add icon type for items
// share print, share file status
// sync between browse, print, share, onePhoto
  // z100 error
// Failed to load resource
// ctg file
// add create resumeObj in channel.addComp().
// content-visibility

import 'antd/dist/antd.css';
import './app.css';

import React from 'react';
import { Actions, ControlPanel, AdditionalPanel, Dialog } from './components';
import { updFromObj } from './functions';
import { get as _get } from 'lodash';
import { channel } from './channel';
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
      <Dialog.r />
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
  };

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