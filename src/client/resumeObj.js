import { myCrop } from './functions';
import { get as _get, set as _set } from 'lodash';

export const resumeObjConstants = {
  storageItemName:'resume',
  browserCount: 'browserCount',
};
export class ResumeObj {
  defAppState = {
    [resumeObjConstants.browserCount]: 1,
    leftWindow: {
      // OnePhoto: {},
    },
    rightWindow: undefined,
    // [Print.name]: {},
    // [Share.name]: {},
  };
  
  constructor(
    props = {},
    {
      selector = [],
      val,
    } = props,
  ) {

    this.selector = selector;
    if (this.state === null) {
      this.saveCore({
        val: this.defAppState,
      });      
    }   
    
    if (Object.keys(this.get()).length === 0 &&
      props.hasOwnProperty('selector') && 
      props.hasOwnProperty('val')
    ) {
      this.save({
        val,
      });
    }
  }

  save({ 
    val, 
    selector = this.selector,
  }) { 
    const resumeObj = this.state;
    const selectorObj = _get(
      resumeObj,
      selector,  
      {},    
    ); 
    Object.assign(
      selectorObj,
      val,
    ); 
    _set(
      resumeObj,
      selector,
      selectorObj,
    );

    this.saveCore({
      val: resumeObj,
    });
  }

  saveCore({
    val,
  }) {
    localStorage.setItem(
      resumeObjConstants.storageItemName, 
      JSON.stringify(
        val,
      ),
    );
  }

  saveUpdatedActionLists({
    lists,
  }) {
    const state = this.state;
    const sourceLists = {
      filesToPrint: state.Print,
      filesToShare: state.Share,
    };
    
    Object.entries(lists).forEach(([listName, list]) => {
        if (sourceLists[listName]?.[listName]) sourceLists[listName][listName] = list;
    });

    localStorage.setItem(
      resumeObjConstants.storageItemName,
      JSON.stringify(state),
    );
  }

  saveMerge({
    val,
  }) {
    localStorage.setItem(
      resumeObjConstants.storageItemName,
      JSON.stringify({
        ...this.state,
        ...val,
      }),
    );
  }

  load({
    selector,
  }) {
    return myCrop({
      from: this.state,
      selector,
    });
  }

  get({
    selector = this.selector,
    defVal = {},
  } = {}) {
    return _get(
      this.state,
      selector,
      defVal,
    );
  }

  get state() {
    const storage = localStorage.getItem(resumeObjConstants.storageItemName);
    return storage ? JSON.parse(storage) : this.defAppState;
  }  
}
