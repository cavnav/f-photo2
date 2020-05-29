export function getTempReducer() {
  return (prevState, newState) => {
    if (newState.setItSilent) {
      newState.setItSilent.apply(prevState);
      return prevState;
    }
    return { ...prevState, ...newState }
  };
}