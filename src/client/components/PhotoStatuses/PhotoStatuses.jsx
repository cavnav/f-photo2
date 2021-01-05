import React from 'react';
import { 
  PhotoStatusIcons,
  photoStatusIconsEntity, 
} from './constants';

import { set as _set, get as _get } from 'lodash';

import './styles.css';
import { tempReducer, useMyReducer } from '../../functions';
import { ResumeObj } from '../../resumeObj';
import { channel } from '../../Channel';

const resumeObj = new ResumeObj({
  compName: PhotoStatuses.name,
});

const PhotoStatusesComp = channel.addComp({
  fn: PhotoStatuses,
  getAPI,
});

export function PhotoStatuses({
  curPhoto,
}) {
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

  Object.assign(
    PhotoStatusesComp.deps,
    {
      changeStatus,
      getFilesWithStatuses,
    },
  );

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

function getAPI({
  deps: {
    changeStatus,
    getFilesWithStatuses,
  }
}) {
  return {
    changeShareStatus: () => changeStatus({
      actionName: photoStatusIconsEntity.setToShare.name,
    }), 
    changePrintStatus: () => changeStatus({
      actionName: photoStatusIconsEntity.setToPrint.name,
    }), 
    getFilesWithStatuses: () => {
      return getFilesWithStatuses();
    },
  }
};