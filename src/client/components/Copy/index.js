import React, { useState, useEffect } from 'react';
import { Progress, } from 'antd';
import { serverApi } from '../../serverApi';
import { Stepper } from '../';

import 'antd/dist/antd.css';
import './styles.css';

export function Copy(props) {
  
  const [state, setState] = useState(stateInit);

  return getRender();

  // ----------------------------------------------------------------------------------
  function getRender() {
    const steps = createSteps();
  
    return <div className="Copy">      
      <Stepper 
        steps={steps}
      />
    </div>;
  }
  
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
        desc: 'Ищу карту памяти...',
        trigger: ({ state: { step, stepNum }, dispatch }) => {
          setTimeout(async () => {
            let result = await $waitUSBconnect() ? 'Resolve' : 'Reject'; 
    
            dispatch({
              stepNum: stepNum + (step[`triggerStepNumDeltaOn${result}`] || 1),
            });
          }, 1000);
        },  
        triggerStepNumDeltaOnResolve: +2,
        triggerStepNumDeltaOnReject: +1,
        isNextBtn: false,
      }, {    
        type: 'reject',
        desc: 'Что-то пошло не так... Попробуй еще раз',
        stepNumDelta: -2,
      }, {
        toRender: getCopyingContent,
        trigger: $getNewPhotos,
      }, {
        photoSrc: 'public/wizardCopy/005_returnMemCardInPhoto.jpg',
        desc: 'Вытащи карту памяти из кардРидера и вставь обратно в фотоаппарат до щелчка, как показано ниже:',
      }, {
        trigger: () => {
          props.dispatch.setAppState({
            ...props.appState,
            view: 'Welcome',
          });
        } 
      }
    ];
  }

  function getCopyingContent({ key }) {
    const beforeCopying = <div className="flex flexDirColumn" key={key}>
      Количество новых фото:
      { state.countNewPhotos }
      <input type="button" onClick={onCopy} value="Копировать" />
      <Progress type="circle" percent={state.copyProgress} />      
    </div>;    

    const afterCopying = <div>Все фотографии успешно скопированы!</div>;

    return state.isCopyCompleted ? afterCopying : beforeCopying;    
  }

  function $waitUSBconnect() {
    return serverApi({
      props: {
        url: 'getUsbDevices'
      }
    })
    .then(res => res.json())
    .then(res => res.driveLetter);
  }

  function $getNewPhotos() {
    return serverApi({
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
        userDirName: '',
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
        const isCopyCompleted = res.copyProgress === 100;
        setTimeout(() => (isCopyCompleted ? null : checkCopyProgress()), 500);
        setState({
          ...state,
          copyProgress: res.copyProgress,
          isCopyCompleted,
        });
      });
  }
}

const stateInit = {
  copyProgress: 0,
  countNewPhotos: 0,
  isHelp: false,
  isCopyCompleted: false,
};