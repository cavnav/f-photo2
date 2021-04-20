import React, { useEffect } from 'react';
import { 
  Help, 
  Actions,
  Dialog 
} from '../';
import { 
  Spin,
  Progress,
} from 'antd';

import './styles.css';
import { getOppositeWindowObj, oppositeWindowCheckSamePaths, useMyReducer } from '../../functions';
import { channel } from '../../Channel';
import { MoveSelections } from '../MoveSelections/MoveSelections';
import { ResumeObj } from '../../resumeObj';
import { eventNames } from '../../constants';

const resumeObj = new ResumeObj({
  compName: Browse.name,
});

const BrowseComp = channel.addComp({
  fn: Browse,
  getAPI,
  getReqProps,
});

export function Browse(
) {
  const [state, setState] = useMyReducer({
    comp: {
      setDeps: BrowseComp.setDeps,
    },
    initialState: resumeObj.load({
        props: stateInit,
        helper: (state) => {
          return {
            ...state,
            selections: new Set(state.selections),
          };
        }
      }),
    fn: (state) => {
      resumeObj.save({
        stateUpd: {
          ...state,
          selections: [...state.selections],
        },
      });
    }
  });

  const rp = BrowseComp.getReqProps();

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

  React.useEffect(
    () => {      
      document.addEventListener(eventNames.refreshWindow, refreshWindow);
      return () => document.removeEventListener(eventNames.refreshWindow, refreshWindow);
    },
    []
  );

  React.useEffect(oppositeWindowCheckSamePaths, [rp.browseState.path]);

  const dispatcher = {};

  addHandlers({
    target: dispatcher,
    fns: [
      React.useCallback(
        function onClickDir({
          event
        }) {
          const rp = BrowseComp.getReqProps();
          setState({
            loading: true,
          });
          const subdir = event.target.getAttribute('src');
          rp.server.toward({ subdir })
          .then(() => {
            changeSelections();
            setState({
              loading: false,
            });
          });
        }, []),

      React.useCallback(
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
        []
      ),
      React.useCallback(
        function onClickFile({
          event
        }) {
          const rp = BrowseComp.getReqProps();
          
          rp.setBrowseState({      
            curPhotoInd: +event.target.getAttribute('ind'),
          });
      
          rp.setAppState({
            action: Actions.OnePhoto.name,
          })
        },
        []
      )
    ],
  });

  const onClickDispatcher = React.useCallback((event) => {
    const { target } = event;
    const onClickCb = target.getAttribute('clickcb');

    onClickCb && dispatcher[onClickCb]({
      event,
    });
  }, []);

  useEffect(resetTo, []);

  useEffect(scrollToSelectedImage, [rp.browseState.curPhotoInd]);
  
  useEffect(boostPerfImgRender, [rp.photosState.files]);

  useEffect(htmlResetSelections, [state.selections]);

  return getRender();

  // --------------------------------------------------------------------
  function getRender() {
    return (
      <div 
          className={`${Browse.name}`}
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

        { getDirsToRender() }
        { getFilesToRender() }   

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
    if (rp.browseState.curPhotoInd === -1) {
      const curPhotoEl = document.querySelector(`.${Browse.name} .file.curFile`);
      if (curPhotoEl) {
        curPhotoEl.classList.remove('curFile');
      }
      return;
    }
    const curPhotoEl = document.querySelector(`.${Browse.name} .file[ind='${rp.browseState.curPhotoInd}']`);
    if (curPhotoEl) {
      curPhotoEl.scrollIntoView();
      curPhotoEl.classList.add('curFile');
    }
  }

  function resetTo() {
    const rp = BrowseComp.getReqProps();
    setState({
      loading: true,
    });
    rp.server.toward({
      resetTo: rp.browseState.path,
    })
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

  function getDirsToRender() {
    const rp = BrowseComp.getReqProps();
    return rp.photosState.dirs.map(dir => {
      return (
        <div 
          key={dir}
          src={dir}
          className="positionRel fitPreview dir"
          clickcb={dispatcher.onClickDir.name}
        >
          {dir.slice(1)}
          <input
            className="itemSelector positionAbs"
            type="checkbox"
            src={dir}
            clickcb={dispatcher.onClickItemSelector.name}
          />
        </div>
      );
    });
  }

  function getFilesToRender() {
    const rp = BrowseComp.getReqProps();
    const browsePath = rp.browseState.path + rp.browseState.sep;
    return rp.photosState.files.map((file, ind) => {
      const style = { 'backgroundImage': `url('${encodeURI(browsePath + file)}')` };
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

  // const BrowseProps = BrowseComp.getAllProps();
  // const rp = BrowseComp.getReqProps({
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
    s: { 
      appState: 1,
      photosState: 1,
      browseState: 1,
    },
    d: {
      setAppState: 1,
      setBrowseState: 1,
      setPhotosState: 1,
    },
    API: {
      comps: {
        server: 1, 
      },
    },
    comps: {
      [MoveSelections.name]: {
        API: 'MoveSelectionsAPI',
      },
    },
  });
};

function getAPI({
}) {
  return {
    getCountSelections,
    toggleRightWindow,
    moveSelections,
    addAlbum,
    removeSelections,
    changeSelections,
  };

  // ----------------------------------------
  function getCountSelections() {
    const {
      state,
    } = BrowseComp.deps;
    return state ? state.selections.size : 0;
  }

  function moveSelections() {
    const {
      state,
      setState,
    } = BrowseComp.deps;

    const rp = BrowseComp.getReqProps();

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
    } = BrowseComp.deps;
    const rp = BrowseComp.getReqProps();
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
    } = BrowseComp.deps;
    const rp = BrowseComp.getReqProps();
    
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
      const rp = BrowseComp.getReqProps();
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
    const rp = BrowseComp.getReqProps();
    const appState = resumeObj.state;
    const browserCount = appState.browserCount;
    const browserCountUpd = states[browserCount];

    resumeObj.saveCustom({    
      browserCount: browserCountUpd,
      rightWindow: {},
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

function addHandlers({
  target,
  fns,
}) {
  const fnsObj = fns.reduce((res, fn) => { res[fn.name] = fn; return res; }, {});
  Object.assign(
    target,
    fnsObj,
  );
}

function changeSelections({
  src,
  checked,
} = {}
) {
  const {
    state,
    setState,
  } = BrowseComp.deps;
  const {
    MoveSelectionsAPI,
  } = BrowseComp.getReqProps();

  const action = getCheckedAction({
    checked,
  });
  
  setState({
    forceUpdate: false,
    autoUpdate: () => {
      if (action === Set.prototype.clear.name) {
        state.selections = new Set();
      }
      else {
        state.selections[action](src); 
      }
      MoveSelectionsAPI.forceUpdate(); 
    },
  });
}

function htmlResetSelections() {
  const { 
    state: { selections },
  } = BrowseComp.deps;

  [...document.querySelectorAll('.itemSelector')].forEach((item) => {
    const src = item.getAttribute('src');
    item.checked = selections.has(src);
  });
}

const stateInit = {
  loading: true,
  previewWidth: 100,
  previewHeight: 100,
  isDialogEnabled: false,
  dialogTitle: '',
  isDialogRemoveItem: false,
  progress: 100,
  selections: new Set(),
};

function refreshWindow() {
  const rp = BrowseComp.getReqProps();
  return rp.server.toward();
}

async function refreshWindows() {
  const promise = await refreshWindow();
  const oppositeWindowObj = getOppositeWindowObj();
  oppositeWindowObj && oppositeWindowObj.document.dispatchEvent(
    new Event(eventNames.refreshWindow)
  );
  return promise;
}