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
import { useMyReducer } from '../../functions';
import { channel } from '../../Channel';

// const resumeObj = new ResumeObj({
//   compName: OnePhoto.name,
// });

const BrowseComp = channel.addComp({
  fn: Browse,
  getAPI,
  getReqProps,
});

export function Browse(
) {
  const [state, setState] = useMyReducer({
    comp: {
      ref: BrowseComp,
    },
    initialState: stateInit,
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
            forceUpdate: false,
            selections: getNewSelections(),
          });
          setState({
            loading: true,
          });
          const subdir = event.target.getAttribute('src');
          rp.server.toward({ subdir })
          .then(() => 
            setState({
              loading: false,
            })
          );
        }, []),

      React.useCallback(
        function onClickItemSelector({
          event: { target },
        }) {
          const src = target.parentElement.getAttribute('src');
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

  useEffect(onFirstRender, []);
  
  useEffect(boostPerfImgRender, [rp.photosState.files]);

  useEffect(resetSelections, [state.selections]);

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

  function onFirstRender() {
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

    const curPhotoEl = document.querySelector(`.${Browse.name} .file[ind='${rp.browseState.curPhotoInd}']`);
    if (curPhotoEl) {
      curPhotoEl.scrollIntoView();
      curPhotoEl.classList.add('curFile');
    }
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
          {dir}
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
    return rp.photosState.files.map((file, ind) => {
      const style = { 'backgroundImage': `url(${rp.browseState.path}/${file})` };
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
  reqProps,
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
  });
};

function getAPI({
}) {
  return {
    toggleRightWindow,
    moveSelections,
    addAlbum,
    removeSelections,
    changeSelections,
    clearSelections,
  };

  function moveSelections() {
    const {
      state: items,
      setState,
    } = BrowseComp.deps;

    const rp = BrowseComp.getReqProps();
    
    rp.server.moveToPath({
      items,
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
    rp.server.toward()
    .then(() => 
      setState({
        loading: false,
      })
    );
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
          rp.server.toward()
          .then(() => {
            setState({
              loading: false,
              selections: getNewSelections(),
            });
          });  
        }          
      });
    }
  }

  function clearSelections(
  ) {
    const {
      setState,
    } = BrowseComp.deps;
    setState({
      forceUpdate: false,
      selections: getNewSelections(),
    });
  }

  function toggleRightWindow() {            
    const states = {
      0: 1,
      1: 2,
      2: 1,
    };
    
    const storageItem = 'browserCount';
    const count = sessionStorage.getItem(storageItem) || '0';
    const countUpd = states[count];
    sessionStorage.setItem(storageItem, countUpd);  
    if (count > 0) {
      window.location.reload();
    }
  }
}

// ------------------------------
function getNewSelections() {
  return new Set();
}

function getCheckedAction(
  {
    checked,
  } = {},
) {
  const action = {
    true: Set.prototype.add,
    false: Set.prototype.delete,
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
  
  const action = getCheckedAction({
    checked,
  });

  setState({
    forceUpdate: false,
    autoUpdate: () => { state.selections[action](src); },
  });
}

function resetSelections() {
  const { 
    state: { selections },
  } = BrowseComp.deps;

  [...document.querySelectorAll('.itemSelector')].forEach((item) => {
    const src = item.getAttribute('src');
    item.checked = selections.has(src);
  });
}

const stateInit = {
  forceUpdate: true,
  loading: true,
  previewWidth: 100,
  previewHeight: 100,
  isDialogEnabled: false,
  dialogTitle: '',
  isDialogRemoveItem: false,
  progress: 100,
  selections: new Set(),
};


