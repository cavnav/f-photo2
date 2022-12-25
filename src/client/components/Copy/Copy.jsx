import React from 'react';
import { Stepper, Actions } from '../';

import './styles.css';
import { channel } from '../../channel';
import { ProgressNotification } from '../../functions';

export const Copy = channel.addComp({
  name: 'Copy',
  render,
  getReqProps,
  getComps,
})

function render() {
  const Comp = this;
  const [state, setState] = React.useState(stateInit);

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
        desc: 'Вставь карту памяти в ноутбук, как показано ниже:',
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
            {state.isCopyCompleted && <div>Все фотографии успешно скопированы!</div>}   
          </>);
        },        
        trigger: $onCopyWrap,
        isNextBtn: state.isCopyCompleted,
      },
      {
        desc: 'Вытащи карту памяти из ноутбука',
      },
      {
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
          const rp = Comp.getReqProps();
          rp.setAppState({
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
    const rp = Comp.getReqProps();
    return rp.server.$getUsbDevices()
    .then(res => res.driveLetter);
  }

  function $getNewPhotosWrap() {
    const rp = Comp.getReqProps();    
    return rp.server.$getNewPhotos()
      .then((res) => {
        setState({
          ...state,
          countNewPhotos: res.countNewPhotos,
        });
      });
  }

  function $onCopyWrap() {
    const rp = Comp.getReqProps();
    return rp.server.$copyPhotos({
      userDirName: '',
    }).then((res) => {
      const rp = Comp.getReqProps();
      rp.BrowseAPI.setToResumeObj({
        val: {
          path: res.destDir,
        },
      });
      $checkCopyProgressWrap();
    });
  }

  function $checkCopyProgressWrap() {
    const rp = Comp.getReqProps();
    rp.server.checkProgress()
      .then((res) => {
        const isCopyCompleted = res.progress === 100;
        setTimeout(() => (isCopyCompleted ? null : $checkCopyProgressWrap()), 500);        
        
        rp.NotificationAPI.forceUpdate({
          title: ProgressNotification({
            progress: res.progress,
          }),
        });

        if (isCopyCompleted) {
          rp.NotificationAPI.setInit();          
          setState({
            ...state,
            isCopyCompleted,
          });
        }
      });
  }
}

function getReqProps ({
  comps,
  channel,
}) {
  return {
    setAppState: channel.d.setAppState,
    server: channel.server,
    ...comps,
  };
}

function getComps({
  channelComps,
}) {
  return {
    items: {
      Browse: channelComps.Browse,
      Notification: channelComps.Notification,
    },
  };
}

const stateInit = {
  copyProgress: 0,
  countNewPhotos: 0,
  isHelp: false,
  isCopyCompleted: false,
};