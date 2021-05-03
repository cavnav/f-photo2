import React from 'react';
import { 
  PhotoStatusIcons,
} from './constants';

import './styles.css';
import { getFilesWithStatuses, updateFilesWithStatuses, useMyReducer } from '../../functions';
import { ResumeObj } from '../../resumeObj';
import { channel } from '../../Channel';

const resumeObj = new ResumeObj({
  compName: PhotoStatuses.name,
});

const PhotoStatusesComp = channel.addComp({
  fn: PhotoStatuses,
  getAPI,
  getReqProps,
});

export function PhotoStatuses({
  id,
}) {
  const [state] = useMyReducer({
    initialState: {
      ...getStateInit(),
    },
    setCompDeps: ({
      deps,
    }) => PhotoStatusesComp.setCompDeps({
      deps: {
        ...deps,
        id,
      },
    }),
    fn: ({
      state,
      stateUpd,
    }) => {
      const stateUpdNext = {
        ...state,
      };
      delete stateUpdNext.filesWithStatuses;
      resumeObj.save({ 
        stateUpd: stateUpdNext,
      });
      stateUpd.filesWithStatuses !== undefined && updateFilesWithStatuses({
        stateUpd: stateUpd.filesWithStatuses,
      });
    },
  });

  const statuses = getStatuses();

  return (statuses.length === 0) ? null : (
    <div className="PhotoStatusIcons">
      { statuses }
    </div>
  );


  // ----------------------------------
  function getStatuses() {
    return Object.entries(state.filesWithStatuses[id] || {})
    .map(([status, val]) => {
      if (PhotoStatusIcons.checkHide({
        status,
        val,
      })) {
        return null;
      }
      return <img key={status} src={`${status}.png`} />;        
    })
    .filter((item) => item);
      
  }
}

function getReqProps({
  channel,
}) {
  return channel.crop({
    d: {
      setPhotosState: 1,
    },
  });
}

function getAPI({
}) {
  return {
    changeShareStatus: () => {      
      changeStatus({
        actionName: PhotoStatusIcons.setToShare.name,
      });
    }, 
    changePrintStatus: () => {
      changeStatus({
        actionName: PhotoStatusIcons.setToPrint.name,
      });
    }, 
  }


  // ----------------------

  function changeStatus({
    actionName,
  }) {    
    const {
      id,
      state,
      setState,
    } = PhotoStatusesComp.deps;

    setState({
      filesWithStatuses: updateFileWithStatuses(),
    });


    // -----------------------------------------------------
    function updateFileWithStatuses() {
      const status = state.filesWithStatuses[id];
      if (status === undefined) {
        state.filesWithStatuses[id] = new PhotoStatusIcons()
      }
      PhotoStatusIcons[actionName].call(
        state.filesWithStatuses[id],
      )
      return state.filesWithStatuses;
    }
  }
};

function getStateInit() {
  const loaded = resumeObj.load({});
      
  return {
    filesWithStatuses: getFilesWithStatuses(),
  
    ...loaded,
  };
}

