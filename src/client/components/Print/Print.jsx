import './styles.css';

import React from 'react';

import { 
  Stepper,
} from '../';
import { addHandlers, getBackgroundImageStyle, myCrop, useMyReducer } from '../../functions';
import { createSteps } from './createSteps';
import { channel } from '../../Channel';
import { Copying } from './components/Copying';
import { Dirs } from '../Dirs/Dirs';
import { ResumeObj } from '../compNames';
import { Spin } from 'antd';
import { ExitFromFolder, Empty } from '../';
import { Label } from '../Label/Label';
import { Dialog } from '../Dialog/Dialog';
import { Select } from '../Dialog';

const resumeObj = new ResumeObj({
  selector: [
    Print.name,
  ],
  val: getStateDefault(),
});


const PrintComp = channel.addComp({
  fn: Print,
  getAPI,
  getReqProps,
});

export function Print({  
}) {
  function render() {
    return (
      <div 
        className="Print layout"
        onClick={onClickDispatcher}
      >
        { state.loading && <Spin size="large" /> }
        { Object.keys(state.filesToPrint)[0] === undefined && (
          <Dirs
            dirs={state.dirs}
            onClickDirFnName={dispatcher.onClickDir.name}
          ></Dirs>
        )}
        
        { state.isSavePhotosToFlash ? 
          <Stepper 
            steps={steps}
          /> : 
          renderPrintState() 
        }
  
        <Empty
          isTrue={state.dirs.length === 0 && Object.keys(state.filesToPrint).length === 0}
        />

        {state.isDialogSavePrint && (
          <Dialog  
            type={Select.name}
            title='Сохранить список?'
            autoClose={false}
            onAgree={async () => {                           
              const rp = PrintComp.getReqProps();
              // await rp.serverSave();
              setState({
                isDialogSavePrint: false,
              }); 
              rp.backward().then(PrintComp.API.onNavigate);
            }}    
            onCancel={() => {
              setState({
                isDialogSavePrint: false,
              }); 
            }}
          >
          </Dialog>
        )}
      </div>    
    );
  }

  const rp = PrintComp.getReqProps();

  const [state, setState] = useMyReducer({    
    initialState: getStateInit(),
    isFirstFnCall: true,
    setCompDeps: PrintComp.setCompDeps,
    fn: ({
      stateUpd,
    }) => {      
      resumeObj.save({
        val: stateUpd,
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
            const rp = PrintComp.getReqProps();
            setState({
              loading: true,
            });
            const dir = event.target.getAttribute('src');
            rp.toward({ 
              dir, 
            })
            .then(PrintComp.API.onNavigate)
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

  return render();  

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
            Object.entries(state.filesToPrint).map(([src, {cnt}]) => { 
              const key = src;  
              if (cnt < 0) return null;

              return <div 
                className="rowData"
                key={key}
              >
                <div
                  className='fitPreview file'
                  style={getBackgroundImageStyle({
                    file: src,
                  })}
                >                  
                </div>               
                <div 
                  className='controls'
                  photosrc={src}
                >           
                  <input 
                    className="changePhotoCount" 
                    keyid={key}
                    value={cnt} 
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
  const rp = channel.crop({
    API: {
      comps: {
        server: {
          $getUsbDevices: 1,
          $checkCopyProgress: 1,
          $saveFilesToFlash: 1,          
          toward: 1,
          backward: 1,
          urls: 1,
        },
      },
    }, 
    s: {
      PRINTED_DIR: 1,
    },
    comps: {
      ...ExitFromFolder.API,
      ...Label.API,
    }, 
  });

  return {
    ...rp,
    toward: (props) => rp.toward({
      ...props,
      url: rp.urls.towardPrinted,
    }),
    backward: (props) => rp.backward({
      ...props,
      url: rp.urls.backwardPrinted,
    }),
  };
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
    },
    onNavigate,
    getFilesToPrint,
    togglePrint,
    isFileToPrint,
  };


  // ------------------------
  function isFileToPrint({
    src,
  }) {
    return isToPrint({
      val: resumeObj.get().filesToPrint?.[src],
    });
  }

  function togglePrint({
    src,
  }) {
    const resumed = resumeObj.get();
    // 0 - not to print, but show in list.
    // 1 - to print.
    resumed.filesToPrint[src] = {
      ...resumed.filesToPrint[src],
    };    
    const printed = isToPrint({
      val: resumed.filesToPrint[src].cnt
    });

    // toggle.
    if (printed) {
      delete resumed.filesToPrint[src];
    }
    else {
      resumed.filesToPrint[src].cnt = 1;
    }
    
    resumeObj.save({
      val: {
        filesToPrint: resumed.filesToPrint,
      },
    });

    return !printed;
  }

  function getFilesToPrint() {
    const {
      state,
    } = PrintComp.deps;
    return state.filesToPrint;
  }

  function onNavigate({
    dirs,
    path,
    sep,
    files,
  }) {
    // Fires on open dir, close dir.
    const {
      deps,
    } = PrintComp;    

    deps.setState({
      dirs,
      path, 
      files,     
      sep,
      loading: false,
    });

    ExitFromFolderUpdate({
      path: path ? path : undefined,
      onExitFolder: () => {          
        deps.setState({
          isDialogSavePrint: true,
        });          
      },
    });
  }
}

function getStateDefault() {
  return {
    loading: false,
    filesToPrint: {},
    dirs: [],
    sep: '',
    path: '',
    activeInput: undefined,
    isSavePhotosToFlash: false,
    isCopyCompleted: false,
    isDialogSavePrint: false,
  };
}

function getStateInit(
) {
  const resumed = resumeObj.get();
  return {
    ...getStateDefault(),
    ...resumed,
  };
}

function resetTo() {
  const rp = PrintComp.getReqProps();
  const { 
    deps,
   } = PrintComp;

  deps.setState({
    loading: true,
  });
  rp.toward({
    resetTo: deps.state.path,
  })
  .then(PrintComp.API.onNavigate);
}

function ExitFromFolderUpdate({
  path,
  onExitFolder,
}) {
  const rp = PrintComp.getReqProps();

  rp.ExitFromFolderAPI.forceUpdate({
    folderName: path,
    onClick: onExitFolder || onExitFolderCore,
  });

  // --------------------------------------------
  function onExitFolderCore() {
    const {
      onNavigate,
    } = PrintComp.API;
    const rp = PrintComp.getReqProps();
    rp.backward()
    .then(onNavigate);
  }
}

function isToPrint({
  val,
}) {
  return [undefined, 0].includes(val) ? false : true;
}
