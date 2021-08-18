import './styles.css';
import React, { useReducer, } from 'react';

import { ResumeObj } from '../../resumeObj';
import { getOppositeWindowObj, useMyReducer } from '../../functions';
import { Print } from '../compNames';
import { Dialog } from '../Dialog/Dialog';
import { get as _get } from 'lodash';
import { channel } from '../../Channel';
import cn from 'classnames';

const resumeObj = new ResumeObj();
const Comp = channel.addComp({
  fn: ControlPanel,
  getReqProps,
});

export function ControlPanel({
}) {
  const [state, setState] = useMyReducer({
    initialState: stateInit,
    setCompDeps: Comp.setCompDeps,
  });

  const rp = Comp.getReqProps();
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
      {Object.entries(rp.actions)
        .filter(([action, actionProps]) => actionProps.isEnabled)
        .map(([action, actionProps]) => {
          const classNames = cn({
            action: true,
            active: action === rp.appStateAction,
            btn: true,
          });          
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

    rp.setAppState({
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

function getReqProps ({ channel }) {
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