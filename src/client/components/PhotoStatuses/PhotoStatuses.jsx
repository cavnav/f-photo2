import React from 'react';
import { 
  PhotoStatusIcons,
  photoStatusIconsEntity, 
} from './constants';

import { set as _set, get as _get } from 'lodash';

import './styles.css';
import { tempReducer, useMyReducer } from '../../functions';
import { ResumeObj } from '../../resumeObj';

const resumeObj = new ResumeObj({
  compName: PhotoStatuses.name,
});

export function PhotoStatuses(props) {
  const { 
    curPhoto, 
  } = props;

  Object.assign(PhotoStatuses, {
    changeStatus,
    getFilesWithStatuses,
  });

  const initState = React.useMemo(() => {
    return resumeObj.load({
      props: getInitState(),
    });
  }, []);
  
  const [state, setState] = useMyReducer({
    initialState: initState,
    fn: (val) => resumeObj.save(val),
  });

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
    _set(state.filesWithStatuses, path, statusUpd);
    statusUpd[actionName]({});

    setState({
      forceUpdate: !state.forceUpdate,
    });
  }

  function getInitState() {
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