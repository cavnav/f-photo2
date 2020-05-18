import React, { useState, useEffect, useReducer } from 'react';
import { CompsAddPanel } from '..';
import { additionalActions } from '../../constants';

import './styles.css';

export function AdditionalPanel({
  channel,
  tempReducer,
  activeComponentActions,
}) {
  const [state, setState] = useReducer(tempReducer, stateInit);
  const [ignored, forceUpdate] = useReducer(x => !x, false);

  AdditionalPanel.forceUpdate = forceUpdate;

  if (activeComponentActions.length === 0) return null;

  return (
    <div 
      className='AdditionalPanel'       
    >{
      activeComponentActions
        .map(action => {
          const Target = action.isActive ? CompsAddPanel[action.name] : CompsAddPanel.Default;
          return (
            <Target 
              {...channel.essentials(Target)}
            />
          );
        })
    }
    </div>
  );

  // -----------------------------------------------------------------------

}
AdditionalPanel.forceUpdate = () => {};

AdditionalPanel.getReqProps = ({ 
    API: { _get }, 
    s: { appState }
  }) => ({
    activeComponentActions: _get(appState, ['actions', appState.view.name, 'additionalActions'], []),
  });

AdditionalPanel.getAPI = () => {
  return {
    name: AdditionalPanel.name,
    methods: {
      changeAction({
        action,
        set,
      }) {
        const actionUpd = additionalActions[action.name];
        Object.entries(set).map(([p, v]) => actionUpd[p] = v);

        AdditionalPanel.forceUpdate();
      },
    }
  };
};

const stateInit = {};