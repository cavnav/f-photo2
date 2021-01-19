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
  {}
) {
  const {
    appState,
    browseState, 
    files,
    dirs,

    setAppState,
    setBrowseState,
    server,
  } = BrowseComp.reqProps;

  const [state, setState] = useMyReducer({
    initialState: stateInit,
  });

  Object.assign(
    BrowseComp.deps,
    {
      state,
      setState,
    }
  );

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
          setState({
            loading: true,
          });
          const subdir = event.target.getAttribute('src');
          server.toward({ subdir })
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
          const stateUpd = changeSelections({
            src,
            checked,
            selections: state.selections,
          });
          
          setState(stateUpd);
        },
        []
      ),
      React.useCallback(
        function onClickFile({
          event
        }) {
          setBrowseState({      
            curPhotoInd: +event.target.getAttribute('ind'),
          });
      
          setAppState({
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
  useEffect(boostPerfImgRender, [files]);

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

        <Help
          toRender={toRenderHelp()}
          {...{ doNeedHelp: appState.doNeedHelp }}
        />
      </div>
    );
  }

  function onFirstRender() {
    setState({
      loading: true,
    });
    server.toward({
      resetTo: browseState.path,
    })
    .then(() => setState({
      loading: false,
    }));

    const curPhotoEl = document.querySelector(`.${Browse.name} .file[ind='${browseState.curPhotoInd}']`);
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
    return dirs.map(dir => {
      return (
        <div 
          key={dir}
          src={dir}
          className="positionRel fitPreview100 dir"
          clickcb={dispatcher.onClickDir.name}
        >
          {dir}
          <input
            className="itemSelector positionAbs"
            type="checkbox"
            clickcb={dispatcher.onClickItemSelector.name}
          />
        </div>
      );
    });
  }

  function getFilesToRender() {
    return files.map((file, ind) => {
      return (
        <div 
          key={file}
          className='positionRel fitPreview100 file scrollwait'
          style={{ 'backgroundImage': `url(${file})` }}
          ind={ind} 
          src={file}
          clickcb={dispatcher.onClickFile.name}
        >
          <input
            className="itemSelector positionAbs"
            type="checkbox"
            clickcb={dispatcher.onClickItemSelector.name}
            defaultChecked={state.selections.has(file)}
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
  return channel.crop({
    s: { 
      appState: 1,
      photosState: { 
        files: 1,
        dirs: 1,
      },
      browseState: 1,
    },
    d: {
      setAppState: 1,
      setBrowseState: 1,
    },
    API: {
      comps: {
        server: 1, 
      },
    },
  });
};

function getAPI({
  deps,
  reqProps,
}) {
  return {
    toggleRightWindow() {            
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
    },
    moveItems() {
      const {
        state: items,
        setState,
      } = deps;

      const {
        server,
      } = reqProps;
      
      server.moveToPath({
        items,
      });

      setState({
        progress: 0, 
      });

      checkCopyProgressWrap();

      // ---------------------------------------
      function checkCopyProgressWrap({
      } = {}) {
        server.$checkCopyProgress()
          .then(({
            copyProgress,
          }) => {
            setTimeout(() => (copyProgress === 100 ? null : checkCopyProgressWrap()), 500);
            setState({
              progress: copyProgress,
            });
          });
      };
    },
    async addAlbum({
      albumName
    }) {
      const {
        setState,
      } = deps;
      const {
        server,
      } = reqProps;
      const res = await server.addAlbum({
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
      server.toward()
      .then(() => 
        setState({
          loading: false,
        })
      );
    },
    removeItems(
      { } = {}
    ) {
      const {
        state,
        setState,
      } = deps;
      const {
        server,
      } = reqProps;

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

      server.removeItems({
        items: [...state.selections.values()],
      });

      checkProgress();

      return;

      // ----------------------
      function checkProgress(
        {} = {}
      ) {
        server.$checkCopyProgress()
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
            server.toward()
            .then(() => {
              setState({
                loading: false,
                selections: new Set(),
              });
            });  
          }          
        });
      }
    },
    changeSelections(
      {
        src,
        checked,
      } = {},
    ) {
      const {
        state,
        setState,
      } = deps;
      
      const stateUpd = changeSelections({
        checked,
        selections: state.selections,
        src,
      });

      setState(stateUpd);
    }
  };
};

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

function changeSelections(
  {
    src,
    checked,
    selections: selectionsUpd,
  } = {},
) {
  const action = {
    true: Set.prototype.add,
    false: Set.prototype.delete,
  }[checked].name;

  selectionsUpd[action](src);

  const stateUpd = {
    forceUpdate: false,
    selections: selectionsUpd,
  };
  return stateUpd;
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


