import React from 'react';

class Items extends Array {
  delete(ind) {
    cnt -= 1;
    removed = ind;
    inc += 1;
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
  reducer = tempReducer,
  initialState,
  fn = () => {},
  init = () => initialState,
}) {
  const [state, setState] = React.useState(init(initialState));
  return [state, dispatch];

  // ---
  function dispatch(stateUpd) {
    const nextState = reducer(state, stateUpd);
    setState(nextState);
    fn(nextState);
  }
}

export function useMyReducerWithPropsUpdated({
  reducer,
  initState,
  propsUpdated,
}) {
  const [isPropsUpdated, setIsPropsUpdated] = React.useState(true);

  React.useMemo(
    () => setIsPropsUpdated(true),
    Object.values(propsUpdated),
  );

  const [state, setState] = React.useState(initState);

  if (isPropsUpdated) {
    setIsPropsUpdated(false);
    const nextState = dispatch(
      propsUpdated,
    );
    return [nextState, dispatch];
  }

  return [state, dispatch];

  // ---
  function dispatch(
    stateUpd
  ) {
    const nextState = reducer(
      state,
      stateUpd,
    );
    setState(
      nextState,
    );

    return nextState;
  }
}

export function getFileDateSrcKey({
  date,
  fileSrc
}) {
  return `${date}-${fileSrc}`;
}


export function myArr(items) {
  let cnt = 0;
  let removed = 0;
  let inc = 0;

  let myItems = new Items(...items);
  cnt = myItems.length;

  return new Proxy(
    myItems, {
      get(
        target,
        prop,
        receiver,
      ) {
        const propInd = parseInt(prop, 10);
        if (isNaN(propInd)) {
          if (prop === 'length') {
            return cnt;
          }

          return Reflect.get(target, prop, receiver);
        }
        let propIntUpd = propInd;
        if (propInd >= removed) propIntUpd = propInd + inc;
        return Reflect.get(target, propIntUpd, receiver);
      }
    }
  );
}