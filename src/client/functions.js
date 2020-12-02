import React from 'react';

export function tempReducer (
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

export function getFileDateSrcKey({date, fileSrc}) {
  return `${date}-${fileSrc}`;
}