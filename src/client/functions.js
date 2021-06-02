import { crop } from 'jimp';
import { get as _get } from 'lodash';
import React from 'react';
import { eventNames } from './constants';
import { ResumeObj, resumeObjConstants } from './resumeObj';

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
// class Items extends Array {
//   cnt = 0;
//   removed = 0;
//   inc = 0;

//   constructor(...props) {
//     super(...props);
//     this.cnt = props.length;
//   }

//   delete(ind) {
//     this.cnt -= 1;
//     this.removed = ind;
//     this.inc += 1;
//   }
// }

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

export function useMyReducer({
  initialState = {},
  reducer,
  props, // props will inject to state.
  setCompDeps,
  fn = () => {},
  init = () => ({ ...initialState }),
}) {
  const [forceUpdate] = React.useReducer((x) => !x, false).slice(1);
  const [state] = React.useState(init(initialState));
  props && React.useMemo(
    () => {      
      const stateUpd = {
        ...props,
        forceUpdate: false,
      };
      dispatch(stateUpd);
    },
    Object.values(props),
  );
  setCompDeps && setCompDeps({
    deps: {
      state,
      setState: dispatch,
    },
  });
  return [state, dispatch];

  // ---
  function dispatch(stateUpd) {
    updateState({
      state,
      stateUpd,
      reducer,
    });

    fn({
      state,
      stateUpd,
    });

    // console.log('zz', JSON.stringify(stateUpd));
    stateUpd.forceUpdate === undefined &&
      forceUpdate();


    return Promise.resolve();

    // -----------------------
    
    function updateState({
      state,
      stateUpd,
      reducer,
    }) {      
      const stateReduced = reducer ? 
        reducer({ 
          state, 
          stateUpd
        }) : 
        undefined;
        
      Object.assign(
        state,
        stateReduced || stateUpd,
      );
    }
  }
}

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
}
) {
  return encodeURI(file);
}

export function getBackgroundImageStyle({
  file,
}) {
  return { 'backgroundImage': `url('${encodeFile({ file })}')` };
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
  return fns.reduce((res, fn) => { res[fn.name] = fn; return res; }, {});
}

export function updFromObj({
  obj,
  objUpd,
  stack,
}) {
  // debugger;
  if (stack && stack.length === 0) {
      return obj;
  }
  else if (stack === undefined) {
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
  }
  else {
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

function getSelectorItems({
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
