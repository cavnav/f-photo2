import { 
  get as _get,
  set as _set, 
} from 'lodash';

export const resumeObjConstants = {
  storageItemName:'resume',
  filesWithStatuses: 'filesWithStatuses',
  browserCount: 'browserCount',
};
export class ResumeObj {
  constructor({
    compName,
    isGlobal,
  } = {}) {
    Object.assign(
      this,
      {
        compName,
        isGlobal,
      },
    );

    if (this.state === null) {
      this.saveCustom({
        stateUpd: this.defAppState,
      });
    }
  }

  compName = '';
  defAppState = {
    [resumeObjConstants.browserCount]: 1,
    leftWindow: {
      // OnePhoto: {},
    },
    rightWindow: {
    },
    [resumeObjConstants.filesWithStatuses]: {},
    // [Print.name]: {},
    // [Share.name]: {},
  };

  save({ 
    stateUpd, 
    compName,
  }) { 
    const compNameFullSrc = this.isGlobal === true ? 
        [this.compName] : 
        [window.name, this.compName]
        .concat(compName ? compName.split('.') : []);

    let appStateUpd = this.state;
    _set(appStateUpd, compNameFullSrc, stateUpd);
    
    localStorage.setItem(
      resumeObjConstants.storageItemName, 
      JSON.stringify(appStateUpd)
    );
  }

  saveCustom({
    stateUpd
  }) {
    localStorage.setItem(
      resumeObjConstants.storageItemName, 
      JSON.stringify({
        ...this.state,
        ...stateUpd,
      }),
    );
  }

  load({
    compName = '',
  }) {
    const compNameFullSrc = this.isGlobal === true ? 
        [this.compName] : 
        [window.name, this.compName]
          .concat(compName ? compName.split('.') : []);

    const appState = this.state;   
    let compState = _get(appState, compNameFullSrc); 
    if (compState) {
      return compState;
    }  
    return {};
  }
  get state() {
    return JSON.parse(localStorage.getItem(resumeObjConstants.storageItemName));
  }  
}