import React from 'react';
import { PhotoStatuses } from '..';
import { Help } from '..';

import './styles.css';
import { tempReducer } from '../../functions';
import { serverApi } from '../../serverApi';
import { additionalActions } from '../../constants';

export function OnePhoto(props) {
  const { dispatch, states, channel } = props;
  const { browseState, photosState, printState, appState } = states;
  const { files } = photosState;
  const { curPhotoInd } = browseState;
  const { doNeedHelp } = appState;

  const { setBrowseState } = dispatch;

  const [state, setState] = React.useReducer(tempReducer(), {
    ...stateInit,
    curPhotoInd,
    curPhoto: files[curPhotoInd],
  });

  const { curDate, curPhoto } = state;
  const imgRef = React.useRef(null);

  let photoStatusesApi;

  React.useEffect(addKeyDownListener);
  React.useEffect(fitCurPhotoSize, [state.curPhotoInd]);

  return getRender();

  //--------------------------------------------------------------------------
  function getRender() {
    return (
      <div 
        className="OnePhoto fitScreen"
      >
        <img 
          ref={imgRef}
          src={state.curPhoto}        
          style={{
            transform: `rotate(${state.curPhotoRotateDeg}deg)`,
            width: state.curPhotoWidth,
            height: state.curPhotoHeight,
          }} 
        />
        <PhotoStatuses 
          {...{curDate, curPhoto, printState}}
          onRenderCb={onRenderPhotoStatuses}
        /> 
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
      case 49:  photoStatusesApi.changeStatusPhotoPrint(); 
                break; 

      case 37:  stateUpd.curPhotoInd = prevPhotoInd;
                stateUpd.curPhoto = files[prevPhotoInd];
                break; // prev

      case 39:  stateUpd.curPhotoInd = nextPhotoInd; 
                stateUpd.curPhoto = files[nextPhotoInd];
                break; // next

      case 38: stateUpd.curPhotoRotateDeg = checkRotate({ deg: state.curPhotoRotateDeg + 90 }); 
              break; // rotate right
      case 40: stateUpd.curPhotoRotateDeg = checkRotate({ deg: state.curPhotoRotateDeg - 90 }); 
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
      Object.keys(stateUpd).map(prop => trigger(prop));

      // ---------------------------------------

      function trigger(tName) {
        const triggers = {
          [tName]: () => {},
          curPhotoRotateDeg: onRotate,
        };

        triggers[tName]();
      }
    
      function onRotate() {
        channel.API.AdditionalPanel.changeAction({
          action: additionalActions.SaveChanges,
          set: {
            isActive: stateUpd.curPhotoRotateDeg !== 0,
          },
          onAction: {
            
          }
        });
      }
      // toggleAddActions({
      //   component: OnePhoto,
      //   action: additionalActions.SaveChanges,
      //   isActive: state.curPhotoRotateDeg !== 0,
      //   fn: serverApi.imgRotate({}),
      // });
    }
  }
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

const stateInit = {
  curPhoto: undefined,
  curPhotoInd: -1,
  curPhotoWidth: undefined,
  curPhotoHeight: undefined,
  curPhotoRotateDeg: 0,
  curDate: getCurDate(),
  forceRender: false,
};

const navLink = [stateInit,];
