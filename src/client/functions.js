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

export function getResumeObj() {
  return {
    appState: {
      leftWindow: {

      },
      rightWindow: {

      },
      browserCount: 0,
      toPrint: {},
      toShare: {},
    },
    storageItemName: 'resume',
    save({
      action,
    }) {
      const resume = JSON.parse(localStorage.getItem(this.storageItemName));
      const resumeUpd = Object.assign(resume, {
        leftWindow: {
          action,
        },
      });
      localStorage.setItem(this.storageItemName, JSON.stringify(resumeUpd));
    },
    load() {
      return JSON.parse(localStorage.getItem(this.storageItemName) || this.appState);
    },
  };
}

export function getFileDateSrcKey({date, fileSrc}) {
  return `${date}-${fileSrc}`;
}