import React from 'react';
import { PhotoStatuses } from '..';
import { Help } from '..';

import { additionalActions, } from '../../constants';
import { Dialog } from '../';
import { ResumeObj } from '../../resumeObj';
import { myArray, useMyReducerWithPropsUpdated } from '../../functions';

import './styles.css';

const resumeObj = new ResumeObj({
  compName: OnePhoto.name,
});

export function OnePhoto({
  channel,
  doNeedHelp, 
  files,
  curPhotoInd,
  server,
  setBrowseState,
  
  PhotoStatusesAPI,
  BrowseAPI,
}) {  
  const [forceUpdate] = React.useReducer((x) => !x, false).slice(1);
  const selfReducer = React.useMemo(
    () => getSelfReducer({
      files,
    }),
    []
  );

  const [state, setState] = useMyReducerWithPropsUpdated({
    reducer: selfReducer,
    propsUpdated: {
      curPhotoInd,
    },
    initState: {
      ...resumeObj.load({
        props: {
          ...stateInit,          
        }
      }),
    }, 
  });

  Object.assign(
    OnePhoto,
    {
      state,
      setState,
      files,
      forceUpdate,
    }
  );

  const onDialogRemoveCancel = React.useCallback(() => {
    setState({
      isDialogRemoveItem: false,
    });
  }, [state]);

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
        setItSilent: function () { 
          this.curPhotoInd = state.curPhotoInd; 
        }
      });
    }
  });

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
              src={state.curPhotoWithTime}        
              style={{
                transform: `rotate(${state.curPhotoRotateDeg}deg)`,
                width: state.curPhotoWidth,
                height: state.curPhotoHeight,
                opacity: state.opacity,
                visibility: state.visibility,
              }} 
            />
            <PhotoStatuses 
              { ...channel.essentials(PhotoStatuses) }
              curPhoto={state.curPhoto}
            />
          </>
        )}
        <Help
          toRender={toRenderHelp()}
          {...{doNeedHelp}}
        />
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
    const { width: curPhotoWidth, height: curPhotoHeight } = getFitSize(photoEl.getBoundingClientRect());

    setState({
      ...state,
      curPhotoWidth,
      curPhotoHeight,
    });
  }

  function onKeyDown(e) {
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

function getSelfReducer({
  files,
}) {
  return function selfReducer(
    state,
    newState,
  ) {

    const stateUpd = { 
      ...state,
      ...newState,
    };

    const stateReduced = {
      curPhoto: files.items[stateUpd.curPhotoInd],   
    };
    Object.assign(
      stateReduced,
      {
        isNoItems: stateReduced.curPhoto ? false : true,
      },
      {
        [stateUpd.action]: {},
        [onTogglePhoto.name]: {
          curPhotoWithTime: stateReduced.curPhoto,
          opacity: '0',
          visibility: 'hidden',
          curPhotoRotateDeg: 0,
        },
        [onImgServerRotate.name]: {
          curPhotoRotateDeg: 0,
          curPhotoWithTime: `${files.items[stateUpd.curPhotoInd]}?${new Date().getTime()}`,
          opacity: '0',
          visibility: 'hidden',
        },
      }[stateUpd.action]
    );
    
    Object.assign(
      stateUpd, 
      stateReduced
    );

    resumeObj.save(stateUpd);

    return stateUpd;
  };
}

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

OnePhoto.getReqProps = ({ channel }) => { 

  const ch = channel.crop({
    s: {
      appState: { 
        doNeedHelp: 1 
      },
      photosState: {
        files: 1,
      },
      browseState: {
        curPhotoInd: 1,
      },
    },
    d: {
      setBrowseState: 1,
    },
    API: {
      comps: {
        server: 1,
        PhotoStatuses: 'PhotoStatusesAPI',
        Browse: 'BrowseAPI',
      },
    }
  }); 

  ch.files = myArray({
    items: ch.files
  });
  return ch;
};

OnePhoto.getAPI = ({
  channel,
}) => {
  const props = channel.crop({
    API: {
      comps: {
        server: 1,
      }
    }
  });

  return {
    removeItems(
      {} = {}
    ) {
      if (OnePhoto.state.isDialogRemoveItem === false) {
        OnePhoto.setState({
          isDialogRemoveItem: true,
        });
        return;
      }  

      if (!OnePhoto.state.curPhoto) return;

      props.server.removeItems({
        items: [OnePhoto.state.curPhotoWithTime],
      });
    
      OnePhoto.files.delete(OnePhoto.state.curPhotoInd);

      const stateUpd = {
        action: onTogglePhoto.name,
        isDialogRemoveItem: false,
      };
      
      if (OnePhoto.files.items.length === OnePhoto.state.curPhotoInd) {
        stateUpd.curPhotoInd = OnePhoto.state.curPhotoInd - 1;
      }
      
      OnePhoto.setState(
        stateUpd,
      );

      OnePhoto.forceUpdate();

      BrowseAPI.changeSelections({
        src: OnePhoto.state.curPhoto,
        checked: false,
      });
    }
  };
};

const stateInit = {
  loading: false,
  progress: 100,
  isDialogRemoveItem: false,
  curPhoto: undefined,
  curPhotoWithTime: undefined,
  curPhotoInd: -1,
  curPhotoWidth: undefined,
  curPhotoHeight: undefined,
  curPhotoRotateDeg: 0,
  curDate: getCurDate(),
  opacity: '1',
  visibility: 'visible',
  action: onTogglePhoto.name,
  removedItems: new Set(),
  isNoItems: false,
};
