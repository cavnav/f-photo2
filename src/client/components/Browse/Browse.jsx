import React from 'react';
import { 
  Help, 
  Actions,
  Dialog,
  Dirs,
  Notification,
} from '../';
import { 
  Spin,
  Progress,
} from 'antd';



import './styles.css';
import { addHandlers, getBackgroundImageStyle, getOppositeWindowObj, getReqComps, myCrop, oppositeWindowCheckSamePaths, useMyReducer } from '../../functions';
import { channel } from '../../Channel';
import { ResumeObj } from '../../resumeObj';
import { eventNames } from '../../constants';
import { MoveSelections } from '../MoveSelections/MoveSelections';
import { Empty } from '../Empty/Empty';
import { AdditionalPanel } from '../AdditionalPanel/AddPanel';
import { Label } from '../Label/Label';
import { AddAlbum  } from '../AddAlbum/AddAlbum';
import { getAppAPI } from '../../App';
import { Select } from '../Dialog';

const ExitFromFolder = Label.clone({ compId: 'ExitFromFolder' });
const ToggleRightWindow = Label.clone({ compId: 'ToggleRightWindow' });
const RemoveSelections = Label.clone({ compId: 'RemoveSelections' });
const additionalActions = [
  ExitFromFolder,
  ToggleRightWindow,
  AddAlbum,
  MoveSelections,
  RemoveSelections,
];

export const Browse = channel.addComp({ 
  name: 'Browse',
  render,
  getAPI,
  getReqProps,
});

const resumeObj = new ResumeObj({
  selector: [
    window.name,
    Browse.name,
  ],
});

function render(
) {
  const Comp = this;
  const [state, setState] = useMyReducer({
    setCompDeps: Comp.bindSetCompDeps(),
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
          } = Comp.getAPI();
          setState({
            loading: true,
          });
          const dir = event.target.getAttribute('src');
          console.log('dispatch')
          rp.server.toward({ dir })
          .then(onNavigate)
          .then(() => {
            changeSelections({
              Comp,
            });
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
            Comp,
            src,
            checked,
          });
        },
          
        function onClickFile({
          event
        }) {
          const rp = Comp.getReqProps();
          
          setState({     
            curPhotoInd: +event.target.getAttribute('ind'),
          });
      
          rp.AppAPI.toggleActions({
            action: Actions.OnePhoto.name,
            actions: {
              [Actions.OnePhoto.name]: {
                isEnabled: true,
              },
              [Browse.name]: {
                isEnabled: false,
              },
            }
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
    rp.AdditionalPanelAPI.renderIt({
      actions: additionalActions,
    })
    .then(() => {
      rp.AddAlbumAPI.forceUpdate({
        onClick: (props) => onAddAlbum({
          ...props,
          Comp,
        }),
      });
      rp.ToggleRightWindowAPI.forceUpdate({
        title: 'Отобразить второе окно',
        onClick: () => onToggleRightWindow({
          Comp,
        }),
      });
      rp.MoveSelectionsAPI.forceUpdate({
        itemsCount: state.selections.size,
        onClick: () => onMoveSelections({ Comp }),
      });
      rp.RemoveSelectionsAPI.forceUpdate({
        title: getRemoveSelectionsTitle({
          count: state.selections.size,
        }),
        onClick: () => Comp.getAPI().removeSelections(),
      });
    });    

    resetTo();

    return () => {
      console.log('browse unmount')
      rp.AdditionalPanelAPI.renderIt({
        actions: [],
      });
    };   
  }, []);

  React.useEffect(
    () => {      
      const refreshWindowWrap = () => refreshWindow({ Comp });
      document.addEventListener(eventNames.refreshWindow, refreshWindowWrap);
      return () => document.removeEventListener(eventNames.refreshWindow, refreshWindowWrap);
    },
    []
  );

  React.useEffect(oppositeWindowCheckSamePaths, [state.path]);

  React.useEffect(scrollToSelectedImage, [state.curPhotoInd]);
  
  React.useEffect(boostPerfImgRender, [state.files]);

  React.useEffect(() => htmlResetSelections({
    Comp,
  }), [state.selections]);

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
          <Dialog.r       
            onCancel={onDialogCancel}    
          >
            <div>{state.dialogTitle}</div>
          </Dialog.r>
        )}

        {/* <Help
          toRender={toRenderHelp()}
          {...{ doNeedHelp: rp.appState.doNeedHelp }}
        /> */}
      </div>
    );
  }

  function scrollToSelectedImage() {
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
    const rp = Comp.getReqProps();
    const {
      onNavigate,
    } = Comp.getAPI();

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
  const cropped = channel.crop({
    API: {
      comps: {
        server: 1, 
      },
    },
  });

  return {
    ...cropped,
    NotificationAPI: Notification.getAPI(),
    AppAPI: getAppAPI(),
    RemoveSelectionsAPI: RemoveSelections.getAPI(),
    ExitFromFolderAPI: ExitFromFolder.getAPI(),
    ToggleRightWindowAPI: ToggleRightWindow.getAPI(),
    AddAlbumAPI: AddAlbum.getAPI(),
    MoveSelectionsAPI: MoveSelections.getAPI(),
    AdditionalPanelAPI: AdditionalPanel.getAPI(),
  };
};

function getAPI({
  Comp,
  deps,
}) {
  return {
    onNavigate,
    setToResumeObj,
    getResumeObj,
    removeSelections,
    changeSelections,
  };

  // ----------------------------------------

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
    } = deps;

    setState({
      ...res,
      loading: false,
    });

    const rp = Comp.getReqProps();
    rp.ExitFromFolderAPI.forceUpdate({
      title: res.path ? `Закрыть альбом ${res.path}` : '',
      onClick: () => onExitFolder({ Comp }),
    });


    // --------------------------------------------
    function onExitFolder({
      Comp,
    }) {
      const {
        changeSelections,
        onNavigate,
      } = Comp.getAPI();
      changeSelections({
        Comp,
      });
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

  function removeSelections(
    { } = {}
  ) {
    const {
      state,
      setState,
    } = deps;
    const rp = Comp.getReqProps();
    
    if (state.selections.size === 0) {
      return;
    }

    if (state.isDialogRemoveItem === false) {
      setState({
        isDialogRemoveItem: true,
      });

      rp.NotificationAPI.forceUpdate({
        title: 'Действительно удалить? Нажми еще раз',
        onCancel: () => setState({
          isDialogRemoveItem: false,
        }),
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
          refreshWindows({
            Comp,
          })
          .then(() => {
            changeSelections({
              Comp,
            });
            setState({
              loading: false,              
            });
          });  
        }          
      });
    }
  }
}

// ------------------------------

async function onToggleRightWindow({
  Comp,
}) {            
  const states = {
    1: 2,
    2: 1,
  };
  const rp = Comp.getReqProps();
  const appState = resumeObj.state;
  const browserCount = appState.browserCount;
  const browserCountUpd = states[browserCount];

  resumeObj.saveMerge({ 
    val: {   
      browserCount: browserCountUpd,
      rightWindow: {},
    },
  });    

  // Чтобы сбросить путь с другой стороны и в следующий раз открывалось с начала.
  if (browserCountUpd === 1) {      
    await rp.server.resetNavigation({
      curWindow: window.oppositeWindow,
    });
  }
  window.location.reload();
}

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
  Comp,
  src,
  checked,
} = {}
) {
  const {
    state,
    setState,
  } = Comp.getDeps();
  
  setState({
    forceUpdate: false,
    selections: updateSelections(),
  });
    const {
      MoveSelectionsAPI,
      RemoveSelectionsAPI,
    } = Comp.getReqProps();

    MoveSelectionsAPI.forceUpdate({
      itemsCount: state.selections.size,
    }); 
    RemoveSelectionsAPI.forceUpdate({
      title: getRemoveSelectionsTitle({
        count: state.selections.size,
      }),
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

function htmlResetSelections({
  Comp,
}) {
  const { 
    state: { selections },
  } = Comp.getDeps();

  [...document.querySelectorAll('.itemSelector')].forEach((item) => {
    const src = item.getAttribute('src');
    item.checked = selections.has(src);
  });
}

function refreshWindow({
  Comp,
}) {
  console.log('refreshWindow');
  const rp = Comp.getReqProps();
  const {
    onNavigate,
  } = Comp.getAPI();
  return rp.server.toward().then(onNavigate);
}

async function refreshWindows({
  Comp,
}) {
  const promise = await refreshWindow({
    Comp,
  });
  const oppositeWindowObj = getOppositeWindowObj();
  oppositeWindowObj && oppositeWindowObj.document.dispatchEvent(
    new Event(eventNames.refreshWindow)
  );
  return promise;
}

async function onAddAlbum({
  Comp,
  albumName,
}) {
  console.log('onAddAlbum')
  const {
    setState,
  } = Comp.getDeps();
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
  refreshWindows({
    Comp,
  })
  .then(() => {
    setState({
      loading: false,
    });
  });
}

function onMoveSelections({
  Comp,
}) {
  const {
    state,
    setState,
  } = Comp.getDeps();

  const rp = Comp.getReqProps();

  rp.server.moveToPath({
    items: [...state.selections],
    destWindow: window.oppositeWindow,
  });

  setState({
    progress: 0, 
    loading: true,
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
          refreshWindows({
            Comp,
          })
          .then(() => {
            changeSelections({
              Comp,
            });
            setState({
              loading: false,              
            });
          }); 
        }
      });
  };
}

function getStateInit() {  
  const resumed = resumeObj.get();     
  return {
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

function getRemoveSelectionsTitle({
  count,
}) {
  return count ? `Удалить ${count}` : '';
}