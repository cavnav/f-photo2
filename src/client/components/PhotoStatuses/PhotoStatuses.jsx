import React from 'react';
import { 
  PhotoStatusIcons,
  photoStatusIconsEntity, 
} from './constants';

import { set as _set, get as _get } from 'lodash';

import './styles.css';
refimport { tempReducer } from '../../functions';

export function PhotoStatuses(props) {
  const { 
    curPhoto, 
  } = props;

  Object.assign(PhotoStatuses, {
    changeStatus,
    getFilesWithStatuses,
  });

  const [state, setState] = React.useReducer(tempReducer, getStateInit());

  const statuses = _get(state.filesWithStatuses, [curPhoto]);

  return (statuses === undefined) ? null : (
    <div className="PhotoStatusIcons">
      { Object.entries(statuses)
        .filter(([status, flag]) => flag)
        .map(([status]) => (
          <img key={status} width="32" height="32" src={`${status}.png`} />
        )) 
      }
    </div>
  );

  function changeStatus({
    actionName,
  }) {    
    const path = [curPhoto];
    const statusUpd = _get(state.filesWithStatuses, path, new PhotoStatusIcons());
    statusUpd[actionName]();

    setState({
      forceUpdate: !state.forceUpdate,
    });
  }

  function getStateInit() {
    return {
      forceUpdate: false,
      filesWithStatuses: {},
    };
  }

  function getFilesWithStatuses() {
    return state.filesWithStatuses;
  }
}

PhotoStatuses.getAPI = () => {
  return {
    changeShareStatus: () => PhotoStatuses.changeStatus({
      actionName: photoStatusIconsEntity.setToShare.name,
    }), 
    changePrintStatus: () => PhotoStatuses.changeStatus({
      actionName: photoStatusIconsEntity.setToPrint.name,
    }), 
    getFilesWithStatuses: () => {
      return PhotoStatuses.getFilesWithStatuses();
    },
  }
};