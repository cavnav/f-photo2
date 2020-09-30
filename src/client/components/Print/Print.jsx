import React from 'react';

import { Progress, } from 'antd';
import { 
  Stepper,
} from '../';
import { tempReducer } from '../../functions';
import { createSteps } from './createSteps';

import './styles.css';

const Copying = React.memo(function ({
  onCopyCompleted = () => {},
  onCopyCanceled = () => {},
  $checkCopyProgress,
}) {
  const [state, setState] = React.useReducer(tempReducer, getStateInit());
  const onAcceptCb = React.useCallback(() => onAccept(), []);
  
  React.useEffect(() => timer(state.timer), [state.timer]);
  React.useEffect(() => { if (state.isCopyCompleted === true) onCopyCompleted() }, [state.isCopyCompleted]);
  return (
    <div className="flexCenter flexDirColumn">
      <div>Внимание! Флешка будет очищена перед копированием, <span style={{fontSize: '30px'}}>{state.timer}</span></div>
      <input className="acceptBtn" type="button" value="ok" onClick={onAcceptCb}/>
      <Progress className="copyProgress" type="circle" percent={state.copyProgress} />      
    </div>
  );  

  function timer(val) {    
    if (val === 0) {
      onCopyCanceled();
      return;
    }
    
    setTimeout(() => 
      setState({
        timer: val - 1,
      })
      ,1000
    );
  }

  function getStateInit() {
    return {
      copyProgress: 0,
      isCopyCompleted: false,
      timer: 10,
    };
  }

  function onAccept() {
    $checkCopyProgress()
      .then((res) => {
        const isCopyCompleted = res.copyProgress === 100;
        setTimeout(() => (isCopyCompleted ? null : $checkCopyProgress()), 500);
        setState(() => {
          return {
            copyProgress: res.copyProgress,
            isCopyCompleted,
          };
        });
      });
  }
});

export function Print({
  printState,
  tempReducer,
  $getUsbDevices,
  $checkCopyProgress,
}) {

  const [state, setState] = React.useReducer(tempReducer, stateInit);

  Print.setState = setState;
  
  const [ignored, forceUpdate] = React.useReducer(x => !x, false);

  const onCopyCompleted = React.useCallback(() => setState({
    isCopyCompleted: true,
  }), []);

  const onCopyCanceled = React.useCallback(() => setState({ 
    isSavePhotosToFlash: false 
  }), []);

  const steps = createSteps({
    $getUsbDevices,
    isCopyCompleted: state.isCopyCompleted,
    Copying: () => <Copying 
        onCopyCompleted={onCopyCompleted} 
        onCopyCanceled={onCopyCanceled}
        $checkCopyProgress={$checkCopyProgress} 
      />,
  });

  React.useEffect(addKeyDownListener);
  React.useEffect(() => {
    const input = getActiveInput();
    input && input.focus();
  });

  return (
    <div className="Print">
      <div>2020-09-29</div>
      { state.isSavePhotosToFlash ? <Stepper 
          steps={steps}
        /> : renderPrintState() 
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
      return (
        <>
          <div className="PrintItems">
            {
              Object.entries(photo).map(([photoSrc, status]) => { 
                const key = getPhotoDataKey({date, photoSrc});         
                return <div 
                  className="rowData"
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
        </>
      );
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
      comps: {
        server: {
          $getUsbDevices: 1,
          $checkCopyProgress: 1,
        },
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
  isCopyCompleted: false,
};


