import React, { useState, useEffect } from 'react';
import { Progress, } from 'antd';
import { Stepper, Actions } from '../';

import 'antd/dist/antd.css';
import './styles.css';
import { resumeObjConstants } from '../../resumeObj';
import { Browse } from '../Browse/Browse';
import { channel } from '../../Channel';

const CopyComp = channel.addComp({
  fn: Copy,
  getReqProps,
})
export function Copy({
  setAppState,
  serverAPI,
  BrowseAPI,
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
        desc: 'Вставь кардРидер в компьютер, как показано ниже, чтобы совпал ключ.',
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
      }, 
      {
        toRender: getCopyingContent,
        trigger: $getNewPhotosWrap,
      },
      {
        toRender: () => {
          return (<>
            <Progress type="circle" percent={state.copyProgress} />
            {state.isCopyCompleted && <div>Все фотографии успешно скопированы!</div>}   
          </>);
        },        
        trigger: $onCopyWrap,
        isNextBtn: state.isCopyCompleted,
      },
      {
        desc: 'Вытащи картридер из компьютера',
      },
      {
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
            action: Actions.Browse.name,            
          });
        } 
      }
    ];
  }

  function getCopyingContent({ key }) {
    return <div className="flex flexDirColumn" key={key}>
      Количество новых фото:
      { state.countNewPhotos }
      <div>* Внимание! После копирования карта памяти будет очищена.</div>
    </div>;        
  }

  function $waitUSBconnectWrap() {
    return serverAPI.$getUsbDevices()
    .then(res => res.driveLetter);
  }

  function $getNewPhotosWrap() {
    return serverAPI.$getNewPhotos()
      .then((res) => {
        setState({
          ...state,
          countNewPhotos: res.countNewPhotos,
        });
      });
  }

  function $onCopyWrap() {
    return serverAPI.$copyPhotos({
      userDirName: '',
    }).then((res) => {
      const rp = CopyComp.getReqProps();
      rp.BrowseAPI.setToResumeObj({
        val: {
          path: res.destDir,
        },
      });
      $checkCopyProgressWrap();
    });
  }

  function $checkCopyProgressWrap() {
    serverAPI.$checkCopyProgress()
      .then((res) => {
        const isCopyCompleted = res.copyProgress === 100;
        setTimeout(() => (isCopyCompleted ? null : $checkCopyProgressWrap()), 500);        
        setState({
          ...state,
          copyProgress: res.copyProgress,
          isCopyCompleted,
        });
      });
  }
}

function getReqProps ({
  channel,
}) {
  return channel.crop({
    d: {
      setAppState: 1,      
    },
    API: {
      comps: {
        server: 'serverAPI',
      }
    },
    comps: {
      ...Browse.API,
    },
  })
}

const stateInit = {
  copyProgress: 0,
  countNewPhotos: 0,
  isHelp: false,
  isCopyCompleted: false,
};