import React, { useState, useEffect } from 'react';
import { Progress, } from 'antd';
import { serverApi } from '../../serverApi';

import 'antd/dist/antd.css';
import './styles.css';

export function Copy(props) {
  const stateInit = {
    copyProgress: 0,
    countNewPhotos: 0,
    isInfo: false,
  };

  const [state, setState] = useState(stateInit);

  React.useEffect(() => {
    getNewPhotos();
  }, []);

  let content;
  if (state.isInfo) {
    const steps = createSteps();

    content = <Stepper 
      steps={steps}
    />;
  }
  
  return (
    <div className="copy">      
      { content }
    </div>
  );

  // ----------------------------------------------------------------------------------
  function createSteps() {
    return [
      {
        photoSrc: 'public/wizardCopy/001_getOutMemCard.jpg',
        desc: 'нажми пальцем на синюю карту памяти, и, вдавив внутрь, отпусти.',
      }, {
        photoSrc: 'public/wizardCopy/002_insertIntoCardReader.jpg',
        desc: 'Вставь карту памяти в кардРидер, как показано ниже:',
      }, {
        photoSrc: 'public/wizardCopy/004_plugInPC.jpg',
        desc: 'Вставь кардРидер в системный блок, как показано ниже, чтобы совпал ключ.',
      }, {    
        toRender: ({key, step}) => <div className="flex flexDirColumn" key={key}>
            Количество новых фото:
            { state.countNewPhotos }
            <input type="button" onClick={onCopy} value="Копировать" />
            <Progress type="circle" percent={state.copyProgress} />
          </div>,        
      }, {
        photoSrc: 'public/wizardCopy/005_returnMemCardInPhoto.jpg',
        desc: 'После завершения копирования вытащить карту памяти из кардРидера и всавить обратно в фотоаппарат до щелчка, как показано ниже:',
      }
    ];
  }

  function getNewPhotos() {
    serverApi({
      props: {
        url: 'getNewPhotos'
      }
    })
      .then(res => res.json())
      .then((res) => {
        setState({
          ...state,
          countNewPhotos: res.countNewPhotos,
        });
      });
  }

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
