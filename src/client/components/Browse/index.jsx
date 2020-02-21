import React, { useState, useEffect, useReducer } from 'react';
import { serverApi } from '../../serverApi';
import { curPhotoStatusIcons, CurPhotoStatusIcons } from './constants';

import { set as _set, get as _get } from 'lodash';

import './styles.css';

const stateInit = {
  previewWidth: 100,
  previewHeight: 100,
  curPhotoInd: -1,
  curPhotoRotateDeg: 0,
  componentClass: 'browse',
  curPhotoHeight: undefined,
  curPhotoWidth: undefined,
  addRenderCompleted: false,
  curDate: getCurDate(),
};

export function Browse(props) {
  const {
    printState: propPrintState,
  } = props;

  const [state, setState] = useState(stateInit);
  const [photos, setPhotos] = useState([]);

  const [ignored, forceUpdate] = useReducer(x => !x, false);

  useEffect(() => {
    document.addEventListener('keydown', onKeyDown);

    if (!state.addRenderCompleted && state.curPhotoInd > -1) {
      const curPhoto = document.querySelector(`[src='${photos[state.curPhotoInd]}']`);
      const { width, height } = getFitSize(curPhoto.getBoundingClientRect());
      
      setState({
        ...state, 
        curPhotoHeight: height,
        curPhotoWidth: width,
        addRenderCompleted: true,
      });
    }

    return () => {
      document.removeEventListener('keydown', onKeyDown);
    };
  });

  useEffect(() => {
    serverApi({
      props: {
        url: 'browsePhotos'
      }
    })
    .then(res => res.json())
    .then((res) => {
      setPhotos(res.photos);
    });
  }, []);

  let toRender = null;

  if (state.curPhotoInd === -1) {
    toRender = photos.map((photo, ind) => {
      return (
        <div 
          key={photo}
          className='fitPreview100'
          style={{ 'backgroundImage': `url(${photo})` }}
          ind={ind} 
          src={photo}
        >
        </div>
      );
    });
  }
  if (state.curPhotoInd !== -1) {
    const photo = photos[state.curPhotoInd];
    toRender = (
      <img 
        key={photo} 
        src={photo}        
        style={{
          transform: `rotate(${state.curPhotoRotateDeg}deg)`,
          width: state.curPhotoWidth,
          height: state.curPhotoHeight,
        }} 
        ind={state.curPhotoInd} 
      />
    );
  }

  return (
    <div className={state.componentClass} onDoubleClick={onDblClickPhoto}>
      { toRender }

      { renderCurPhotoStatus() }    
    </div>    
  );

  // --------------------------------------------------------------------
  function onDblClickPhoto(e) {
    const curPhoto = e.target;
    const { width, height } = getFitSize(curPhoto.getBoundingClientRect());
    
    setState({
      ...state,
      curPhotoHeight: height,
      curPhotoWidth: width,
      curPhotoInd: +e.target.getAttribute('ind'),
      componentClass: 'fitScreen',
    });
  }

  function onKeyDown(e) {
    const prevPhotoInd = state.curPhotoInd > 0 ? state.curPhotoInd - 1 : 0;
    const nextPhotoInd = state.curPhotoInd < photos.length - 1 ? (state.curPhotoInd + 1) : (photos.length - 1);
    
    const stateUpd = { ...state };
    switch (e.which) {
      case 32: addPhotoPrint(); break; 

      case 37: stateUpd.curPhotoInd = prevPhotoInd; break; // prev
      case 39: stateUpd.curPhotoInd = nextPhotoInd; break; // next
      case 38: stateUpd.curPhotoRotateDeg = stateUpd.curPhotoRotateDeg + 90; break; // rotate right
      case 40: stateUpd.curPhotoRotateDeg = stateUpd.curPhotoRotateDeg - 90; break; // rotate left
    }

    setState(stateUpd);
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

  function getCurPhoto() {
    return photos[state.curPhotoInd];
  }

  function addPhotoPrint() {    
    let propPrintStateUpd = propPrintState;
    const curPhoto = getCurPhoto();
    const path = [state.curDate, curPhoto];
    const statusUpd = _get(propPrintStateUpd, path, new CurPhotoStatusIcons());
    statusUpd.toPrint = statusUpd.toPrint === 0 ? 1 : 0;
    _set(propPrintStateUpd, path, statusUpd);

    forceUpdate();
  }

  function renderCurPhotoStatus() {
    const statuses = _get(propPrintState, [state.curDate, getCurPhoto()]);
    return (state.curPhotoInd === -1 || statuses === undefined) ? null : (
      <div className="curPhotoStatusIcons">
        { Object.entries(statuses)
          .filter(([status, count]) => count)
          .map(([status]) => (
            <img key={status} width="16" height="16" src={`public/${status}.png`} />
          )) 
        }
      </div>
    );
  }
}

function getCurDate() {
  const dateISO = new Date().toISOString();
  return dateISO.slice(0, dateISO.indexOf('T'));
}
