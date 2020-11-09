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
    save({
      action,
    }) {
      const resume = JSON.parse(localStorage.getItem('resume') || '{}');
      const resumeUpd = Object.assign(resume, {
        leftWindow: {
          action: action.name,
        },
      });
      localStorage.setItem('resume', JSON.stringify(resumeUpd));
    },
    load() {

    },
  };
}

export function getFileDateSrcKey({date, fileSrc}) {
  return `${date}-${fileSrc}`;
}