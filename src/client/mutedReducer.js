import React from 'react';

export function useMutedReducer({
    initialState = {},
    reducer,
    props, // props will inject to state.
    setCompDeps,
    fn = () => { },
    init = () => {
      return reducer ? reducer({
        state: initialState,
        updateState: {},
      }) : {
        ...initialState,
      };
    },
  }) {
    const [_, forceUpdate] = React.useReducer((x) => !x, false);
    const [state] = React.useState(init());
  
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
        initialState,
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
  
      return;
  
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