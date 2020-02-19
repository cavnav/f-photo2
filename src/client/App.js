import React, { useState, useEffect } from 'react';
import { ControlPanel, MyView } from './components';
import './app.css';

export function App(props) {
  const appStateInit = {
    view: '',
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
      },
      Print: {
        title: 'Напечатать',
        isActive: true,
      }
    }
  };

  const printInit = {
    // 20200219: {
    //   'asdf': 1,
    //   'asdff': 2,
    // }
  },

  const [appState, setAppState] = useState(appStateInit);
  const [printState, setPrintState] = useState(printInit);

  const dispatch = {
    setAppState,
    setPrintState,
  };

  changeState = ({ key, val }) => {
    this.setState({ [key]: val });
  };

  const { view, actions } = appState;

  return (    
    <div className="f-photo flex flexDirColumn">
      <ControlPanel changeState={this.changeState} actions={actions} />
      <MyView 
        target={view} 
        changeState={this.changeState} 
        appState={
          appState,
        }
        printState={
          printState
        }
        dispatch={dispatch}
      />
    </div>
  );
}
