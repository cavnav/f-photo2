import React from 'react';
import { 
  Help, 
  Actions,
  Dialog,
  Dirs, 
} from '../';
import { 
  Spin,
  Progress,
} from 'antd';

import './styles.css';
import { addHandlers, getBackgroundImageStyle, getOppositeWindowObj, myCrop, oppositeWindowCheckSamePaths, useMyReducer } from '../../functions';
import { channel } from '../../Channel';
import { ResumeObj } from '../../resumeObj';
import { eventNames } from '../../constants';
import { MoveSelections, ExitFromFolder, Empty, AddAlbum, RemoveSelections, ToggleRightWindow } from '../';
import { AdditionalPanel } from '../AdditionalPanel/AddPanel';

const resumeObj = new ResumeObj({
  selector: [
    window.name,
    Browse.name,
  ],
});

const Comp = channel.addComp({
  fn: Browse,
  getAPI,
  getReqProps,
});

export function Browse(
) {
  const [state, setState] = useMyReducer({
    setCompDeps: Comp.setCompDeps,
    initialState: {
      ...getStateInit(),     
    },
    fn: ({
      state,
    }) => {
      resumeObj.save({
        val: {
          ...state,
          selections: Array.from(state.selections),
        },
      });
    }
  });

  const rp = Comp.getReqProps();

  const onDialogCancel = React.useCallback(() => {
    setState({
      isDialogEnabled: false,
      dialogTitle: '',
    });
  }, []);

  const onDialogRemoveCancel = React.useCallback(() => {
    setState({
      isDialogRemoveItem: false,
    });
  }, []);

  const dispatcher = React.useMemo(
    () => addHandlers({
      fns: [
        function onClickDir({
          event
        }) {
          const rp = Comp.getReqProps();
          const {
            onNavigate,
          } = Comp.API;
          setState({
            loading: true,
          });
          const dir = event.target.getAttribute('src');
          rp.server.toward({ dir })
          .then(onNavigate)
          .then(() => {
            changeSelections();
            setState({
              loading: false,
            });
          });
        },
        
        function onClickItemSelector({
          event: { target },
        }) {
          const src = target.getAttribute('src');
          const { checked } = target;
          changeSelections({
            src,
            checked,
          });
        },
          
        function onClickFile({
          event
        }) {
          const rp = Comp.getReqProps();
          const {
            setState,
          } = Comp.deps;
          
          setState({      
            curPhotoInd: +event.target.getAttribute('ind'),
            action: Actions.OnePhoto.name,
          });
      
          rp.setAppState({
            action: Actions.OnePhoto.name,
          });
        },
      ],
    }),
    []
  );

  const onClickDispatcher = React.useCallback((event) => {
    const { target } = event;
    const onClickCb = target.getAttribute('clickcb');

    onClickCb && dispatcher[onClickCb]({
      event,
    });
  }, []);

  React.useEffect(() => {
    const rp = Comp.getReqProps();
    rp.AdditionalPanelAPI.forceUpdate();
    resetTo();
  }, []);

  React.useEffect(
    () => {      
      document.addEventListener(eventNames.refreshWindow, refreshWindow);
      return () => document.removeEventListener(eventNames.refreshWindow, refreshWindow);
    },
    []
  );

  React.useEffect(oppositeWindowCheckSamePaths, [state.path]);

  React.useEffect(scrollToSelectedImage, [state.curPhotoInd]);
  
  React.useEffect(boostPerfImgRender, [state.files]);

  React.useEffect(htmlResetSelections, [state.selections]);

  return getRender();

  // --------------------------------------------------------------------
  function getRender() {
    return (
      <div 
          className={`${Browse.name} layout`}
          onClick={onClickDispatcher}
        >
        { state.loading && <Spin size="large" /> }
        { state.progress < 100 && (
          <div className="flexCenter width100pr positionAbs">
            <Progress 
              type="circle" 
              percent={state.progress}             
            />  
          </div>
        )}

        <Dirs
          dirs={state.dirs}
          onClickDirFnName={dispatcher.onClickDir.name}
          onClickItemSelectorFnName={dispatcher.onClickItemSelector.name}
        ></Dirs>
        { getFilesToRender() } 
        <Empty 
          isTrue={state.dirs.length === 0 && state.files.length === 0}
        />

        {state.isDialogEnabled && (
          <Dialog       
            onCancel={onDialogCancel}    
          >
            <div>{state.dialogTitle}</div>
          </Dialog>
        )}

        {state.isDialogRemoveItem && (
          <Dialog 
            type={Dialog.RemoveItems}      
            onCancel={onDialogRemoveCancel}    
          >
          </Dialog>
        )}

        {/* <Help
          toRender={toRenderHelp()}
          {...{ doNeedHelp: rp.appState.doNeedHelp }}
        /> */}
      </div>
    );
  }

  function scrollToSelectedImage() {
    const {
      state,
    } = Comp.deps;
    if (state.curPhotoInd === -1) {
      const curPhotoEl = document.querySelector(`.${Browse.name} .file.curFile`);
      if (curPhotoEl) {
        curPhotoEl.classList.remove('curFile');
      }
      return;
    }
    const curPhotoEl = document.querySelector(`.${Browse.name} .file[ind='${state.curPhotoInd}']`);
    if (curPhotoEl) {
      curPhotoEl.scrollIntoView();
      curPhotoEl.classList.add('curFile');
    }
  }

  function resetTo() {
    const {
      state,
    } = Comp.deps;
    const rp = Comp.getReqProps();
    const {
      onNavigate,
    } = Comp.API;

    if (state.action) {
      rp.setAppState({
        action: state.action,
      });
      return;
    }
    setState({
      loading: true,
    });
    rp.server.toward({
      resetTo: state.path,
    })
    .then(onNavigate)    
    .then(() => setState({
      loading: false,
    }));
  }

  function toRenderHelp() {
    return <div className="flexCenter marginBottom10">
      Открыть альбом<br></br>
      Закрыть альбом<br></br>
      Рассмотреть фото<br></br>
      Вернуть фото в альбом.<br></br>

    </div>
  }

  function getFilesToRender() {
    const {
      state,
    } = Comp.deps;
    const rp = Comp.getReqProps();
    const browsePath = state.path + state.sep;
    return state.files.map((file, ind) => {
      const style = getBackgroundImageStyle({
        file: `${browsePath}${file}`,
      });
      return (
        <div 
          key={file}
          className='positionRel fitPreview file scrollwait'
          style={style}
          ind={ind} 
          src={file}
          clickcb={dispatcher.onClickFile.name}
        >
          <input
            className="itemSelector positionAbs"
            type="checkbox"
            src={file}
            clickcb={dispatcher.onClickItemSelector.name}         
          />
        </div>
      );
    });
  }  
}

function boostPerfImgRender() {
  const observer = new IntersectionObserver(cb, { threshold: 1 });
  const elements = [...(document.querySelectorAll(`.${Browse.name} .scrollwait`) || [])];
  const observe = observer.observe.bind(observer);
  elements.map(observe);

  return () => { observer.disconnect(); }

  // ------
  function cb(entries) {
    const unobserve = observer.unobserve.bind(observer);
    entries.map(e => {
      e.target.classList.remove('scrollwait');
      unobserve(e.target);
    });
  }
}

// -------------------------------------------------------

function getReqProps({ 
  channel, 
}) {
  // 
  // 1. list of all props
  // 2. suggestion of every prop

  // const BrowseProps = Comp.getAllProps();
  // const rp = Comp.getReqProps({
  //   [BrowseProps.appState]: 1,
  //   [BrowseProps.photosState]: 1,            
  // });
  // rp.appState();
  // rp.photosState();       
  //

  // function newObjFromNames({
  //   names,
  // }) {
  //   return names.reduce((res, name) => { res[name] = name; return res; }, {});
  // }  
  
  // const BrowseProps = newObjFromNames({
  //   names: [
  //     'appState',
  //     'photoState',
  //     'browseState',
  //   ],
  // });
  
  // const props = channel.crop(reqProps);
  
  return channel.crop({
    d: {
      setAppState: 1,
      setPhotosState: 1,
    },
    API: {
      comps: {
        server: 1, 
      },
    },
    comps: {
      ...MoveSelections.API,
      ...ExitFromFolder.API,
      ...AdditionalPanel.API,
    },
  });
};

function getAPI({
}) {
  return {
    getCountSelections,
    onNavigate,
    setToResumeObj,
    getResumeObj,
    toggleRightWindow,
    moveSelections,
    addAlbum,
    removeSelections,
    changeSelections,
    resetAction,
    getAdditionalActions,
  };

  // ----------------------------------------
  function getAdditionalActions() {
    return [
      {
        isEnabled: true,
        comp: ExitFromFolder,
      },
      {
        isEnabled: true,
        comp: ToggleRightWindow,
      },
      {
        isEnabled: true,
        comp: MoveSelections,
      },
      {
        isEnabled: true,
        comp: AddAlbum,
      },
      {
        isEnabled: true,
        comp: RemoveSelections,
      },
    ];
  }

  function resetAction() {
    Comp.deps.setState({
      action: '',
    });
  }
  function getResumeObj({
    selector,
  } = {}) {
    const resumed = resumeObj.get();
    if (selector && selector.constructor === Object) {      
      return myCrop({
        from: resumed,
        selector,
      });
    }
    return resumed;
  }

  function setToResumeObj({
    val,
  }) {
    resumeObj.save({
      val,
    });
  }

  function onNavigate(
    res,
  ) {
    const {
      setState,
    } = Comp.deps;

    setState({
      ...res,
      loading: false,
    });

    const rp = Comp.getReqProps();
    rp.ExitFromFolderAPI.forceUpdate({
      folderName: res.path,
      onClick: onExitFolder,
    });


    // --------------------------------------------
    function onExitFolder() {
      const {
        changeSelections,
        onNavigate,
      } = Comp.API;
      changeSelections();
      resumeObj.save({
        val: {
          curPhotoInd: -1,
        },
      });
      const rp = Comp.getReqProps();
      rp.server.backward()
      .then(onNavigate);
    }
  }

  function getCountSelections() {
    const {
      state,
    } = Comp.deps;
    return state ? state.selections.size : 0;
  }

  function moveSelections() {
    const {
      state,
      setState,
    } = Comp.deps;

    const rp = Comp.getReqProps();

    rp.server.moveToPath({
      items: [...state.selections],
      destWindow: window.oppositeWindow,
    });

    setState({
      progress: 0, 
    });

    checkCopyProgressWrap();

    // ---------------------------------------
    function checkCopyProgressWrap({
    } = {}) {
      rp.server.$checkCopyProgress()
        .then(({
          copyProgress,
        }) => {
          setTimeout(() => (copyProgress === 100 ? null : checkCopyProgressWrap()), 500);
          setState({
            progress: copyProgress,
          });

          if (copyProgress === 100) {
            changeSelections();
            setState({
              selections: new Set(),
            });   
                 
            refreshWindows();
          }
        });
    };
  }

  async function addAlbum({
    albumName
  }) {
    const {
      setState,
    } = Comp.deps;
    const rp = Comp.getReqProps();
    if (albumName === '') {
      setState({
        isDialogEnabled: true,
        dialogTitle: `Дай альбому название!`,
      }); 
      return;  
    }
    const res = await rp.server.addAlbum({
      albumName,
    });

    if (!res) {
      setState({
        isDialogEnabled: true,
        dialogTitle: `Альбом ${albumName} уже есть!`,
      }); 
      return;               
    }

    setState({
      loading: true,
    });
    refreshWindows()
    .then(() => {
      setState({
        loading: false,
      });
    });
  }

  function removeSelections(
    { } = {}
  ) {
    const {
      state,
      setState,
    } = Comp.deps;
    const rp = Comp.getReqProps();
    
    if (state.selections.size === 0) {
      return;
    }

    if (state.isDialogRemoveItem === false) {
      setState({
        isDialogRemoveItem: true,
      });
      return;
    }  

    setState({        
      progress: 0,
      isDialogRemoveItem: false,
    });

    rp.server.removeItems({
      items: [...state.selections.values()],
    });

    checkProgress();

    return;

    // ----------------------
    function checkProgress(
      {} = {}
    ) {
      const rp = Comp.getReqProps();
      rp.server.$checkCopyProgress()
      .then(({
        copyProgress,
      }) => {
        setState({
          progress: copyProgress,
        });
        
        if (copyProgress < 100) {
          setTimeout(
            () => checkProgress(),
            500,
          );
        } else {
          setState({
            loading: true,
          });
          refreshWindows()
          .then(() => {
            changeSelections();
            setState({
              loading: false,              
            });
          });  
        }          
      });
    }
  }

  async function toggleRightWindow() {            
    const states = {
      1: 2,
      2: 1,
    };
    const rp = Comp.getReqProps();
    const appState = resumeObj.state;
    const browserCount = appState.browserCount;
    const browserCountUpd = states[browserCount];

    resumeObj.save({ 
      val: {   
        browserCount: browserCountUpd,
        rightWindow: {},
      },
    });    

    if (browserCountUpd === 1) {      
      await rp.server.resetNavigation({
        curWindow: window.oppositeWindow,
      });
    }
    window.location.reload();
  }
}

// ------------------------------

function getCheckedAction(
  {
    checked,
  } = {},
) {
  const action = {
    true: Set.prototype.add,
    false: Set.prototype.delete,
    undefined: Set.prototype.clear,
  }[checked].name;
  return action;
}

function changeSelections({
  src,
  checked,
} = {}
) {
  const {
    state,
    setState,
  } = Comp.deps;
  
  setState({
    forceUpdate: false,
    selections: updateSelections(),
  })
  .then(() => {
    const {
      MoveSelectionsAPI,
    } = Comp.getReqProps();
    MoveSelectionsAPI.forceUpdate(); 
  });


  // ------------------------------------
  function updateSelections() {
    const action = getCheckedAction({
      checked,
    });
  
    const newSet = action === Set.prototype.clear.name ?
      new Set() : undefined;
        
    state.selections[action](src); 

    return newSet || state.selections;
  }
}

function htmlResetSelections() {
  const { 
    state: { selections },
  } = Comp.deps;

  [...document.querySelectorAll('.itemSelector')].forEach((item) => {
    const src = item.getAttribute('src');
    item.checked = selections.has(src);
  });
}

function refreshWindow() {
  const rp = Comp.getReqProps();
  const {
    onNavigate,
  } = Comp.API;
  return rp.server.toward().then(onNavigate);
}

async function refreshWindows() {
  const promise = await refreshWindow();
  const oppositeWindowObj = getOppositeWindowObj();
  oppositeWindowObj && oppositeWindowObj.document.dispatchEvent(
    new Event(eventNames.refreshWindow)
  );
  return promise;
}

function getStateInit() {  
  const resumed = resumeObj.get();     
  return {
    action: '',
    loading: true,
    previewWidth: 100,
    previewHeight: 100,
    isDialogEnabled: false,
    dialogTitle: '',
    isDialogRemoveItem: false,
    progress: 100,    
    sep: undefined,
    path: '',
    curPhotoInd: -1,
    scrollY: 0,
    files: [],
    dirs: [],

    ...resumed,
    selections: new Set(resumed.selections),
  };
}