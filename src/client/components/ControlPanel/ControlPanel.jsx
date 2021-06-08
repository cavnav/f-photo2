import './styles.css';
import React, { useReducer, } from 'react';

import { ResumeObj } from '../../resumeObj';
import { getOppositeWindowObj } from '../../functions';
import { Print } from '../compNames';
import { Dialog } from '../Dialog/Dialog';
import { get as _get } from 'lodash';

const resumeObj = new ResumeObj();

export function ControlPanel({
  tempReducer,
  actions,
  appStateAction,
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
      {Object.entries(actions)
        .filter(([action, actionProps]) => actionProps.isActive)
        .map(([action, actionProps]) => {
          const classNames = Object.keys({
            action: true,
            ...(action === appStateAction && { 'active' : true }),
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
      const oppositeWindowActionId = resumeObj.get({        
        selector: [
          oppositeWindowName,
          'App',
          'action',
        ],
      });
      return actionId === oppositeWindowActionId;
    }
  };
}

ControlPanel.getReqProps = ({ channel }) => {
  return channel.crop({
    s: {
      action: 'appStateAction',
      actions: 1,
    },     
    d: {
      setAppState: 1,
    },
  });
};

const stateInit = {
  isDialogPrint: false,
};