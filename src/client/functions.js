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

export function getPhotoDataKey({date, photoSrc}) {
  return `${date}-${photoSrc}`;
}