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
      const appState = JSON.parse(localStorage.getItem(this.storageItemName));
      Object.assign(appState[window.name], {
        action,
      });      
      localStorage.setItem(this.storageItemName, JSON.stringify(appState));
    },
    load() {
      const appState = localStorage.getItem(this.storageItemName);      
      if (appState) return JSON.parse(appState)[window.name];
      localStorage.setItem(this.storageItemName, JSON.stringify(this.appState));
      return this.appState[window.name];
    },
  };
}