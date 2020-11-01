import React from 'react';

import { Progress, } from 'antd';
import { 
  Stepper,
} from '../';
import { tempReducer } from '../../functions';
import { createSteps } from './createSteps';

import './styles.css';
import { PhotoStatuses } from '../PhotoStatuses/PhotoStatuses';

const Copying = React.memo(function ({
  filesToPrint,
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

  function getDataForCopyFiles({
    filesToPrint,
  }) {
    return {
      files: Object.entries(filesToPrint)
      .reduce((res, [fileSrc, cntCopies]) => { 
          res[fileSrc] = cntCopies;
          return res; 
        }, 
        {}
      ),
    };
  };

  function onAccept() {
    setState({
      clearTimerId: state.timerId
    });
    

    $saveFilesToFlash(
      getDataForCopyFiles({
        filesToPrint,
      })    
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
  PhotoStatusesAPI,
  tempReducer,
  $getUsbDevices,
  $checkCopyProgress,
  $saveFilesToFlash
}) {

  const filesToPrint = React.useMemo(() => {
    return Object.entries(PhotoStatusesAPI.getFilesWithStatuses())
    .reduce((res, [key, val]) => {
      res[key] = val.toPrint ? 1 : 0;
      return res;
    }, {});
  }, []);

  const [state, setState] = React.useReducer(tempReducer, getStateInit({
    filesToPrint,
  }));

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
        filesToPrint={filesToPrint}
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
        /> : renderPrintState({ 
            filesToPrint: state.filesToPrint,
          }) 
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

    const photoSrc = input.getAttribute('keyid');
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

    state.filesToPrint[photoSrc] = cntUpd; 

    setState({
      forceUpdate: !state.forceUpdate,
    });
  }  

  function renderPrintState({
    filesToPrint,
  }) {
    return (
      <>
        <div className="PrintItems">
          {
            Object.keys(filesToPrint).map((photoSrc) => { 
              const key = photoSrc;         
              return <div 
                className="rowData"
                key={key}
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
                  value={filesToPrint[photoSrc]} 
                  onChange={onChangePhotoCount} 
                />
                <input type="button" className="marginRight10" onClick={onClickErasePhotoCount} value="Стереть" />
              </div>
            })
          }
        </div>
      </>
    );
  }

  function onClickErasePhotoCount(e) {
    const { photoSrc } = getDataPrint({ element: e.target.parentElement });

    state.filesToPrint[photoSrc] = 0;

    setState({
      activeInput: photoSrc,
    });
  }

  function onChangePhotoCount(e) {
    const input = e.target;
    const { photoSrc } = getDataPrint({ element: input.parentElement });

    state.filesToPrint[photoSrc] = input.value; 

    setState({
      activeInput: photoSrc,
    });
  }

  function getDataPrint({ element }) {
    const photoSrc = element.getAttribute('photosrc');

    return {
      photoSrc,
    };
  }

}

Print.getReqProps = ({ channel }) => {
  return channel.crop({
    API: {
      comps: {
        server: {
          $getUsbDevices: 1,
          $checkCopyProgress: 1,
          $saveFilesToFlash: 1,
        },
        PhotoStatuses: 'PhotoStatusesAPI',
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

function getStateInit({
  filesToPrint,
}) {
  return {
    activeInput: undefined,
    isSavePhotosToFlash: false,
    isCopyCompleted: false,
    filesToPrint,
    forceUpdate: false,
  };
}


