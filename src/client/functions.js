import React from 'react';

class MyItems {
  constructor({
    items,
  }) {
    this.items = items;
    return this;
  }

  delete(ind) {
    delete this.items[ind];
    this.items = this.items.filter((i) => i);
  }
}
class Items extends Array {
  cnt = 0;
  removed = 0;
  inc = 0;

  constructor(...props) {
    super(...props);
    this.cnt = props.length;
  }

  delete(ind) {
    this.cnt -= 1;
    this.removed = ind;
    this.inc += 1;
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

export function useMyReducer({
  reducer = tempReducer,
  initialState,
  fn = () => {},
  init = () => ({ ...initialState }),
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

export function myArray({
  items,
}) {
  return new MyItems({
    items
  });
}

export function myArr({
  items
}) {
  let myItems = new Items(...items);

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
            return receiver.cnt;
          }

          return Reflect.get(target, prop, receiver);
        }
        let propIntUpd = propInd;
        if (propInd >= receiver.removed) propIntUpd = propInd + receiver.inc;
        return Reflect.get(target, propIntUpd, receiver);
      }
    }
  );
}