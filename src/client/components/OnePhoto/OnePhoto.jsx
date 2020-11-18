import React from 'react';
import { PhotoStatuses } from '..';
import { Help } from '..';

import { additionalActions, } from '../../constants';
import { Dialog } from '../';
import { ResumeObj } from '../../resumeObj';
import { useMyReducerWithPropsUpdated } from '../../functions';

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
  PhotoStatusesAPI,
  setBrowseState,
}) {

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
      curPhoto: files[curPhotoInd],
      curPhotoWithTime: files[curPhotoInd],
    },
    initState: {
      ...resumeObj.load({
        props: {
          ...stateInit,          
        }
      }),
    }, 
  });

  const imgRef = React.useRef(null);

  React.useEffect(addKeyDownListener);
  React.useEffect(fitCurPhotoSize, [state.curPhotoInd]);
  React.useEffect(() => {
    if ({
      onTogglePhoto: 1, 
      onImgServerRotate: 1
    }[state.action] === undefined) return;

    setTimeout(() => {
      imgRef.current.style.visibility = 'visible';
      imgRef.current.style.opacity = '1';
    }, 1000);
  });

  return getRender();

  //--------------------------------------------------------------------------
  function getRender() {
    return (
      <div 
        className="OnePhoto fitScreen"
      >
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
        <Help
          toRender={toRenderHelp()}
          {...{doNeedHelp}}
        />
        <Dialog 
          isEnabled={state.isDialogRemove}
          onCancel={onCancelRemove}
        >
          <div>Удалить фото? Нажми еще раз.</div>
        </Dialog>
      </div>
    );
  }

  function onCancelRemove() {
    setState({
      isDialogRemove: false,
    });
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
    const { width: curPhotoWidth, height: curPhotoHeight } = getFitSize(photoEl.getBoundingClientRect());

    setState({
      ...state,
      curPhotoWidth,
      curPhotoHeight,
    });
  }

  function onKeyDown(e) {
    const prevPhotoInd = state.curPhotoInd > 0 ? state.curPhotoInd - 1 : 0;
    const nextPhotoInd = state.curPhotoInd < files.length - 1 ? (state.curPhotoInd + 1) : (files.length - 1);

    const stateUpd = {};

    switch (e.which) {
      case 48: // 0
        if (state.isDialogRemove) {
          stateUpd.curPhotoRemove = state.curPhoto;
          stateUpd.isDialogRemove = false;

          onToggleNextPhoto();

          break;
        }  
        stateUpd.isDialogRemove = true;
        break;

      case 13: // enter.
        PhotoStatusesAPI.changeShareStatus();
        break;

      case 32:  // Space
        PhotoStatusesAPI.changePrintStatus(); 

        break; 

      case 37: // prev 
        stateUpd.curPhotoInd = prevPhotoInd;
        stateUpd.curPhoto = files[prevPhotoInd];
        stateUpd.curPhotoRotateDeg = 0;
        stateUpd.action = onTogglePhoto.name;

        break; 

      case 39: // next
        onToggleNextPhoto();
        break;

      case 38: // rotate right
        stateUpd.curPhotoRotateDeg = checkRotate({ deg: state.curPhotoRotateDeg + 90 }); 

        break; 

      case 40: 
        stateUpd.curPhotoRotateDeg = checkRotate({ deg: state.curPhotoRotateDeg - 90 });              
        
        break; // rotate left
    }

    setState(stateUpd);
    setBrowseState({
      setItSilent: function () { this.curPhotoInd = stateUpd.curPhotoInd; }
    });

    changeAddActions();

    // ---------------------------
    function onToggleNextPhoto() {
      stateUpd.curPhotoInd = nextPhotoInd; 
      stateUpd.curPhoto = files[nextPhotoInd];
      stateUpd.curPhotoRotateDeg = 0;
      stateUpd.action = onTogglePhoto.name;
    }

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
          curPhotoRemove: onImgServerRemove,
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
  return (
    state,
    newState,
  ) => {
    const stateUpd = { 
      ...state,
      ...newState,
    };
    const {
      action,
      curPhoto,
      curPhotoInd,
    } = stateUpd;

    const stateReduced = {
      [action]: {},
      onTogglePhoto: {
        curPhotoWithTime: curPhoto,
        opacity: '0',
        visibility: 'hidden',
        curPhotoRemove: undefined,
        isDialogRemove: false,
      },
      onImgServerRotate: {
        curPhotoRotateDeg: 0,
        curPhotoWithTime: `${files[curPhotoInd]}?${new Date().getTime()}`,
        opacity: '0',
        visibility: 'hidden',
      },
    }[action];

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
function onImgServerRemove({
  server,
  stateUpd: { 
    curPhotoRemove,
  },
  setState,
}) {
  server.$remove({
    file: curPhotoRemove,
  })
  .then(res => {
    setState({
      action: onImgServerRemove,
    });
    additionalActions.SaveChanges.reset();
  }) 
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
      },
    }
  }); 
  return ch;
};

const stateInit = {
  curPhoto: undefined,
  curPhotoWithTime: undefined,
  curPhotoInd: -1,
  curPhotoWidth: undefined,
  curPhotoHeight: undefined,
  curPhotoRotateDeg: 0,
  curPhotoRemove: undefined,
  isDialogRemove: false,
  curDate: getCurDate(),
  opacity: '1',
  visibility: 'visible',
  action: {},
};
