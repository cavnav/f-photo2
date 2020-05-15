import React, { useState, useEffect, useReducer, useRef } from 'react';
import { Help, Views } from '..';
import { tempReducer } from '../../functions';

import './styles.css';

export function Browse(props) {
  const { dispatch, states, myStore } = props;
  const { appServerAPI, setBrowseState, setAppState, } = dispatch;
  const { appState, photosState, browseState } = states;
  const {
    files,
    dirs
  } = photosState;
 
  const [state, setState] = useReducer(tempReducer(), stateInit);
  
  const { doNeedHelp } = appState;

  const { curPhotoInd } = browseState;

  useEffect(onRender, []);

  return getRender();

  // --------------------------------------------------------------------
  function getRender() {
    return (
      <div 
          className='Browse' 
        >
        { getDirsToRender() }
        { getFilesToRender() }   

        <Help
          toRender={toRenderHelp()}
          {...{doNeedHelp}}
        />
      </div>
    );
  }

  function onRender() {
    appServerAPI.toward();
    const curPhotoEl = document.querySelector(`.Browse .file[ind='${curPhotoInd}']`);
    if (curPhotoEl) {
      curPhotoEl.scrollIntoView();
      curPhotoEl.classList.add('curFile');
    }

  }

  function toRenderHelp() {
    return <div className="flexCenter marginBottom10">
      Открыть альбом<br></br>
      Закрыть альбом<br></br>
      Рассмотреть фото<br></br>
      Вернуть фото в альбом.<br></br>

    </div>
  }

  function getDirsToRender() {
    return dirs.map(dir => {
      return (
        <div 
          key={dir}
          name={dir}
          className="fitPreview100 dir"
          onClick={onClickDir}
        >{dir}</div>
      );
    });
  }

  function onClickDir(e) {
    const subdir = e.target.getAttribute('name');
    appServerAPI.toward({ subdir });
  }

  function onClickFile(e) {
    setBrowseState({      
      curPhotoInd: +e.target.getAttribute('ind'),
    });

    setAppState({
      view: Views.OnePhoto,
    })
  }

  function getFilesToRender() {
    return files.map((file, ind) => {
      return (
        <div 
          key={file}
          className='fitPreview100 file'
          style={{ 'backgroundImage': `url(${file})` }}
          ind={ind} 
          src={file}
          onClick={onClickFile}
        >
        </div>
      );
    });
  }  
}

const stateInit = {
  previewWidth: 100,
  previewHeight: 100,
};
