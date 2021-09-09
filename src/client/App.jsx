// Переход на копирование после копирования
// content-visibility
// ctg file
// add loading
// Failed to load resource
  // add icon
// rename folder by id on serverSide. Rename reset otherside path to root.
    // need update files, dirs, printed, shared
// remove folder error in two  windows mode. trouble in server side.
// help
// scroll to selected folder
// Highlight current action in case OnePhoto

import 'antd/dist/antd.css';
import './app.css';

import React from 'react';
import { Actions, ControlPanel, AdditionalPanel, Notification} from './components';
import { updFromObj, useMyReducer } from './functions';
import { get as _get } from 'lodash';
import { channel } from './Channel';
import { ResumeObj } from './resumeObj';


export const App = channel.addComp({
  name: 'App',
  render,
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

  [s, d.setAppState] = useMyReducer({
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

export function getAppAPI(
) {
  const { deps } = App;
  return {
    setState: deps.setState,
    toggleActions,
    toggleNotification,
  };

  function toggleNotification({
    title,
    time = 2000,
  }) {
    const { deps } = App;
    deps.setState({
      notification: title,
    });
  }

  function toggleActions({
    action,
    actions = {},
  }) {
    const { deps } = App;
    deps.setState({
      action,
      actions: updFromObj({
        obj: deps.state.actions,
        objUpd: actions,      
      }),
    });
  }
}