import {
  eventNames
} from './constants';
import {
  ResumeObj,
} from './resumeObj';

import { BTN_MOVE, BTN_REMOVE, setBtnTitle } from './common/additionalActions/const';
class MyItems {
  constructor({
    items,
  }) {
    this.items = [...items];
    return this;
  }

  delete(ind) {
    delete this.items[ind];
    this.items = this.items.filter((i) => i);
  }
}

export function setItSilent({
  state,
  stateUpd,
}) {
  if (stateUpd.setItSilent) {
    stateUpd.setItSilent.apply(state);
  }
}

export function tempReducer(
  prevState,
  newState = {},
) {
  if (newState.setItSilent) {
    newState.setItSilent.apply(prevState);
    return prevState;
  }

  return {
    ...prevState,
    ...newState,
  };
};

export function getFileDateSrcKey({
  date,
  fileSrc
}) {
  return `${date}-${fileSrc}`;
}

export function myArray({
  items,
}) {
  return new MyItems({
    items
  });
}

// export function myArr({
//   items
// }) {
//   let myItems = new Items(...items);

//   return new Proxy(
//     myItems, {
//       get(
//         target,
//         prop,
//         receiver,
//       ) {
//         const propInd = parseInt(prop, 10);
//         if (isNaN(propInd)) {
//           if (prop === 'length') {
//             return receiver.cnt;
//           }

//           return Reflect.get(target, prop, receiver);
//         }
//         let propIntUpd = propInd;
//         if (propInd >= receiver.removed) propIntUpd = propInd + receiver.inc;
//         return Reflect.get(target, propIntUpd, receiver);
//       }
//     }
//   );
// }

export function isCatalogSelected({
  windowName,
}) {
  if (!windowName) return false;
  const resumeObj = new ResumeObj();
  const resumeState = resumeObj.state;
  return Boolean(_get(resumeState[windowName], 'App.browseState.path'));
}
export function isSameWindowPaths() {
  const resumeObj = new ResumeObj();
  const resumeState = resumeObj.state;
  const res = _get(resumeState.leftWindow, 'App.browseState.path', 1) ===
    _get(resumeState.rightWindow, 'App.browseState.path', 2)

  return res;
}

export function getOppositeWindowObj() {
  return window.self === window.top ? window.frames[0] : window.parent;
}

export function oppositeWindowCheckSamePaths() {
  const oppositeWindowObj = getOppositeWindowObj();
  oppositeWindowObj && oppositeWindowObj.document.dispatchEvent(new Event(eventNames.checkSameWindowPaths));
}

export function refreshOppositeWindow() {
  const oppositeWindowObj = getOppositeWindowObj();
  oppositeWindowObj && oppositeWindowObj.document.dispatchEvent(
    new Event(eventNames.refreshWindow)
  );
}

export function getCurDate() {
  const dateISO = new Date().toISOString();
  return dateISO.slice(0, dateISO.indexOf('T'));
}

export function encodeFile({
  file,
}) {
  return encodeURI(file);
}

export function getBackgroundImageStyle({
  file,
}) {
  return {
    'backgroundImage': `url('${encodeFile({ file })}')`
  };
}

export function getFromResumeObj({
  selector,
}) {
  const resumeObj = new ResumeObj();
  const resumeState = resumeObj.state;
  return myCrop({
    from: resumeState,
    selector,
  });
}

export function addHandlers({
  fns,
}) {
  return fns.reduce((res, fn) => {
    res[fn.name] = fn;
    return res;
  }, {});
}

export function updFromObj({
  obj,
  objUpd,
  stack,
}) {
  // debugger;
  if (stack && stack.length === 0) {
    return obj;
  } else if (stack === undefined) {
    stack = getUpdatedItems({
      obj,
      objUpd,
    });
  }
  let [{
    objRef,
    propName,
    isPropExists,
    propUpd,
  }] = stack;

  if (
    propUpd === undefined ||
    isPropExists === false ||
    propUpd.constructor !== Object
  ) {
    objRef[propName] = propUpd;
  } else {
    stack.push(
      ...getUpdatedItems({
        obj: objRef[propName],
        objUpd: propUpd,
      })
    );
  }
  return updFromObj({
    obj,
    stack: stack.slice(1),
  });
}

function getUpdatedItems({
  obj,
  objUpd,
}) {
  return Object.entries(objUpd).map((item) => {
    const [propName, propUpd] = item;
    const isPropExists = obj.hasOwnProperty(propName);
    return {
      objRef: obj,
      propName,
      isPropExists,
      propUpd,
    };
  });
}

export function myCrop({
  from,
  selector,
  stack,
  res = {},
}) {
  if (stack && stack.length === 0) return res;
  if (!stack) {
    stack = getSelectorItems({
      from,
      selector,
    });
  }
  let [
    [
      propName,
      propVal,
      sourceVal,
      alias = propVal,
    ]
  ] = stack;

  if (propVal.constructor !== Object) {
    res[propVal === 1 ? propName : alias] = sourceVal;
  } else if (sourceVal && sourceVal.constructor === Object) {
    stack.push(...getSelectorItems({
      from: sourceVal,
      selector: propVal,
    }))
  }

  return myCrop({
    stack: stack.slice(1),
    res,
  });
}

export function getSelectorItems({
  selector,
  from,
}) {
  return Object.entries(selector).map((item) => {
    const [propName, propVal] = item;
    return [
      propName,
      propVal,
      from[propName],
    ];
  });
}

export function getExistsProps({
  obj,
  rp,
}) {
  const hasObjKey = Object.prototype.hasOwnProperty.bind(obj);
  return Object.keys(rp).reduce((res, key) => {
    if (hasObjKey(key)) res[key] = obj[key];
    return res;
  },
    {}
  );
}

export function getStateInit({
  stateDefault,
  resumeObj,
}) {
  const resumed = resumeObj.get();
  return {
    ...stateDefault,
    ...resumed,
  };
}

export function getDefaultAPI({
  deps,
}) {
  return {
    forceUpdate(props) {
      deps.setState?.(props);
    },
    setInit() {
      deps.setState?.(deps.initialState);
    },
  };
}

export function getCompsAPI({
  items = {},
  toClone = {},
}) {
  const comps = Object.entries(items?? {}).concat(Object.entries(toClone ?? {}));
  return comps && comps.reduce((res, [name, comp]) => {
      const compUpd = toClone[name] ? comp.clone({
        name,
      }) : comp;
      return {
        ...res,
        [name]: compUpd,
        [`${name}API`]: compUpd.getAPI(),
      };
    },
    {}
  );
}

export function refreshWindows(
) {
  window.document.dispatchEvent(
    new Event(eventNames.refreshWindow),
  );

  const oppositeWindowObj = getOppositeWindowObj();
  oppositeWindowObj && oppositeWindowObj.document.dispatchEvent(
    new Event(eventNames.refreshWindow),
  );
}

export function checkServerProgress({
  service,
  onResponse,
}) {
  return new Promise((resolve) => {
    fn();

    function fn() {
      service()
        .then(({
          progress,
        }) => {
          onResponse({
            progress,
          });

          if (progress < 100) {
            setTimeout(
              () => fn(),
              500,
            );
            return;
          }

          resolve();
        });
    }
  });
}

export function updateAddPanelComps({
  Comp,
  selector,
  items = {},
}) {
  const {
    state,
  } = Comp.getDeps();

  const rp = Comp.getReqProps();
  const allComps = getComps();
  const selectorUpd = selector ? selector : allComps;

  Object.entries(selectorUpd).forEach(([compName, update]) => {
    if (allComps[compName]) {
      rp[`${compName}API`].forceUpdate(update);
    }
  });
  
  // -------------------
  function getComps() {
    return {      
      [rp.ToggleSecondWindow.name]: {
        title: 'Отобразить второе окно',
      },
      [rp.MoveSelections.name]: {
        title: setBtnTitle({
          prefix: BTN_MOVE,
          title: state.selections.size,
        }),
      },
      [rp.RemoveSelections.name]: {
        title: setBtnTitle({
          prefix: BTN_REMOVE,
          title: state.selections.size,
        }),
      },
      ...items,
    };
  }  
}

export function ProgressNotification({
  progress,
}) {
  return `Подожди. ${progress} %`;
}

export function onUpdateSrc({
  Comp,
  dest,
}) {
  // move
  // remove
  // rename folder

  const resumeObj = new ResumeObj();
  const appState = resumeObj.state;
  const {
    Print: {
      filesToPrint,
    },
    Share: {
      filesToShare = {},
    } = {},
  } = appState;

  const {
    state,
  } = Comp.getDeps();

  const rp = Comp.getReqProps();

  // for files.
  state.selections.forEach((src) => {  
    const slashSrc = state.path.concat(state.sep).concat(src);  
    [
      filesToPrint,
      filesToShare,
    ].forEach((files) => {
      if (dest !== undefined && files[slashSrc]) {
        const [fileName] = slashSrc.split(state.sep).slice(-1);
        files[dest.concat(state.sep, fileName)] = files[slashSrc];
      }
      delete files[slashSrc];
    });
  });

  const appStateUpd = {
    ...appState,
  };
  appStateUpd.Print.filesToPrint = filesToPrint;
  if (appStateUpd.Share) appStateUpd.Share.filesToShare = filesToShare;
  resumeObj.saveCore({
    val: appStateUpd,
  });
}