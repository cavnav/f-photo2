import React from 'react';

import './styles.css';

export function Print({
  printState,
  $getUsbDevices,
}) {

  const stateInit = {
    activeInput: undefined,
  };

  const [state, setState] = React.useState(stateInit);

  const [ignored, forceUpdate] = React.useReducer(x => !x, false);

  React.useEffect(addKeyDownListener);
  React.useEffect(() => {
    const input = getActiveInput();
    input && input.focus();
  });

  const steps = createSteps();

  return (
    <div className="Print">
      { renderPrintState() }

      <Stepper 
        steps={steps}
      />
    </div>    
  );

  // --------------------------------------------------------------------
  function getActiveInput() {
    document.querySelector(`input[keyid=\'${state.activeInput}\']`);
  }

  function createSteps() {
    return [
      {
        photoSrc: 'public/wizardCopy/004_plugInPC.jpg',
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
        desc: 'Внимание! Все файлы на флешке будут удалены',
        dialog: {

        },
      }, 
      {
        desc: 'Копирую...',
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
  
  function addKeyDownListener() {
    document.addEventListener('keydown', onKeyDown);

    return () => {
      document.removeEventListener('keydown', onKeyDown);
    };    
  }

  function onKeyDown(e) {     
    const input = document.activeElement;

    if (input === undefined) return;

    const cntSource = Number(input.value);
    let cntUpd = cntSource;

    switch (e.which) {
      case 38: // +1
        cntUpd = cntSource + 1;
        break;

      case 40: // -1
        cntUpd = cntSource > 0 ? cntSource - 1 : cntSource;
        break;
      default: return;
    }

    const { date, photoSrc } = getDataPrint({ element: input.parentElement });
    printState[date][photoSrc].toPrint = cntUpd; 

    setState({
      ...state,
    });
  }  

  function renderPrintState() {
    const toRender = Object.entries(printState).map(([date, photo]) => {
      return <div className="dateForPrintPage">
        {date} <br/>
        {
          Object.entries(photo).map(([photoSrc, status]) => { 
            const key = getPhotoDataKey({date, photoSrc});         
            return <div 
              className="rowDataForPrint"
              key={key}
              date={date}
              photosrc={photoSrc}
            >
              <div
                className='fitPreview100 file marginRight10'
                style={{ 'backgroundImage': `url(${photoSrc})` }}
              >
              </div>              
              <input 
                className="changePhotoCount marginRight10" 
                keyid={key}
                value={status.toPrint} 
                onChange={onChangePhotoCount} 
              />
              <input type="button" className="marginRight10" onClick={onClickErasePhotoCount} value="Стереть" />
            </div>
          })
        }

      </div>
    });

    return toRender;
  }

  function onClickErasePhotoCount(e) {
    const {date, photoSrc} = getDataPrint({ element: e.target.parentElement });

    printState[date][photoSrc].toPrint = "";

    setState({
      ...state, 
      activeInput: getPhotoDataKey({date, photoSrc}),
    });
  }

  function onChangePhotoCount(e) {
    const input = e.target;
    const {date, photoSrc} = getDataPrint({ element: input.parentElement });

    printState[date][photoSrc].toPrint = input.value; 

    setState({
      ...state, 
      activeInput: getPhotoDataKey({date, photoSrc}),
    });
  }

  function getDataPrint({ element }) {
    const date = element.getAttribute('date');
    const photoSrc = element.getAttribute('photosrc');

    return {
      date,
      photoSrc,
    };
  }

  function getPhotoDataKey({date, photoSrc}) {
    return `${date}-${photoSrc}`;
  }
}

Print.getReqProps = ({ channel }) => {
  return channel.crop({
    s: { 
      printState: 1,
    },
    server: {
      getUsbDevices: '$getUsbDevices',
    },
  });
};