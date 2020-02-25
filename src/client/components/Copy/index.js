import React, { useState, useEffect } from 'react';
import { Progress, } from 'antd';
import { serverApi } from '../../serverApi';

import 'antd/dist/antd.css';
import './styles.css';

export function Copy({ props }) {
  const stateInit = {
    isCountGetted: false,
    stepNum: 0,
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

  const arr = [
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
      toRender: <div className="flex flexDirColumn">
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

  const step = createStep();

  return (
    <div className="copy">      
      { step }
      <input type="button" onClick={onClickNextStep} value="Следующий шаг" /> 
    </div>
  );

  // ------------------------------------------------------------------
  function onClickNextStep() {
    setState({
      ...state,
      stepNum: state.stepNum + 1,
    });
  }
  
  function createStep() {
    const step = arr[state.stepNum];
    const content = []; 

    step.desc && content.push(<div>{step.desc}</div>);
    step.photoSrc && content.push(<img className="copyWizardImg" src={step.photoSrc} />);
    step.toRender && content.push(step.toRender);

    return <div className="step">{ content }</div>;
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
