import './styles.css';

import React from 'react';

import { 
  AdditionalPanel,
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
import { SavePhotosToFlash } from '../SavePhotosToFlash/SavePhotosToFlash';

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
        { Object.keys(state.filesToPrint).length === 0 && (
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
              await rp.savePrinted({
                files: state.filesToPrint
              });
              setState({
                isDialogSavePrint: false,
              }); 
              rp.backwardPrinted().then(PrintComp.API.onNavigate);
            }}    
            onCancel={() => {
              setState({
                isDialogSavePrint: false,
              }); 
              rp.backwardPrinted().then(PrintComp.API.onNavigate);
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
            rp.towardPrinted({ 
              dir, 
            })            
            .then(PrintComp.API.onNavigate) 
            .then(() => {
              setState({
                ...setGivenFilesToPrint({
                  val: state.filesToPrint,
                }),
              });
            })           
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
    () => {
      const rp = PrintComp.getReqProps();
      rp.AdditionalPanelAPI.forceUpdate();
      resetTo();
    },
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

    if (input === document.body) return;

    const photoSrc = input.getAttribute('keyid');
    const cntSource = Number(input.value);
    const getCntUpd = {
      38: () => (cntSource + 1),
      40: () => (cntSource > 0 ? cntSource - 1 : cntSource),
    }[e.which] ?? (() => cntSource);
    
    setState({
      filesToPrint: updateFilesToPrint.update({
        photoSrc,
        val: {
          cnt: getCntUpd(),
        },
      }),
    });
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
      filesToPrint: updateFilesToPrint.update({
        photoSrc,
        val: {
          cnt: input.value,
        },
      }),
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

function getReqProps({ channel }) {
  return channel.crop({
    API: {
      comps: {
        server: {
          $getUsbDevices: 1,
          $checkCopyProgress: 1,
          $saveFilesToFlash: 1,          
          towardPrinted: 1,
          backwardPrinted: 1,
          savePrinted: 1,
        },
      },
    }, 
    comps: {
      ...ExitFromFolder.API,
      ...Label.API,
      ...AdditionalPanel.API,
    }, 
  });
};

function getAPI(
) {
  const getCompDeps = () => Comp.deps({
    compId: props.compId,
  });
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
    getAdditionalActions,
  };


  // ------------------------
  function getAdditionalActions() {
    return [
      Label,
      ExitFromFolder,
      SavePhotosToFlash,
    ];
  }

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
    const printed = isToPrint({
      val: resumed.filesToPrint[src]?.cnt
    });

    // toggle.
    if (printed) {
      resumed.filesToPrint = updateFilesToPrint.delete({
        filesToPrint: resumed.filesToPrint,      
        photoSrc: src,  
      });
    }
    else {
      resumed.filesToPrint = updateFilesToPrint.add({
        filesToPrint: resumed.filesToPrint,
        photoSrc: src,
        val: {
          cnt: 1,
        },
      });
    }
    
    resumeObj.save({
      val: {
        filesToPrint: resumed.filesToPrint,
      },
    });

    return !printed;
  }

  function getFilesToPrint(props = {}) {
    const {
      state,
    } = PrintComp.deps;
    return props.photoSrc ? state.filesToPrint[props.photoSrc] : state.filesToPrint;
  }

  function onNavigate({
    dirs,
    path,
    sep,
    files,
  }) {
    // Fires on set from storage, open dir, close dir.
    const {
      deps,
    } = PrintComp;    
    const rp = PrintComp.getReqProps();

    const filesToPrintUpd = files.pop() || {};
    deps.setState({
      dirs,
      path, 
      filesToPrint: filesToPrintUpd,     
      sep,
      loading: false,
    });

    rp.ExitFromFolderAPI.forceUpdate({
      title: 'Закрыть ',
      folderName: path ? path : undefined,
      onClick: () => { 
        if (isNeedToSaveFilesToPrint().result) {
          deps.setState({
            isDialogSavePrint: true,
          });          
        }
        else {  
          rp.backwardPrinted().then(PrintComp.API.onNavigate);
        }
      },
    });
  }
}

function getStateDefault() {
  return {
    loading: false,
    filesToPrint: {},
    givenFilesToPrint: {},
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

  const { path } = deps.state;

  const filesToPrint = deps.state.filesToPrint;

  deps.setState({
    loading: true,
  });

  rp.towardPrinted({
    resetTo: path,
  })
  .then(PrintComp.API.onNavigate)
  .then(() => {
  // set filesToPrint from storage.
    const answer = isNeedToSaveFilesToPrint({
      filesToPrint,
    });
    if (answer.result === false) return;

    if (answer.listNotSaved) {
      rp.ExitFromFolderAPI.forceUpdate({
        folderName: '',
      });
      deps.setState({
        filesToPrint,
        ...setGivenFilesToPrint({ val: filesToPrint }),
      });
    }
    else if (answer.listChanged) {
      deps.setState({
        filesToPrint,
      });
    }
  });  
}

function isToPrint({
  val,
}) {
  return [undefined, 0].includes(val) ? false : true;
}

function isNeedToSaveFilesToPrint(props) { 
  const {
    deps,
  } = PrintComp;
  const filesToPrint = props?.filesToPrint || deps.state.filesToPrint;
  const listNotSaved = Object.keys(filesToPrint).length && deps.state.path === '';
  const listChanged = JSON.stringify(filesToPrint) !== JSON.stringify(deps.state.givenFilesToPrint);

  return {
    result: listNotSaved || listChanged,
    listNotSaved,
    listChanged,
  };
}

export const updateFilesToPrint = {
  update(props) {
    const filesToPrint = this.getFilesToPrint(props);
    filesToPrint[props.photoSrc] = {
      ...filesToPrint[props.photoSrc],
      cnt: props.val.cnt,
    };
    return filesToPrint;
  },
  add(props) {
    const filesToPrint = this.getFilesToPrint(props);
    filesToPrint[props.photoSrc] = {
      cnt: props.val.cnt,
    };
    return filesToPrint;

  },
  delete(props) {
    const filesToPrint = this.getFilesToPrint(props);
    delete filesToPrint[props.photoSrc];
    return filesToPrint;
  },
  getFilesToPrint(props) {
    const { deps } = PrintComp;
    return props.filesToPrint || deps.state.filesToPrint;
  }
}

function setGivenFilesToPrint({
  val,
}) {
  return {
    givenFilesToPrint: {
      ...val,
    },
  };
}