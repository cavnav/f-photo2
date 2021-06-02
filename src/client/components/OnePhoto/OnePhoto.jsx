import './styles.css';

import React from 'react';
import { PhotoStatuses } from '..';
import { additionalActions, } from '../../constants';
import { Dialog } from '../';
import { ResumeObj, resumeObjConstants } from '../../resumeObj';
import { myArray, refreshOppositeWindow, useMyReducer } from '../../functions';
import { channel } from '../../Channel';
import { Browse } from '../Browse/Browse';
import { getCurDate } from '../../functions';

const resumeObj = new ResumeObj({
  compName: OnePhoto.name,
});

const OnePhotoComp = channel.addComp({
  fn: OnePhoto,
  getAPI,
  getReqProps,
});
export function OnePhoto(
  {}
) { 
  const {
    photosState,
    curPhotoInd,
    server,
  } = OnePhotoComp.getReqProps();
  const myFiles = React.useMemo(() => myArray({
      items: photosState.files,
    }),
    []
  );

  const [props] = React.useState({
    curPhotoInd: curPhotoInd,
    files: myFiles,
    path: path,
  });

  const [state, setState] = useMyReducer({
    reducer: selfReducer,
    setCompDeps: OnePhotoComp.setCompDeps,
    props,
    initialState: {
      ...stateInit,
      ...resumeObj.load({}),      
    }, 
  });

  const onDialogRemoveCancel = React.useCallback(() => {
    setState({
      isDialogRemoveItem: false,
    });
  }, []);

  const imgRef = React.useRef(null);

  React.useEffect(addKeyDownListener);
  React.useEffect(fitCurPhotoSize, [state.curPhotoInd]);
  React.useEffect(() => {
    if ({
      onTogglePhoto: 1, 
      onImgServerRotate: 1
    }[state.action] === undefined) return;

    setTimeout(() => {
      if (!imgRef.current) return;
      imgRef.current.style.visibility = 'visible';
      imgRef.current.style.opacity = '1';
    }, 200);
  });

  React.useEffect(() => {
    if (state.action === onTogglePhoto.name) {
      setToResumeObj({
        stateUpd: {
          [resumeObjConstants.Browse]: {
            curPhotoInd: state.curPhotoInd,
          },
        },
      });
    }
  }, [state.curPhotoInd]);

  return getRender();

  //--------------------------------------------------------------------------
  function getRender() {
    const rp = OnePhotoComp.getReqProps();
    const id = `${rp.path}${rp.sep}${state.curPhoto}`;
    return (
      <div 
        className="OnePhoto fitScreen"
      >
        { state.isNoItems === false && (
          <>
            <img 
              ref={imgRef}
              src={`${state.path}/${state.curPhotoWithTime}`}        
              style={{
                transform: `rotate(${state.curPhotoRotateDeg}deg)`,
                opacity: state.opacity,
                visibility: state.visibility,
              }} 
            />
            <PhotoStatuses 
              id={id}
            />
          </>
        )}        
        {state.isDialogRemoveItem && (
          <Dialog
            type={Dialog.RemoveItems}   
            onCancel={onDialogRemoveCancel}    
          >          
          </Dialog>
        )}
        {state.isNoItems && 'Пусто'}
      </div>
    );
  }

  function toRenderHelp() {
    return <div className="flexCenter marginBottom10">
      Стрелка вправо - показать следующее фото.<br></br>
      Стрелка влево - показать предыдущее фото.<br></br>
      Стрелка вверх - повернуть текущее фото по часовой стрелке.<br></br>
      Стрелка вниз - повернуть текущее фото против часовой стрелки.<br></br>
      Цифра 1 - добавить фото к списку "Печатать".<br></br>
      Цифра 2 - добавить фото к списку "Отправить".<br></br>
      Цифра 0 - удалить фото.<br></br>
      Пробел - сохранить изменения.<br></br>

    </div>
  }

  function addKeyDownListener() {
    document.addEventListener('keydown', onKeyDown);

    return () => {
      document.removeEventListener('keydown', onKeyDown);
    };
  }

  function fitCurPhotoSize() {
    const photoEl = imgRef.current;  
    if (!photoEl) return;  
    Object.assign(
      photoEl.style,
      getFitSize(photoEl.getBoundingClientRect()),
    );
  }

  function onKeyDown(e) {
    const {
      files,
    } = state;
    const {
      prevPhotoInd,
    } = getIndexes({
      curPhotoInd: state.curPhotoInd,
      filesLength: files.items.length,
    });
    const rp = OnePhotoComp.getReqProps();
    const stateUpd = {};

    switch (e.which) {  
      case 13: // enter.
        rp.PhotoStatusesAPI.changeShareStatus();
        break;

      case 32:  // Space
        rp.PhotoStatusesAPI.changePrintStatus(); 

        break; 

      case 37: // prev 
        stateUpd.curPhotoInd = prevPhotoInd;
        stateUpd.curPhotoRotateDeg = 0;
        stateUpd.action = onTogglePhoto.name;

        break; 

      case 39: // next
        onToggleNextPhoto({
          stateUpd,
          curPhotoInd: state.curPhotoInd,
          files,
        });
        break;

      case 38: // rotate right
        stateUpd.curPhotoRotateDeg = rotate({ deg: state.curPhotoRotateDeg + 90 }); 
        stateUpd.action = onImgServerRotate.name;
        break; 

      case 40: 
        stateUpd.curPhotoRotateDeg = rotate({ deg: state.curPhotoRotateDeg - 90 });              
        stateUpd.action = onImgServerRotate.name;
        break; // rotate left
    }

    setState(stateUpd);

    changeAddActions();

    // ---------------------------

    function rotate({ deg }) {
      return Math.abs(deg) === 360 ? 0 : deg;
    }

    function changeAddActions() {
      const [updatedProp] = Object.keys(stateUpd);
      if (updatedProp) runTrigger({ updatedProp, });

      // ---------------------------------------

      function runTrigger({ updatedProp, }) {
        return {
          [updatedProp]: () => {},
          curPhotoInd: onTogglePhoto,
          curPhotoRotateDeg: onImgServerRotate,
        }[updatedProp]({
            server,
            state,
            stateUpd,
            setState,
          }
        ); 
      }
    }
  }
}

function selfReducer({
  state,
  stateUpd,
}) {

  let stateReduced = { 
    ...state,
    ...stateUpd,
  };

  const {
    files,
  } = stateReduced;

  const curPhoto = files.items[stateReduced.curPhotoInd];

  stateReduced = {
    ...stateReduced,
    curPhoto,
    isNoItems: curPhoto ? false : true,
    ...getProps({ stateReduced }),
  };

  resumeObj.save({
    stateUpd: stateReduced
  });

  return stateReduced;

  // ----------------------------------------

  function getProps({
    stateReduced,
  }) {
    return {
      [stateReduced.action]: {},
      [onTogglePhoto.name]: {
        curPhotoWithTime: curPhoto,
        opacity: '0',
        visibility: 'hidden',
        curPhotoRotateDeg: 0,
      },
      [onImgServerRotate.name]: {
       // curPhotoRotateDeg: 0,
        curPhotoWithTime: `${curPhoto}?${new Date().getTime()}`,
        opacity: '0',
        visibility: 'hidden',
      },
    }[stateReduced.action];
  }
};

function getFitSize({ width, height }) {
  const res = {};
  if (width > height * 2) {
    res.width = '100%';
    res.height = undefined;
  } else {
    res.width = undefined;
    res.height = '100%';
  }
  return res;
}

function onTogglePhoto() {
  additionalActions.SaveChanges.reset();
}

function getIndexes({
  curPhotoInd,
  filesLength,
}) {
  const prevPhotoInd = curPhotoInd > 0 ? curPhotoInd - 1 : 0;
  const nextPhotoInd = curPhotoInd < filesLength - 1 ? (curPhotoInd + 1) : (filesLength - 1);
  return {
    prevPhotoInd,
    nextPhotoInd,
  };
}

function onToggleNextPhoto({
  stateUpd,
  curPhotoInd,
  files,
}) {
  const {
    nextPhotoInd,
  } = getIndexes({
    curPhotoInd: curPhotoInd,
    filesLength: files.items.length,
  });
  stateUpd.curPhotoInd = nextPhotoInd; 
  stateUpd.action = onTogglePhoto.name;

  return stateUpd;
}

function onImgServerRotate({
  server,
  state: { 
    curPhoto,
  },
  stateUpd: {
    curPhotoRotateDeg,
  },
  setState,
}) { return;
  additionalActions.SaveChanges.change({ 
    set: {                                 
      isActive: curPhotoRotateDeg !== 0,
      onAction: {
        API: () => server.imgRotate({
          deg: curPhotoRotateDeg,
          img: curPhoto,
          path: curPhoto,
        })
        .then(res => {
          setState({
            action: onImgServerRotate,
          });
          additionalActions.SaveChanges.reset();
        })                 
      },
    },
  });
}

function getReqProps({ channel }) { 
  const props = channel.crop(
    {
      s: {
        photosState: 1,
      },
      API: {
        comps: {
          server: 1
        }
      },
      comps: {
        ...PhotoStatuses.API,
        ...Browse.API,
      },
      [resumeObjConstants.Browse]: {
        path: 1,
        sep: 1,
        curPhotoInd: 1,
      },
    },
    {
      [resumeObjConstants.Browse]: resumeObj.state[resumeObjConstants.Browse],    
    },
  ); 
  
  return props;
};

function getAPI({  
}) {
  return {
    removeSelections(
      {} = {}
    ) {
      const {
        state,
        setState,
      } = OnePhotoComp.deps;
      const {
        BrowseAPI,
        server,
      } = OnePhotoComp.getReqProps();

      if (!state.curPhoto) return;
      
      if (state.isDialogRemoveItem === false) {
        setState({
          isDialogRemoveItem: true,
        });
        return;
      }  

      server.removeItems({
        items: [state.curPhotoWithTime],
      }).then(() => {
        updateStates();
      });
    },
    moveSelections,
    getCountSelections() {
      return 1;
    }
  };

  // -------------------------
  function moveSelections() {
    const rp = OnePhotoComp.getReqProps();
    const deps = OnePhotoComp.deps;
    rp.server.moveToPath({
      items: [deps.state.curPhotoWithTime],
      destWindow: window.oppositeWindow,
    })
    .then(() => {
      updateStates();
      refreshOppositeWindow();
    });   
  }

  function updateStates() {
    const {
      state,
      setState,
    } = OnePhotoComp.deps;
    const rp = OnePhotoComp.getReqProps();

    state.files.delete(state.curPhotoInd);

    rp.BrowseAPI.changeSelections({
      src: state.curPhoto,
      checked: false,
    });

    const curPhotoIndUpd = state.files.items.length === state.curPhotoInd ?
      state.curPhotoInd - 1 :
      state.curPhotoInd;

    const stateUpd = {
      action: onTogglePhoto.name,
      isDialogRemoveItem: false,
      curPhotoInd: curPhotoIndUpd,
    };

    setState(
      stateUpd,
    );  
  }
};

const stateInit = {
  files: {},
  path: undefined,
  loading: false,
  progress: 100,
  isDialogRemoveItem: false,
  curPhoto: '',
  curPhotoWithTime: '',
  curPhotoInd: -1,
  curPhotoRotateDeg: 0,
  curDate: getCurDate(),
  opacity: '1',
  visibility: 'visible',
  action: onTogglePhoto.name,
  removedItems: new Set(),
  isNoItems: false,
};