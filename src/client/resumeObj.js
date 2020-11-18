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
    save(props) {
      const appState = JSON.parse(localStorage.getItem(this.storageItemName));
      Object.assign(appState[window.name], {
        ...props,
      });      
      localStorage.setItem(this.storageItemName, JSON.stringify(appState));
    },
    load(props) {
      const appState = localStorage.getItem(this.storageItemName);      
      if (appState) return JSON.parse(appState)[window.name];
      
      localStorage.setItem(this.storageItemName, JSON.stringify(Object.assign(this.appState, {
        [window.name]: props
      })));
      return props;
    },
  };
}