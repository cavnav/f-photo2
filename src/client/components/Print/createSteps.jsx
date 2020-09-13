import React from 'react';

import {
  Copying
} from '../Copying/Copying';

export function createSteps({
  $getUsbDevices,
} = {}) {
  return [
    {
      photoSrc: 'wizardCopy/004_plugInPC.jpg',
      desc: 'Вставь флешку в системный блок, как показано ниже, чтобы совпал ключ.',
    }, 
    {    
      desc: 'Ищу карту памяти...',
      trigger: ({ setStepNum }) => {
        setTimeout(async () => {
          let stepNum = await $getUsbDevices() ? +2 : +1; 
  
          setStepNum({
            val: stepNum,
          });
        }, 1000);
      },  
      isNextBtn: false,
    }, 
    {    
      type: 'reject',
      desc: 'Что-то пошло не так... Попробуй еще раз',
      stepNumDelta: -2,
    }, 
    {                
      toRender: Copying,
    }, 
    {
      photoSrc: 'wizardCopy/005_returnMemCardInPhoto.jpg',
      desc: 'Вытащи флешку',
    }, 
    {
      desc: 'Проверяю, что флешка извлечена...',
      trigger: ({ setStepNum }) => {
        setTimeout(async () => {
          let stepNum = await $getUsbDevices() ? +1 : +2; 
  
          setStepNum({
            val: stepNum,
          });
        }, 1000);
      },  
      isNextBtn: false,
    }, 
    {    
      type: 'reject',
      desc: 'Что-то пошло не так... Попробуй еще раз',
      stepNumDelta: -2,
    }, 
    {
      trigger: () => {
        setState({
          view: Print.archive,
        });
      } 
    }
  ];
}