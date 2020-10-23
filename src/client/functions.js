export function tempReducer (
  prevState, 
  newState = {},
  reducer,
) {
  if (newState.setItSilent) {
    newState.setItSilent.apply(prevState);
    return prevState;
  }
  if (reducer) {
    return reducer({
      prevState, 
      newState,
    });
  }
  return { 
    ...prevState, 
    ...newState,
  };
};

export function getFileDateSrcKey({date, fileSrc}) {
  return `${date}-${fileSrc}`;
}