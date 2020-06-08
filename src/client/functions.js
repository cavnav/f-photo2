export function tempReducer({ 
  selfReducer = () => {}, 
} = {}) {
  return (prevState, newState) => {
    if (newState.setItSilent) {
      newState.setItSilent.apply(prevState);
      return prevState;
    }
    const stateRes = { 
      ...prevState, 
      ...newState,
    };

    return Object.assign(stateRes, selfReducer(stateRes));
  };
}