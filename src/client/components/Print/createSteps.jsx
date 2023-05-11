export function createSteps({
  isCopyCompleted,
  onAllStepsPassed,
  Copying,
  $getUsbDevices,
} = {}) {
  return [
    {
      photoSrc: 'wizardCopy/004_plugInPC.jpg',
      desc: 'Вставь флешку в компьютер, чтобы совпал ключ.',
    }, 
    {    
      desc: 'Ищу карту памяти...',
      trigger: ({ setStepNum }) => {
        setTimeout(async () => {
          let usbDevice = await $getUsbDevices();
          const stepNum = (usbDevice.driveLetter) ? +2 : +1; 
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
      isNextBtn: isCopyCompleted,
    }, 
    {
      photoSrc: 'wizardCopy/005_returnMemCardInPhoto.jpg',
      desc: 'Вытащи флешку',
    }, 
    {
      desc: 'Проверяю, что флешка извлечена...',
      trigger: ({ setStepNum }) => {
        setTimeout(async () => {
          let usbDevice = await $getUsbDevices();
          const stepNum = (usbDevice.driveLetter) ? +1 : +2; 
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
      trigger: onAllStepsPassed
    }
  ];
}
