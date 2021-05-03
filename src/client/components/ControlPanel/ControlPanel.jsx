import React, { useReducer, } from 'react';

import './styles.css';
import { Actions } from '../';
import { ResumeObj } from '../../resumeObj';
import { getOppositeWindowObj } from '../../functions';
import { Print } from '../compNames';
import { Dialog } from '../Dialog/Dialog';

const resumeObj = new ResumeObj();

export function ControlPanel({
  tempReducer,
  appState,
  isWelcome,
  setAppState,
}) {
  const [state, setState] = useReducer(tempReducer, stateInit);
  const onCancelDialogPrint = () => {
    setState({
      isDialogPrint: false,
    });
  }
  return (
    <div 
      className="controlPanel flex"
      onClick={onClickAction}
    >
      {Object.entries(appState.actions)
        .filter(([action, actionProps]) => actionProps.isActive)
        .map(([action, actionProps]) => {
          const classNames = Object.keys({
            action: true,
            ...(action === appState.action && { 'active' : true }),
          }).join(' ');
          return (
            <div key={action} className={classNames} data-id={action}>
              {actionProps.title}
            </div>
          );
        })
      }

      {state.isDialogPrint &&
        <Dialog
          onCancel={onCancelDialogPrint}
        >
          <div>Печатать уже активно в противоположном окне</div>
        </Dialog>
      }
    </div>
  );

  // -----------------------------------------------------------------------
  function onClickAction(e) {
    const actionId = e.target.getAttribute('data-id');
    const isSecondPrint = isTryToActiveSecondPrint({
      actionId,
    });

    if (isSecondPrint) {
      setState({
        isDialogPrint: true,
      });
      return;
    }

    setAppState({
      action: actionId,
    });

    
    // ---------------------------------------------------
    function isTryToActiveSecondPrint({
      actionId,
    }) {
      if (actionId !== Print.name) return false;
      const oppositeWindowName = getOppositeWindowObj().name;
      const resumeState = resumeObj.state;      
      return actionId === resumeState[oppositeWindowName].App.appState.action;
    }
  };
}

ControlPanel.getReqProps = ({ channel }) => {
  const cropped = channel.crop({
    s: { 
      appState: 1,  
    },      
    d: {
      setAppState: 1,
    },
  });
  
  return {
    ...cropped,
    isWelcome: cropped.appState.action === Actions.Welcome.name,
  };
};

const stateInit = {
  isDialogPrint: false,
};