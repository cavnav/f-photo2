import React from 'react';

import { Progress, } from 'antd';
import { 
  Stepper,
} from '../';
import { tempReducer } from '../../functions';
import { createSteps } from './createSteps';

import './styles.css';

const Copying = React.memo(function ({
  printState,
  onCopyCompleted = () => {},
  onCopyCanceled = () => {},
  $checkCopyProgress,
  $saveFilesToFlash,
}) {
  const [state, setState] = React.useReducer(tempReducer, getStateInit());
  const onAcceptCb = React.useCallback(() => onAccept(), [state.timer]);
  
  React.useEffect(() => timer(state.timer), [state.timer]);
  React.useEffect(() => { if (state.isCopyCompleted === true) onCopyCompleted() }, [state.isCopyCompleted]);

  return (
    <div className="flexCenter flexDirColumn">
      { (state.copyProgress === 0) && (
          <>
            <div>Внимание! Флешка будет очищена перед копированием, <span style={{fontSize: '30px'}}>{state.timer}</span></div> 
            <input className="acceptBtn" type="button" value="ok" onClick={onAcceptCb}/>
          </>
        )
      }
      <Progress className="copyProgress" type="circle" percent={state.copyProgress} />  
      { (state.isCopyCompleted) && <div>Все файлы успешно скопированы</div> }    
    </div>
  );  

  function timer(val) { 
    if (val === 0) {
      onCopyCanceled();
      return;
    }

    if (state.clearTimerId) return;
    const timerId = setTimeout(() => setState({ timer: val - 1 }), 1000);
    
    setState( {
      timerId,
    });
  }

  function getStateInit() {
    return {
      copyProgress: 0,
      isCopyCompleted: false,
      timer: 10,
      timerId: 0,
      clearTimerId: 0,
    };
  }

  function getDataForCopyFiles(printState) {
    const [filesByDate] = Object.values(printState)
    .map((filesByDate) => Object.values(filesByDate));
    return {
      folders: new Set(filesByDate.map((file) => file.toPrint)),
      files: Object.values(printState)[0],
    };
  };

  function onAccept() {
    setState({
      clearTimerId: state.timerId
    });
    

    $saveFilesToFlash(
      getDataForCopyFiles(printState)    
    )
    .then(checkCopyProgress);

    function checkCopyProgress() {
      $checkCopyProgress()
      .then((res1) => {
        const isCopyCompleted = res1.copyProgress === 100;
        if (isCopyCompleted === false) {
          setTimeout(() => checkCopyProgress(), 500);
        }
        setState({
          copyProgress: res1.copyProgress,
          isCopyCompleted,
        });
      });
    }
  }
});

export function Print({
  printState,
  tempReducer,
  $getUsbDevices,
  $checkCopyProgress,
  $saveFilesToFlash
}) {

  const [state, setState] = React.useReducer(tempReducer, stateInit);

  Print.setState = setState;
  
  const [ignored, forceUpdate] = React.useReducer(x => !x, false);

  const onCopyCompleted = React.useCallback(() => setState({
    isCopyCompleted: true,
  }), []);

  const onCopyCanceled = React.useCallback(() => setState({ 
    isSavePhotosToFlash: false 
  }), [state.isSavePhotosToFlash]);

  const onAllStepsPassed = React.useCallback(() => setState({
    isSavePhotosToFlash: false 
  }), [state.isSavePhotosToFlash]);

  const steps = createSteps({
    $getUsbDevices,
    isCopyCompleted: state.isCopyCompleted,
    onAllStepsPassed,
    Copying: () => <Copying 
        printState={printState}
        onCopyCompleted={onCopyCompleted} 
        onCopyCanceled={onCopyCanceled}
        $saveFilesToFlash={$saveFilesToFlash}
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
    const toRender = Object.entries(printState)
      .map(([date, photo]) => {
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
          $saveFilesToFlash: 1,
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


