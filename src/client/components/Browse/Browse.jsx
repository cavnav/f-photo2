import React from 'react';
import {
  Dialog,
  Dirs,
} from '../';
import {
  Spin,
  Progress,
} from 'antd';


import './styles.css';
import { addHandlers, getBackgroundImageStyle, getUpdatedActionLists, myCrop, 
  onMoveSelections, oppositeWindowCheckSamePaths, 
  refreshWindows, updateAddPanelComps 
} from '../../functions';
import { channel } from '../../Channel';
import { ResumeObj } from '../../resumeObj';
import { eventNames } from '../../constants';
import { Empty } from '../Empty/Empty';
import { useMutedReducer } from '../../mutedReducer';


export const Browse = channel.addComp({
  name: 'Browse',
  render,
  getAPI,
  getReqProps,
  getComps,
});

const resumeObj = new ResumeObj({
  selector: [
    window.name,
    Browse.name,
  ],
});

function render(
) {
  console.log(window.self);
  const Comp = this;
  const [state, setState] = useMutedReducer({
    setCompDeps: Comp.bindSetCompDeps(),
    initialState: getStateInit(),
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
            action: rp.OnePhoto.name,
            actions: {
              [rp.OnePhoto.name]: {
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

  React.useEffect(() => renderAddPanel({ Comp }), []);

  React.useEffect(
    () => {
      const rp = Comp.getReqProps();
      const refreshWindowWrap = () => {
        setState({
          loading: true,
        });
        rp.server.toward().then((res) => setState(res)).then(() => {
          setState({
            loading: false,
          });
        });
      }
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
        {state.isDialogEnabled && (
          <Dialog.r
            onCancel={onDialogCancel}
          >
            <div>{state.dialogTitle}</div>
          </Dialog.r>
        )}
        {state.loading && <Spin size="large" />}
        {state.progress < 100 && (
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
        {getFilesToRender()}
        <Empty
          isTrue={state.dirs.length === 0 && state.files.length === 0}
        />

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
  comps,
  channel,
}) {
  const {
    browserCount,
  } = resumeObj.state;

  return {
    server: channel.server,
    ...comps,
    isSecondWindow: browserCount > 1,
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
}

// ------------------------------

async function onToggleSecondWindow({
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

  // Чтобы сбросить путь с другой стороны и в следующий раз открывалось с начала.
  resumeObj.saveMerge({
    val: {
      browserCount: browserCountUpd,
      ...(window.oppositeWindow && {[window.oppositeWindow]: {} }),
    },
  });
  
  await rp.server.resetNavigation({
    curWindow: window.oppositeWindow,
  });

  window.parent.location.reload();
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

  updateAddPanelComps({ Comp });

  // ------------------------------------
  function updateSelections() {
    // i.e. clickFolder event or exitFromFolder.
    if (src === undefined) return new Set();

    const action = ({ true: 'add', false: 'delete' })[checked];

    state.selections[action](src);
    return state.selections;
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

  refreshWindows({
    Comp,
  });
}

function renderAddPanel({
  Comp,
}) {
  const rp = Comp.getReqProps();
  const {
    state,
  } = Comp.getDeps();
  const additionalActions = [
    rp.ExitFromFolder,
    rp.ToggleSecondWindow,
    rp.AddAlbum,
    rp.Rename,
    rp.MoveSelections,
    rp.RemoveSelections,
  ];
  const src = state.path.concat(state.sep);

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
      rp.RenameAPI.forceUpdate({
        onClick: (props) => onRename({
          ...props,
          Comp,
        }),
      });
      rp.ToggleSecondWindowAPI.forceUpdate({
        onClick: () => {
          console.log("onToggle");
          onToggleSecondWindow({
            Comp,
          });
        }
      });
      rp.MoveSelectionsAPI.forceUpdate({
        onClick: () => {
          const selections = [...state.selections.values()];
          rp.server.moveToPath({
            items: selections,
            updatedActionLists: getUpdatedActionLists(),
            destWindow: window.oppositeWindow,
          })
          .then((props) => {
            resumeObj.saveUpdatedActionLists({
              lists: props.updatedActionLists,
            });
            return props;
          })
          .then(() => onMoveSelections({ 
            Comp,           
            onChangeSelections: () => changeSelections({
              Comp,
            }),
         }));
        }
      });
      rp.RemoveSelectionsAPI.forceUpdate({
        onClick: () => {
          const selections = [...state.selections.values()];
          rp.server.removeItems({
            items: selections,
            updatedActionLists: getUpdatedActionLists(),
          })
          .then((props) => {
            resumeObj.saveUpdatedActionLists({
              lists: props.updatedActionLists,
            });
            return props;
          })
          .then(({
          }) => onMoveSelections({ 
            Comp, 
            onChangeSelections: () => changeSelections({
              Comp,
            }),
          }));
        },
      });

      updateAddPanelComps({
        Comp,
        items: {
          [rp.Rename.name]: {
            title: 'Переименовать',
          },
        }
      });
    });

  resetTo({
    Comp,
  });

  return () => {
    console.log('browse unmount')
    rp.AdditionalPanelAPI.renderIt({
      actions: [],
    });      
  };
}

function getComps({
  channelComps,
}) {
  const {
    App,
    OnePhoto,
    AdditionalPanel,
    Notification,

    AddAlbum,
    CustomAction,
    Label,
  } = channelComps;
  return {
    toClone: {
      AddAlbum,
      MoveSelections: Label,
      RemoveSelections: CustomAction,
      ExitFromFolder: Label,
      ToggleSecondWindow: Label,
      Rename: Label,
    },
    items: {
      App,
      OnePhoto,
      Notification,
      AdditionalPanel,
    }
  };
}

function resetTo({
  Comp,
}) {
  const rp = Comp.getReqProps();
  const {
    state,
    setState,
  } = Comp.getDeps();

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