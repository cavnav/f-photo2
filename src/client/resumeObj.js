import { 
  get as _get,
  set as _set, 
} from 'lodash';
export class ResumeObj {
  constructor(props) {
    Object.assign(
      this,
      props,
    );
  }
  storageItemName = 'resume';
  compName = '';
  defAppState = this.state || {
    leftWindow: {
      // OnePhoto: {},
    },
    rightWindow: {
    },
    browserCount: 1,
    toPrint: {},
    toShare: {},
  };


  save({ 
    stateUpd, 
    windowName = window.name
  }) { 
    const appStateUpd = this.state;
    Object.assign(
      appStateUpd[windowName], 
      {
        [this.compName]: stateUpd,
      },
    );      
    localStorage.setItem(
      this.storageItemName, 
      JSON.stringify(appStateUpd)
    );
  }
  saveCustom(stateUpd) {
    localStorage.setItem(
      this.storageItemName, 
      JSON.stringify({
        ...this.state,
        ...stateUpd
      })
    );
  }
  load({
    compName = '',
    props,
    helper,
  }) {
    const compNameFullSrc = [window.name, this.compName].concat(compName ? compName.split('.') : []);
    const appState = this.state;   
    if (appState) {      
      let compState = _get(appState, compNameFullSrc); 
      if (compState) {
        if (helper) {
          compState = helper(compState);
        }
        return compState;
      }  
    }
    
    
    const newAppState = _set(
      { ...this.defAppState },
      compNameFullSrc,
      props
    );
    localStorage.setItem(
      this.storageItemName, 
      JSON.stringify(
        newAppState
      )
    );
    return props;
  }
  get state() {
    return JSON.parse(localStorage.getItem(this.storageItemName));
  }  
}