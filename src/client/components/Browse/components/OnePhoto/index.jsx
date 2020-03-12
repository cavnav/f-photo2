import React from 'react';
import { PhotoStatuses } from '../';
import { Help } from '../../..';

import './styles.css';

export function OnePhoto(props) {
  const { photos, curPhotoInd, appState } = props;
  const [state, setState] = React.useState({
    ...stateInit,
    curPhotoInd,
    curPhoto: photos[curPhotoInd],
  });

  let photoStatusesApi;

  React.useEffect(onRender);
  React.useEffect(fitCurPhotoSize, [state.curPhotoInd]);

  return getRender();

  //--------------------------------------------------------------------------
  function getRender() {
    return (
      <div 
        className="OnePhoto fitScreen"
      >
        <img 
          key={state.curPhoto} 
          src={state.curPhoto}        
          style={{
            transform: `rotate(${state.curPhotoRotateDeg}deg)`,
            width: state.curPhotoWidth,
            height: state.curPhotoHeight,
          }} 
        />
        <PhotoStatuses 
          {...state}
          {...props}
          onRenderCb={onRenderPhotoStatuses}
        /> 
        <Help
          toRender={toRenderHelp()}
          {...props}
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
    </div>
  }

  function onRenderPhotoStatuses(api) {
    photoStatusesApi = api;
  }

  function onRender() {
    document.addEventListener('keydown', onKeyDown);

    return () => {
      document.removeEventListener('keydown', onKeyDown);
    };
  }

  function fitCurPhotoSize() {
    const photoEl = document.querySelector(`[src='${state.curPhoto}']`);    
    const { width: curPhotoWidth, height: curPhotoHeight } = getFitSize(photoEl.getBoundingClientRect());

    setState({
      ...state,
      curPhotoWidth,
      curPhotoHeight,
    });
  }

  function onKeyDown(e) {
    const prevPhotoInd = state.curPhotoInd > 0 ? state.curPhotoInd - 1 : 0;
    const nextPhotoInd = state.curPhotoInd < photos.length - 1 ? (state.curPhotoInd + 1) : (photos.length - 1);

    const stateUpd = { ...state };

    switch (e.which) {
      case 49:  photoStatusesApi.addPhotoPrint(); 
                break; 

      case 37:  stateUpd.curPhotoInd = prevPhotoInd;
                stateUpd.curPhoto = photos[prevPhotoInd];
                break; // prev

      case 39:  stateUpd.curPhotoInd = nextPhotoInd; 
                stateUpd.curPhoto = photos[nextPhotoInd];
                break; // next
      case 38: stateUpd.curPhotoRotateDeg = stateUpd.curPhotoRotateDeg + 90; break; // rotate right
      case 40: stateUpd.curPhotoRotateDeg = stateUpd.curPhotoRotateDeg - 90; break; // rotate left
    }

    setState(stateUpd);
  }
}

const stateInit = {
  curPhoto: undefined,
  curPhotoInd: -1,
  curPhotoRotateDeg: 0,
  curPhotoWidth: undefined,
  curPhotoHeight: undefined,
  curDate: getCurDate(),
  forceRender: false,
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
