import React, { useState, useEffect, useReducer, useRef } from 'react';
import { Help, Views } from '..';
import { tempReducer } from '../../functions';

import './styles.css';

export function Browse({
  doNeedHelp,
  curPhotoInd,
  files,
  dirs,

  setAppState,
  setBrowseState,
  setServerToward,
  tempReducer,
}) {
  const [state, setState] = useReducer(tempReducer, stateInit);

  useEffect(onRender, []);
  useEffect(boostPerfImgRender, [files]);

  return getRender();

  // --------------------------------------------------------------------
  function getRender() {
    return (
      <div 
          className={`${Browse.name}`}
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
    setServerToward();
    const curPhotoEl = document.querySelector(`.${Browse.name} .file[ind='${curPhotoInd}']`);
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
    setServerToward({ subdir });
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
          className='fitPreview100 file scrollwait'
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

function boostPerfImgRender() {
  const observer = new IntersectionObserver(cb, { threshold: 1 });
  const elements = [...(document.querySelectorAll(`.${Browse.name} .scrollwait`) || [])];
  const observe = observer.observe.bind(observer);
  elements.map(observe);

  return () => { observer.disconnect(); }

  // ------
  function cb(entries) {
    const unobserve = observer.unobserve.bind(observer);
    entries.map(e => {
      e.target.classList.remove('scrollwait');
      unobserve(e.target);
    });
  }
}

// -------------------------------------------------------

Browse.getReqProps = ({ channel }) => {
  return channel.crop({
    s: { 
      appState: { 
        doNeedHelp: 1, 
      },
      photosState: { 
        files: 1,
        dirs: 1,
      },
      browseState: {
        curPhotoInd: 1,
      },
    },
    d: {
      setAppState: 1,
      setBrowseState: 1,
    },
    API: {
      server: {
        toward: 'setServerToward',
      },
    },
  });
};


const stateInit = {
  previewWidth: 100,
  previewHeight: 100,
};
