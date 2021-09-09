import './styles.css';

import React from 'react';
import { Actions, AdditionalPanel, PhotoStatuses } from '..';
import { Dialog } from '../';
import { ResumeObj } from '../../resumeObj';
import { getStateInit, myArray, refreshOppositeWindow, useMyReducer } from '../../functions';
import { channel } from '../../Channel';
import { MoveSelections } from '../';
import { getCurDate } from '../../functions';
import { Label } from '../Label/Label';
import { getAppAPI } from '../../App';

export const OnePhoto = channel.addComp({
  name: 'OnePhoto',
  render,
  getAPI,
  getReqProps,
});

const resumeObj = new ResumeObj({
  selector: [
    window.name,
    OnePhoto.name,
  ],
});

const ExitFromOnePhoto = Label.clone({ compId: 'ExitFromOnePhoto '});
const additionalActions = {
  ExitFromOnePhoto,
  // RemoveSelections,
  // MoveSelections,
};

function render(
  {}
) { 
  const Comp = this;
  const {
    resumeBrowse,
    server,
  } = Comp.getReqProps();
  const myFiles = React.useMemo(() => myArray({
      items: resumeBrowse.files,
    }),
    []
  );

  const [state, setState] = useMyReducer({
    reducer: selfReducer,
    setCompDeps: Comp.bindSetCompDeps(),
    initialState: selfReducer({
      state: {
        ...getStateInit({
          resumeObj,
          stateDefault: stateInit,
        }),
        files: myFiles,
        curPhotoInd: resumeBrowse.curPhotoInd,   
      }, 
    }),
  });

  const onDialogRemoveCancel = React.useCallback(() => {
    setState({
      isDialogRemoveItem: false,
    });
  }, []);

  const imgRef = React.useRef(null);

  React.useEffect(addKeyDownListener);
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
    const {
      BrowseAPI,
    } = Comp.getReqProps();
    if (state.action === onTogglePhoto.name) {
      BrowseAPI.setToResumeObj({
        val: {
          curPhotoInd: state.curPhotoInd,
        },
      });
    }
  }, [state.curPhotoInd]);

  React.useEffect(() => {
    console.log('OnePhoto mount')
    const rp = Comp.getReqProps();
    rp.AdditionalPanelAPI.renderIt({
      actions: Object.values(additionalActions),
    })
    .then(() => {
      rp.ExitFromOnePhotoAPI.forceUpdate({
        title: 'Вернуться в альбом',
        onClick: () => {
          rp.AppAPI.toggleActions({
            action: Actions.Browse.name,
            actions: {
              [OnePhoto.name]: {
                isEnabled: false,
              },
              [Actions.Browse.name]: {
                isEnabled: true,
              },
            }
          });  
        },
      });
    }); 
    
    return () => {
      const rp = Comp.getReqProps();
      rp.AdditionalPanelAPI.renderIt({
        actions: [],
      });
    };
  }, []);


  return getRender();

  //--------------------------------------------------------------------------
  function getRender() {
    const rp = Comp.getReqProps();
    const {
      resumeBrowse,
    } = rp;
    const id = `${resumeBrowse.path}${resumeBrowse.sep}${state.curPhoto}`;
    return (
      <div 
        className="OnePhoto fitScreen"
      >
        { state.isNoItems === false && (
          <>
            <img 
              ref={imgRef}
              src={`${resumeBrowse.path}/${state.curPhotoWithTime}`}        
              style={{
                transform: `rotate(${state.curPhotoRotateDeg}deg)`,
                opacity: state.opacity,
                visibility: state.visibility,
              }} 
              onLoad={fitCurPhotoSize}
            />
            <PhotoStatuses.r 
              id={id}
            />
          </>
        )}        
        {state.isDialogRemoveItem && (
          <Dialog.r
            type={Dialog.RemoveItems}   
            onCancel={onDialogRemoveCancel}    
          >          
          </Dialog.r>
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

  function fitCurPhotoSize(e) {   
    Object.assign(
      e.target.style,
      getFitSize(e.target.getBoundingClientRect()),
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
    const rp = Comp.getReqProps();
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
  stateUpd = {},
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
    val: stateReduced
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
  return {
    width: 'auto',
    height: '100%',
  };
}

function onTogglePhoto() {
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
}) {}

function getReqProps({ channel }) { 
  const props = channel.crop(
    {    
      API: {
        comps: {
          server: 1,
        },
      },
    },
  ); 
  
  const BrowseAPI = Actions.Browse.getAPI();

  return {
    ...props,
    
    AppAPI: getAppAPI(),
    ExitFromOnePhotoAPI: ExitFromOnePhoto.getAPI(),
    PhotoStatusesAPI: PhotoStatuses.getAPI(),
    BrowseAPI,
    AdditionalPanelAPI: AdditionalPanel.getAPI(),
    resumeBrowse: BrowseAPI.getResumeObj({
      selector: {
        files: 1,
        path: 1,
        sep: 1,
        curPhotoInd: 1,
      },
    }),
  };
};

function getAPI({  
  deps,
}) {
  return {
    removeSelections(
      {} = {}
    ) {
      const {
        state,
        setState,
      } = deps;
      const {
        server,
      } = OnePhoto.getReqProps();

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
    },
  };

  function moveSelections() {
    const rp = OnePhoto.getReqProps();
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
    } = deps;
    const rp = OnePhoto.getReqProps();

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
  resumeBrowse: {},
};

