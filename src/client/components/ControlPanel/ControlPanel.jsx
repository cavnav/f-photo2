import './styles.css';
import React from 'react';

import { ResumeObj } from '../../resumeObj';
import { getOppositeWindowObj, useMyReducer } from '../../functions';
import { Print } from '../compNames';
import { get as _get } from 'lodash';
import { channel } from '../../Channel';
import cn from 'classnames';
import { Notification } from '..';

const resumeObj = new ResumeObj();
export const ControlPanel = channel.addComp({
  name: 'ControlPanel',
  render,
  getReqProps,
});

function render() {
  const Comp = this;
  const [state, setState] = useMyReducer({
    initialState: stateInit,
    setCompDeps: Comp.bindSetCompDeps(),
  });

  const rp = Comp.getReqProps();
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
    </div>
  );

  // -----------------------------------------------------------------------
  function onClickAction(e) {
    const actionId = e.target.getAttribute('data-id');

    if (actionId === Print.name) {
      // Чтобы не открывалась вторая печать.
      const resumeData = resumeObj.state;
      const { browserCount } = resumeData; 
      if (browserCount > 1) {
        const oppositeWindow = getOppositeWindowObj();
        if (resumeData[oppositeWindow.name].App.action === Print.name) {
          const rp = Comp.getReqProps();
          rp.NotificationAPI.forceUpdate({
            title: 'Нельзя открыть вторую печать',
          });
          return;
        }
      }
    }

    rp.setAppState({
      action: actionId,
    });
  };
}

function getReqProps ({ channel }) {
  const cropped = channel.crop({
    s: {
      action: 'appStateAction',
      actions: 1,
    },     
    d: {
      setAppState: 1,
    },
  });

  return {
    ...cropped,
    NotificationAPI: Notification.getAPI(),
  };
};

const stateInit = {
  isDialogPrint: false,
};