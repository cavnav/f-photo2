import React from 'react';
import { PhotoStatuses } from '..';
import { Help } from '..';
import { additionalActions, } from '../../constants';
import { Dialog } from '../';
import { ResumeObj } from '../../resumeObj';
import { myArray, objCrop, useMyReducer } from '../../functions';
import { channel } from '../../Channel';

import { Browse } from '../Browse/Browse';
import './styles.css';

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
    appState, 
    files,
    curPhotoInd,
    server,
    setBrowseState,
    path,
    PhotoStatusesAPI,
  } = OnePhotoComp.reqProps;

  const myFiles = React.useMemo(() => myArray({
    items: files,
  }),
  []
  );

  const [props] = React.useState({
    curPhotoInd,
    files: myFiles,
    path,
  });

  const [state, setState] = useMyReducer({
    reducer: selfReducer,
    props,
    initialState: {
      ...resumeObj.load({
        props: {
          ...stateInit,          
        }
      }),
    }, 
  });

  Object.assign(
    OnePhotoComp.deps,
    {
      state,
      setState,
      files: state.files,
    }
  );

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
      setBrowseState({
        forceUpdate: false,
        curPhotoInd: state.curPhotoInd,
      });
    }
  }, [state.curPhotoInd]);

  return getRender();

  //--------------------------------------------------------------------------
  function getRender() {
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
              curPhoto={state.curPhoto}
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
    const stateUpd = {};

    switch (e.which) {  
      case 13: // enter.
        PhotoStatusesAPI.changeShareStatus();
        break;

      case 32:  // Space
        PhotoStatusesAPI.changePrintStatus(); 

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
        stateUpd.curPhotoRotateDeg = checkRotate({ deg: state.curPhotoRotateDeg + 90 }); 

        break; 

      case 40: 
        stateUpd.curPhotoRotateDeg = checkRotate({ deg: state.curPhotoRotateDeg - 90 });              
        
        break; // rotate left
    }

    setState(stateUpd);

    changeAddActions();

    // ---------------------------

    function checkRotate({ deg }) {
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

function selfReducer(
  state,
  stateUpd,
) {

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

  resumeObj.save(stateReduced);

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
        curPhotoRotateDeg: 0,
        curPhotoWithTime: `${curPhoto}?${new Date().getTime()}`,
        opacity: '0',
        visibility: 'hidden',
      },
    }[stateReduced.action];
  }
};

function getCurDate() {
  const dateISO = new Date().toISOString();
  return dateISO.slice(0, dateISO.indexOf('T'));
}

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
  const props = channel.crop({
    s: {
      appState: 1,
      photosState: {
        files: 1,
      },
      browseState: {
        curPhotoInd: 1,
        path: 1,
      },
    },
    d: {
      setBrowseState: 1,
    },
    API: {
      comps: {
        server: 1
      }
    },
    comps: {
      [PhotoStatuses.name]: {
        API: 'PhotoStatusesAPI',
      },
      [Browse.name]: {
        API: 'BrowseAPI',
      }
    },
  }); 
  
  return props;
};

function getAPI({  
  deps,
  reqProps,
}) {
  return {
    removeItems(
      {} = {}
    ) {
      const {
        state,
        setState,
        files,
      } = deps;
      const {
        BrowseAPI,
        server,
      } = reqProps;

      if (state.isDialogRemoveItem === false) {
        setState({
          isDialogRemoveItem: true,
        });
        return;
      }  

      if (!state.curPhoto) return;

      server.removeItems({
        items: [state.curPhotoWithTime],
      }).then(() => {
        files.delete(state.curPhotoInd);

        const stateUpd = {
          action: onTogglePhoto.name,
          isDialogRemoveItem: false,
        };
        
        if (files.items.length === state.curPhotoInd) {
          stateUpd.curPhotoInd = state.curPhotoInd - 1;
        }
        
        setState(
          stateUpd,
        );

        BrowseAPI.changeSelections({
          src: state.curPhoto,
          checked: false,
        });  
      });
    }
  };
};

const stateInit = {
  files: {},
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
