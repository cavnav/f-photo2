import React from 'react';
import { PhotoStatusIcons } from './constants';

import { set as _set, get as _get } from 'lodash';

import './styles.css';

export function PhotoStatuses(props) {
  const { 
    curDate,
    curPhoto, 
    printState,
    setPrintState,
    onRenderCb,
  } = props;

  const [ignored, forceUpdate] = React.useReducer(x => !x, false);

  React.useEffect(onRender);

  return getRender();

  //--------------------------------------------------------------------------
  function getRender() {
    const statuses = _get(printState, [curDate, curPhoto]);
    return (statuses === undefined) ? null : (
      <div className="PhotoStatusIcons">
        { Object.entries(statuses)
          .filter(([status, count]) => count)
          .map(([status]) => (
            <img key={status} width="32" height="32" src={`${status}.png`} />
          )) 
        }
      </div>
    );
  }

  function onRender() {
    onRenderCb({
      changeStatusPhotoPrint,
    });  
  }

  function changeStatusPhotoPrint() {    
    // Изменяю объект, чтобы не было рендера родителей.
    let printStateUpd = printState;
    const path = [curDate, curPhoto];
    const statusUpd = _get(printStateUpd, path, new PhotoStatusIcons());
    statusUpd.toPrint = statusUpd.toPrint === 0 ? 1 : 0;
    setPrintState({
      setItSilent,
    });

    forceUpdate();

    // ------------------------------
    
    function setItSilent() {
      _set(this, path, statusUpd);
    }
  }
}

PhotoStatuses.getReqProps = ({ channel }) => {
  return channel.crop({
    s: {
      printState: 1,
    },
    d: {
      setPrintState: 1,
    },
  });
};