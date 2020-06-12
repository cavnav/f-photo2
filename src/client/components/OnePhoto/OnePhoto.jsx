import React from 'react';
import { PhotoStatuses } from '..';
import { Help } from '..';

import './styles.css';
import { additionalActions, } from '../../constants';

export function OnePhoto({
  doNeedHelp, 
  files,
  curPhotoInd,
  server,

  setBrowseState,
}) {
  
  const [state, setState] = React.useReducer(
    getSelfReducer({
      files,
    }), {
      ...stateInit,
      curPhotoInd,
      curPhoto: files[curPhotoInd],
      curPhotoWithTime: files[curPhotoInd],
    }, 
  );

  const [forceUpdated, forceUpdate] = React.useReducer(x => !x);

  const imgRef = React.useRef(null);

  let photoStatusesApi;

  React.useEffect(addKeyDownListener);
  React.useEffect(fitCurPhotoSize, [state.curPhotoInd]);
  React.useEffect(() => {
    if ({
      onTogglePhoto: 1, 
      onImgServerRotate: 1
    }[state.action.name] === undefined) return;

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
        {/*<PhotoStatuses 
          {...{curDate, curPhoto, printState}}
          onRenderCb={onRenderPhotoStatuses}
        /> */}
        <Help
          toRender={toRenderHelp()}
          {...{doNeedHelp}}
        />
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

  function onRenderPhotoStatuses(api) {
    photoStatusesApi = api;
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
      case 49:  
        photoStatusesApi.changeStatusPhotoPrint(); 

        break; 

      case 37:  
        stateUpd.curPhotoInd = prevPhotoInd;
        stateUpd.curPhoto = files[prevPhotoInd];
        stateUpd.curPhotoRotateDeg = 0;
        stateUpd.action = onTogglePhoto;

        break; // prev

      case 39: 
        stateUpd.curPhotoInd = nextPhotoInd; 
        stateUpd.curPhoto = files[nextPhotoInd];
        stateUpd.curPhotoRotateDeg = 0;
        stateUpd.action = onTogglePhoto;

        break; // next

      case 38: 
        stateUpd.curPhotoRotateDeg = checkRotate({ deg: state.curPhotoRotateDeg + 90 }); 

        break; // rotate right

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
      action: {
        name: actionName,
      },
      curPhoto,
      curPhotoInd,
    } = stateUpd;

    return Object.assign(stateUpd, {
        [actionName]: {},
        onTogglePhoto: {
          curPhotoWithTime: curPhoto,
          opacity: '0',
          visibility: 'hidden',
        },
        onImgServerRotate: {
          curPhotoRotateDeg: 0,
          curPhotoWithTime: `${files[curPhotoInd]}?${new Date().getTime()}`,
          opacity: '0',
          visibility: 'hidden',
        },
      }[actionName],
    )
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
function onImgServerRemove({}) {

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
}) {
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
  return {
    ...channel.crop({
      s: {
        appState: { doNeedHelp: 1 },
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
        server: 1,
      }
    }),
  };  
};

OnePhoto.getAPI = () => {
  return {
  };
};

const stateInit = {
  curPhoto: undefined,
  curPhotoWithTime: undefined,
  curPhotoInd: -1,
  curPhotoWidth: undefined,
  curPhotoHeight: undefined,
  curPhotoRotateDeg: 0,
  curDate: getCurDate(),
  opacity: '1',
  visibility: 'visible',
  action: {},
};

const navLink = [stateInit, OnePhoto.getReqProps, OnePhoto.getAPI];
