import './styles.css';

import React from 'react';

import { 
  Stepper,
} from '../';
import { addHandlers, getBackgroundImageStyle, getFilesWithStatuses, updateFilesWithStatuses, useMyReducer } from '../../functions';
import { createSteps } from './createSteps';
import { getCurDate } from '../../functions';
import { channel } from '../../Channel';
import { Copying } from './components/Copying';
import { ResumeObj } from '../../resumeObj';
import { Dirs } from '../Dirs/Dirs';

const resumeObj = new ResumeObj({
  compName: Print.name,
});


const PrintComp = channel.addComp({
  fn: Print,
  getAPI,
  getReqProps,
});

export function Print({  
}) {
  const rp = PrintComp.getReqProps();

  const [state, setState] = useMyReducer({    
    initialState: {
      ...getStateInit(),
    },
    setCompDeps: PrintComp.setCompDeps,
    fn: ({
      state,
      stateUpd,
    }) => {      
      const stateUpdNext = {
        ...state,
      };
      delete stateUpdNext.filesToPrint;
      resumeObj.save({ 
        stateUpd: stateUpdNext,
      });
      stateUpd.filesToPrint !== undefined && updateFilesWithStatuses({
        stateUpd: stateUpd.filesToPrint,
      });
    }
  });

  const onCopyCompleted = React.useCallback(() => setState({
    isCopyCompleted: true,
  }), []);

  const onCopyCanceled = React.useCallback(() => setState({ 
    isSavePhotosToFlash: false 
  }), [state.isSavePhotosToFlash]);

  const onAllStepsPassed = React.useCallback(() => setState({
    isSavePhotosToFlash: false 
  }), [state.isSavePhotosToFlash]);

  const steps = React.useMemo(
    () => createSteps({
      $getUsbDevices: rp.$getUsbDevices,
      isCopyCompleted: state.isCopyCompleted,
      onAllStepsPassed,
      Copying: () => <Copying 
          filesToPrint={state.filesToPrint}
          onCopyCompleted={onCopyCompleted} 
          onCopyCanceled={onCopyCanceled}
          $saveFilesToFlash={rp.$saveFilesToFlash}
          $checkCopyProgress={rp.$checkCopyProgress} 
        />,
    }),
    [state.isCopyCompleted],
  );

  const dispatcher = React.useMemo(
    () => addHandlers(
      {
        fns: [
          function onClickDir({
            event
          }) {
            const rp = Print.getReqProps();
            setState({
              loading: true,
            });
            const dir = event.target.getAttribute('src');
            rp.server.printedNavigate({ 
              dir, 
            })
            .then((res) => {
              setState({
                loading: false,
              });
            });
          }, 
        ]
      },
    ),
    [],  
  );

  const onClickDispatcher = React.useCallback((event) => {
    const { target } = event;
    const onClickCb = target.getAttribute('clickcb');

    onClickCb && dispatcher[onClickCb]({
      event,
    });
  }, []);

  React.useEffect(addKeyDownListener);
  React.useEffect(() => {
    const input = getActiveInput();
    input && input.focus();
  });
  React.useEffect(
    resetTo,
    []
  );

  return (
    <div 
      className="Print layout"
      onClick={onClickDispatcher}
    >
      <Dirs
        dirs={rp.photosState.dirs}
        onClickDirFnName={dispatcher.onClickDir.name}
      ></Dirs>
      
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

    setState({
      filesToPrint: updateFilesToPrint(),
    });


    // --------------------------------------
    function updateFilesToPrint() {
      state.filesToPrint[photoSrc].toPrint = cntUpd;
      return state.filesToPrint;
    }
  }  

  function renderPrintState(    
  ) {
    const {
      state,
    } = PrintComp.deps;
    return (
      <>
        <div className="PrintItems">
          {
            Object.entries(state.filesToPrint).map(([photoSrc, statuses]) => { 
              const key = photoSrc;  
              if (statuses.toPrint < 0) return null;

              return <div 
                className="rowData"
                key={key}
              >
                <div
                  className='fitPreview file'
                  style={getBackgroundImageStyle({
                    file: photoSrc,
                  })}
                >                  
                </div>               
                <div 
                  className='controls'
                  photosrc={photoSrc}
                >           
                  <input 
                    className="changePhotoCount" 
                    keyid={key}
                    value={statuses.toPrint} 
                    onChange={onChangePhotoCount} 
                  />
                  <input type="button" className="marginRight10" onClick={onClickErasePhotoCount} value="Стереть" />
                </div>    
              </div>
            })
          }
        </div>
      </>
    );
  }

  function onClickErasePhotoCount(e) {
    const { photoSrc } = getDataPrint({ element: e.target.parentElement });

    setState({
      filesToPrint: (() => { state.filesToPrint[photoSrc].toPrint = 0; return state.filesToPrint })(),
      activeInput: photoSrc,
    });
  }

  function onChangePhotoCount(e) {
    const input = e.target;
    
    // allowed only numbers.
    const numbers = /^[0-9]+$/;
    if (input.value.match(numbers) === null) {
      e.preventDefault();
      return;
    }

    const { photoSrc } = getDataPrint({ element: input.parentElement });    

    setState({
      filesToPrint: updateFilesToPrint(),
      activeInput: photoSrc,
    });

    // --------------------------------------------
    function updateFilesToPrint() {
      state.filesToPrint[photoSrc].toPrint = input.value;
      return state.filesToPrint;
    }
  }

  function getDataPrint({ element }) {
    const photoSrc = element.getAttribute('photosrc');

    return {
      photoSrc,
    };
  }

}

function getReqProps({ channel }) {
  return channel.crop({
    s: {
      photosState: 1,
    },
    API: {
      comps: {
        server: {
          $getUsbDevices: 1,
          $checkCopyProgress: 1,
          $saveFilesToFlash: 1,
          toward: 1,
        },
      },
    },  
  });
};

function getAPI(
) {
  return {
    saveToFlash() {
      const { 
        setState,
      } = PrintComp.deps;
      setState({
        isSavePhotosToFlash: true,
      });
    }
  };
}

function getStateInit(
) {
  const loaded = resumeObj.load({});

  return {
    loading: false,
    filesToPrint: getFilesWithStatuses(),
    dirs: [],
    activeInput: undefined,
    isSavePhotosToFlash: false,
    isCopyCompleted: false,

    ...loaded,
  };
}

function resetTo() {
  const rp = PrintComp.getReqProps();
  const { deps } = PrintComp;
  deps.setState({
    loading: true,
  });
  rp.toward({
    resetTo: '\printed',
  })
  .then((res) => deps.setState({
    loading: false,    
  }));
}
