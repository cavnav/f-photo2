import React from 'react';

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
  reducer = (state, stateUpd) => stateUpd,
  initialState,
  props,
  comp = {},
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
  return [state, dispatch];

  // ---
  function dispatch(stateUpd) {
    const stateReduced = reducer(state, stateUpd);    
  
    Object.assign(
      state,
      stateReduced,
      {
        forceUpdate: true,
      }
    );

    fn(state);

    if (comp.ref) {
      comp.ref.setDeps({
        state,
        setState: dispatch,
      });
    }
    // console.log('zz', JSON.stringify(stateUpd));
    if (stateReduced.forceUpdate === false) {      
      return;
    }
    forceUpdate();
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

export function createPropCrop({
  source,
}) {
  return (items) => objCrop({
    source,
    items,
  });
}

export function objCrop({
  source,
  items,
}) {
  return Object.keys(items).reduce((res, item) => { res[item] = source[item]; return res; }, {});
}