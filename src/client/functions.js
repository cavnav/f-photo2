export function tempReducer() {
  return (prevState, newState) => ({ ...prevState, ...newState });
}