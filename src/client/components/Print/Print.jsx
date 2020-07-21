import React from 'react';

import { 
  Stepper,
} from '../';
import { createSteps } from './createSteps';

import './styles.css';


export function Print({
  printState,
  tempReducer,
  $getUsbDevices,
}) {

  const [state, setState] = React.useReducer(tempReducer, stateInit);

  Print.setState = setState;
  
  const [ignored, forceUpdate] = React.useReducer(x => !x, false);

  React.useEffect(addKeyDownListener);
  React.useEffect(() => {
    const input = getActiveInput();
    input && input.focus();
  });

  const steps = createSteps({
    $getUsbDevices,
  });

  return (
    <div className="Print">
      { renderPrintState() }

      { 
        state.isSavePhotosToFlash && 
        <Stepper 
          steps={steps}
        />
      }
    </div>    
  );

  // --------------------------------------------------------------------
  function getActiveInput() {
    document.querySelector(`input[keyid=\'${state.activeInput}\']`);
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
    API: {
      server: {
        getUsbDevices: '$getUsbDevices',
      },
    },
  });
};

Print.getAPI = function (
) {
  return {
    saveToFlash() {
      Print.setState({
        isSavePhotosToFlash: true,
      });
    }
  };
}

const stateInit = {
  activeInput: undefined,
  isSavePhotosToFlash: false,
};