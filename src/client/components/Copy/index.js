import React, { useState, useEffect } from 'react';
import { Progress } from 'antd';
import { serverApi } from '../../serverApi';

import 'antd/dist/antd.css';
import './styles.css';

export function Copy({ props }) {
  const stateInit = {
    isCountGetted: false,
    copyProgress: 0,
    countNewPhotos: 0,
  };

  const [state, setState] = useState(stateInit);

  !state.isCountGetted && serverApi({
    props: {
      url: 'getNewPhotos'
    }
  })
    .then(res => res.json())
    .then((res) => {
      setState({
        ...state,
        countNewPhotos: res.countNewPhotos,
        isCountGetted: true,
      });
    });

  return (
    <div className="copy">
      Открой крышку и нажми пальцем на синюю карту памяти, вдавив внутрь, отпусти.
      <img src="public/wizardCopy/001_getOutMemCard.jpg"></img><br />

      Вставить карту памяти в кардРидер, как показано ниже:
      <img src="public/wizardCopy/002_insertIntoCardReader.jpg"></img><br />
    
      Вставить кардРидер в системный блок, как показано ниже, чтобы совпал ключ.
      <img src="public/wizardCopy/004_plugInPC.jpg"></img><br />
      
      <div className="flex flexDirColumn">
        Количество новых фото:
        { state.countNewPhotos }
        <input type="button" onClick={onCopy} value="Копировать" />
        <Progress type="circle" percent={state.copyProgress} />
      </div>

      После завершения копирования вытащить карту памяти из кардРидера и всавить обратно в фотоаппарат до щелчка, как показано ниже:
      <img src="public/wizardCopy/005_returnMemCardInPhoto.jpg" /><br />
    </div>
  );

  // ------------------------------------------------------------------
  function onCopy() {
    serverApi({
      props: {
        url: 'copyPhotos',
        userDirName: 'The quick brown fox jumps over the lazy dog'
          .replace(' ', '')
          .slice(Math.random() * 15, Math.random() * 15) || 'one'
      }
    }).then((res) => {
      checkCopyProgress();
    });
  }

  function checkCopyProgress() {
    serverApi({
      props: {
        url: 'checkCopyProgress',
      }
    })
      .then(res => res.json())
      .then((res) => {
        setTimeout(() => (res.copyProgress === 100 ? null : checkCopyProgress()), 500);
        console.log(333, res.copyProgress);
        setState({
          ...state,
          copyProgress: res.copyProgress,
        });
      });
  }
}
