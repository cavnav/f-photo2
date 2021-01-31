import React from 'react';
import { 
  PhotoStatusIcons,
  photoStatusIconsEntity, 
} from './constants';

import './styles.css';
import { useMyReducer } from '../../functions';
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
  curPhoto,
}) {
  const initState = React.useMemo(() => {
    return resumeObj.load({
      props: stateInit(),
    });
  }, []);
  
  const [state, setState] = useMyReducer({
    initialState: initState,
    comp: {
      setDeps: PhotoStatusesComp.setDeps,
      deps: {
        curPhoto,
      },
    },
    fn: (val) => resumeObj.save({ 
      stateUpd: val
    }),
  });

  const statuses = state.filesWithStatuses[curPhoto];

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
        actionName: photoStatusIconsEntity.setToShare.name,
      });
    }, 
    changePrintStatus: () => {
      changeStatus({
        actionName: photoStatusIconsEntity.setToPrint.name,
      });
    }, 
    getFilesWithStatuses,
  }

  // ----------------------

  function changeStatus({
    actionName,
  }) {    
    const {
      state,
      setState,
      curPhoto,
    } = PhotoStatusesComp.deps;

    setState({
      autoUpdate: () => {
        const status = state.filesWithStatuses[curPhoto];
        if (status === undefined) {
          state.filesWithStatuses[curPhoto] = new PhotoStatusIcons();
        }
        status.filesWithStatuses[curPhoto][actionName]();
      }
    });
  }

  function getFilesWithStatuses() {
    const {
      state,
    } = PhotoStatusesComp.deps;
    return state.filesWithStatuses;
  }
};

function stateInit() {
  return {
    filesWithStatuses: {},
  };
}