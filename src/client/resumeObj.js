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
  compName = '';
  appState = {
    leftWindow: {
      // OnePhoto: {},
    },
    rightWindow: {
    },
    browserCount: 0,
    toPrint: {},
    toShare: {},
  };
  storageItemName = 'resume';
  save(props) {
    const appState = JSON.parse(localStorage.getItem(this.storageItemName));
    Object.assign(
      appState[window.name], 
      {
        [this.compName]: props,
      },
    );      
    localStorage.setItem(this.storageItemName, JSON.stringify(appState));
  }
  load({
    compName = '',
    props,
  }) {
    const appState = JSON.parse(localStorage.getItem(this.storageItemName)) || this.appState;     
    const compNameFullSrc = [window.name, this.compName].concat(compName ? compName.split('.') : []);
    const compState = _get(appState, compNameFullSrc); 
    if (compState) return compState;
    
    _set(
      appState,
      compNameFullSrc,
      props
    );
    localStorage.setItem(
      this.storageItemName, 
      JSON.stringify(
        appState
      )
    );
    return props;
  }
}