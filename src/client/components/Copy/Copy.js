import React, { useState, useEffect } from 'react';
import { Progress, } from 'antd';
import { Stepper, Views } from '..';

import 'antd/dist/antd.css';
import './styles.css';

export function Copy({
  setAppState,
  
  $getUsbDevices,
  $copyPhotos,
  $getNewPhotos,
}) {
  
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
        photoSrc: 'wizardCopy/001_getOutMemCard.jpg',
        desc: 'нажми пальцем на синюю карту памяти, и, вдавив внутрь, отпусти.',
      }, {
        photoSrc: 'wizardCopy/002_insertIntoCardReader.jpg',
        desc: 'Вставь карту памяти в кардРидер, как показано ниже:',
      }, {
        photoSrc: 'wizardCopy/004_plugInPC.jpg',
        desc: 'Вставь кардРидер в системный блок, как показано ниже, чтобы совпал ключ.',
      }, {    
        desc: 'Ищу карту памяти...',
        trigger: ({ setStepNum }) => {
          setTimeout(async () => {
            let stepNum = await $waitUSBconnectWrap() ? +2 : +1; 
    
            setStepNum({
              val: stepNum,
            });
          }, 1000);
        },  
        isNextBtn: false,
      }, {    
        type: 'reject',
        desc: 'Что-то пошло не так... Попробуй еще раз',
        stepNumDelta: -2,
      }, {
        toRender: getCopyingContent,
        trigger: $getNewPhotosWrap,
        isNextBtn: state.isCopyCompleted,
      }, {
        photoSrc: 'wizardCopy/005_returnMemCardInPhoto.jpg',
        desc: 'Вытащи карту памяти из кардРидера и вставь обратно в фотоаппарат до щелчка, как показано ниже:',
      }, {
        desc: 'Проверяю, что карта памяти извлечена...',
        trigger: ({ setStepNum }) => {
          setTimeout(async () => {
            let stepNum = await $waitUSBconnectWrap() ? +1 : +2; 
    
            setStepNum({
              val: stepNum,
            });
          }, 1000);
        },  
        isNextBtn: false,
      }, {    
        type: 'reject',
        desc: 'Что-то пошло не так... Попробуй еще раз',
        stepNumDelta: -2,
      }, {
        trigger: () => {
          setAppState({
            view: Views.Welcome,
          });
        } 
      }
    ];
  }

  function getCopyingContent({ key }) {
    const started = <div className="flex flexDirColumn" key={key}>
      Количество новых фото:
      { state.countNewPhotos }
      <div><input type="button" onClick={$onCopyWrap} value="Копировать" /></div>
      <div>* Внимание! После копирования карта памяти будет очищена.</div>
      <Progress type="circle" percent={state.copyProgress} />      
    </div>;    
    const finished = <div>Все фотографии успешно скопированы!</div>;

    return state.isCopyCompleted ? finished : started;
  }

  function $waitUSBconnectWrap() {
    return $getUsbDevices()
    .then(res => res.driveLetter);
  }

  function $getNewPhotosWrap() {
    return $getNewPhotos()
      .then((res) => {
        setState({
          ...state,
          countNewPhotos: res.countNewPhotos,
        });
      });
  }

  function $onCopyWrap() {
    return $copyPhotos({
      userDirName: '',
    }).then((res) => {
      $checkCopyProgressWrap();
    });
  }

  function $checkCopyProgressWrap() {
    $checkCopyProgress()
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

Copy.getReqProps = ({ channel }) => {
  return channel.crop({
    d: {
      setAppState: 1,
    },
    API: {
      comps: {
        server: {
          getUsbDevices: '$getUsbDevices',
          copyPhotos: '$copyPhotos',
          getNewPhotos: '$getNewPhotos',
        }
      }
    }
  })
}

const stateInit = {
  copyProgress: 0,
  countNewPhotos: 0,
  isHelp: false,
  isCopyCompleted: false,
};